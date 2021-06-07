// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import type { InteractEvent } from '@interactjs/core/InteractEvent'
import interact from "interactjs"

import { FormatAttributeType } from "../nettango"
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '../nettango-defaults'
import { Chain, CodeWorkspace, ExpressionDefinition } from '../types/types'
import { NumUtils } from "../utils/num-utils"
import { VersionManager } from "../versions/version-manager"
import { BlockInstanceUI } from "./block-instance"
import { BlockMenuUI } from "./block-menu"
import { BlockStyleUI } from "./block-style"
import { ChainUI } from "./chain"
import { CodeFormatter } from "./code-formatter"
import { DragListener } from "./drag-drop/drag-listener"
import { DragManager } from "./drag-drop/drag-manager"
import { BlockChangedEvent, ProgramChangedEvent } from "./program-changed-event"

class CodeWorkspaceUI {

  readonly ws: CodeWorkspace

  notifier: null | ((event: ProgramChangedEvent) => void) = null

  readonly containerId: string
  backdrop: HTMLDivElement = document.createElement("div")
  dialog: HTMLDivElement = document.createElement("div")
  container: HTMLDivElement = document.createElement("div")
  spaceDiv: HTMLDivElement = document.createElement("div")
  chainsDiv: HTMLDivElement = document.createElement("div")
  dragImage: HTMLDivElement = document.createElement("div")

  formatter: CodeFormatter

  readonly chains: ChainUI[]
  readonly menu: BlockMenuUI
  readonly expressions: ExpressionDefinition[]

  starterBlockStyle: BlockStyleUI
  containerBlockStyle: BlockStyleUI
  commandBlockStyle: BlockStyleUI

  _height = DEFAULT_HEIGHT
  get height(): number { return this._height }
  set height(h: number) {
    this._height = h
    this.container.style.minHeight = `${this.height}px`
  }
  currentHeight = DEFAULT_HEIGHT

  _width = DEFAULT_WIDTH
  get width(): number { return this._width }
  set width(w: number) {
    this._width = w
    this.container.style.minWidth = `${this.width}px`
    this.container.style.maxWidth = `${this.width}px`
  }

  constructor(containerId: string, ws: CodeWorkspace, language: string, defaultExpressions: ExpressionDefinition[], formatAttribute: FormatAttributeType) {
    this.ws = ws
    this.containerId = containerId
    this.formatter = new CodeFormatter(this, language, formatAttribute)
    this.expressions = defaultExpressions.slice().concat(this.ws.expressions)

    const maybeContainer = document.querySelector(`#${containerId}`)
    if (maybeContainer === null) throw new Error(`No container element with ID ${this.containerId} found.`)
    this.container = maybeContainer as HTMLDivElement
    this.container.innerHTML = ""
    this.container.classList.add("nt-container")

    this.height = ws.height
    this.width  = ws.width

    this.menu = new BlockMenuUI(this.ws.blocks, this)

    if (this.ws.blockStyles === null) {
      this.starterBlockStyle = new BlockStyleUI(BlockStyleUI.DEFAULT_STARTER_STYLE)
      this.containerBlockStyle = new BlockStyleUI(BlockStyleUI.DEFAULT_CONTAINER_STYLE)
      this.commandBlockStyle = new BlockStyleUI(BlockStyleUI.DEFAULT_COMMAND_STYLE)
    } else {
      this.starterBlockStyle = new BlockStyleUI(this.ws.blockStyles.starterBlockStyle)
      this.containerBlockStyle = new BlockStyleUI(this.ws.blockStyles.containerBlockStyle)
      this.commandBlockStyle = new BlockStyleUI(this.ws.blockStyles.commandBlockStyle)
    }

    this.chains = this.ws.program.chains.map( (c, i) => new ChainUI(c, this, i) )
  }

  unload(): void {
    this.chains.splice(0)
  }

  programChanged(event: ProgramChangedEvent): void {
    try {
      this._updateWorkspaceForChanges()
      if (this.notifier !== null) { this.notifier(event.toJS()) }
    } catch (e) {
      console.log("Unable to relay program changed event to Javascript")
      console.log(e)
    }
  }

  exportCode(formatAttributeOverride: FormatAttributeType | null = null): string {
    return this.formatter.formatCode(true, formatAttributeOverride)
  }

  getBlockCount(id: number): number {
    if (this.chains.length === 0) {
      return 0
    }
    return NumUtils.sum(this.chains.map( (c) => c.getBlockCount(id) ))
  }

  getBlockInstance(definitionId: number, instanceId: number): BlockInstanceUI {
    for (var chain of this.chains) {
      const block = chain.getBlockInstance(definitionId, instanceId)
      if (block !== null) {
        return block
      }
    }
    throw new Error(`Block with given definition and instance IDs not found in workspace: ${definitionId} / ${instanceId}`)
  }

  draw(): void {
    const styleId = `${this.containerId}-styles`
    var style = document.getElementById(styleId)
    if (style === null) {
      style = document.createElement("style")
      style.id = styleId
      this.container.append(style)
    }
    const styleSheet = (style as HTMLStyleElement).sheet!
    // the style sheet remains during a restore of workspaces, so clear it
    while (styleSheet.cssRules.length > 0) {
      styleSheet.removeRule(0)
    }

    this.starterBlockStyle.appendToSheet(styleSheet, `${this.containerId}-block-starter`)
    this.containerBlockStyle.appendToSheet(styleSheet, `${this.containerId}-block-container`)
    this.commandBlockStyle.appendToSheet(styleSheet, `${this.containerId}-block-command`)

    const wrapper = document.createElement("div")
    wrapper.classList.add("nt-workspace-wrapper")
    this.container.append(wrapper)

    this.dragImage.id = `${this.containerId}-drag-image`
    this.dragImage.classList.add("nt-block-drag")
    this.dragImage.classList.add("nt-chain")
    wrapper.append(this.dragImage)

    this.backdrop.className = "nt-attribute-backdrop"
    const hideBackdrop = () => this.backdrop.classList.remove("show")
    this.backdrop.addEventListener("click", hideBackdrop)

    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape" && this.backdrop.classList.contains("show")) {
        this.backdrop.classList.remove("show")
      }
    })

    this.dialog = document.createElement("div")
    this.dialog.className = "nt-attribute-dialog"
    this.dialog.addEventListener("click", (e) => e.stopPropagation() )
    this.backdrop.append(this.dialog)
    this.container.append(this.backdrop)

    this.spaceDiv = document.createElement("div")
    this.spaceDiv.id = `${this.containerId}-space`
    this.spaceDiv.classList.add("nt-workspace")

    wrapper.append(this.spaceDiv)

    this.chainsDiv = document.createElement("div")
    this.spaceDiv.append(this.chainsDiv)

    for (var i = 0; i < this.chains.length; i++) {
      const chain = this.chains[i]
      chain.draw(i)
    }

    this.redrawChains()

    const menuDiv = this.menu.draw()
    menuDiv.style.maxHeight = `${this.height}px`
    wrapper.append(menuDiv)

    const spaceDropzone = interact(this.spaceDiv).dropzone({
        accept: ".nt-menu-slot, .nt-block, .nt-cap, .nt-notch"
      , checker: (_1, _2, dropped) => this.checker(dropped)
    })

    spaceDropzone.on("dragenter", () => {
      this.menu.menuDiv.classList.remove("nt-menu-drag-over")
    })
    spaceDropzone.on("drop", (e) => {
      this.drop(e)
    })

    const containerDropzone = interact(this.container).dropzone({
        accept:  ".nt-menu-slot, .nt-block, .nt-cap, .nt-notch"
      , checker: (_1, _2, dropped) => this.checker(dropped)
    })

    containerDropzone.on("dragenter", () => {
      this.menu.menuDiv.classList.add("nt-menu-drag-over")
    })
    containerDropzone.on("dragleave", () => {
      this.menu.menuDiv.classList.remove("nt-menu-drag-over")
    })
    containerDropzone.on("drop", () => {
      this.containerDrop()
    })

    this.updateWorkspaceHeight()
  }

  checker(dropped: boolean): boolean {
    return dropped && DragManager.isValidDrop(this.containerId)
  }

  drop(event: InteractEvent): void {
    DragManager.drop( (blocks, dragStartOffset) => {
      const offset = DragListener.getOffsetToRoot(this.chainsDiv)
      // The casts here are necessary I believe because the type defs are wrong, `dragEvent` does exist on the
      // `InteractEvent` when a drop occurs. -Jeremy B January 2020
      const dropX = ((event as any).dragEvent.page.x as number) - offset.x - dragStartOffset.x
      const dropY = ((event as any).dragEvent.page.y as number) - offset.y - dragStartOffset.y
      this.createChain(blocks, Math.max(dropX, 0), Math.max(dropY, 0))

      const changedBlock = blocks[0]
      this.programChanged(new BlockChangedEvent(changedBlock))
    })
  }

  containerDrop(): void {
    DragManager.drop( (oldBlocks) => {
      this.menu.menuDiv.classList.remove("nt-menu-drag-over")
      const changedBlock = oldBlocks[0]
      this.programChanged(new BlockChangedEvent(changedBlock))
    })
  }

  createChain(newBlocks: BlockInstanceUI[], x: number, y: number): void {
    const newChainIndex = this.chains.length
    const c: Chain = { x, y, blocks: [] }
    const newChain = new ChainUI(c, this, newChainIndex)
    this.ws.program.chains.push(c)
    this.chains.push(newChain)
    const chainDiv = newChain.draw(newChainIndex)
    this.spaceDiv.append(chainDiv)
    newChain.addBlocks(newBlocks)
    newChain.updatePosition(x, y)
  }

  removeChain(chainIndex: number): void {
    const chain = this.chains[chainIndex]
    this.ws.program.chains.splice(chainIndex, 1)
    this.chains.splice(chainIndex, 1)
    chain.div.remove()

    for (var i = 0; i < this.chains.length; i++) {
      const chain = this.chains[i]
      chain.resetDragData(i)
    }
  }

  redrawChains(): void {
    const sortedChains = this.chains.slice(0)
    sortedChains.sort((c1, c2) =>  c1.c.y - c2.c.y)
    this.chainsDiv.innerHTML = ""
    for (var chain of sortedChains) {
      this.chainsDiv.append(chain.div)
    }
  }

  enableDropZones(): void {
    for (var chain of this.chains) {
      chain.enableDropZones()
    }
  }

  disableDropZones(): void {
    for (var chain of this.chains) {
      chain.disableDropZones()
    }
  }

  _updateWorkspaceForChanges(): void {
    this.updateWorkspaceHeight()
    this.resetBlockActionText()
    this.menu.updateLimits()
  }

  updateWorkspaceHeight(): void {
    var maxHeight = this.height; // start with the minimum height from the model
    const containerRect = this.container.getBoundingClientRect()
    for (var chain of this.chains) {
      const rect = chain.div.getBoundingClientRect()
      const childHeight = Math.ceil(rect.bottom - containerRect.top)
      if (childHeight > maxHeight) {
        maxHeight = childHeight
      }
    }
    this.currentHeight = maxHeight + 1
    const newHeight = `${this.currentHeight}px`
    this.spaceDiv.style.minHeight = newHeight
    this.menu.menuDiv.style.maxHeight = newHeight
  }

  resetBlockActionText(): void {
    for (var chain of this.chains) {
      for (var block of chain.blocks) {
        block.resetBlockActionText()
      }
    }
  }

  removeEventListeners(): void {
  }

}

export { CodeWorkspaceUI }
