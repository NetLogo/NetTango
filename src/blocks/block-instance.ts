// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import interact from "interactjs"
import type { InteractEvent } from '@interactjs/core/InteractEvent'

import { NumUtils } from "../utils/num-utils"
import { StringBuffer } from "../utils/string-buffer"
import { StringUtils } from "../utils/string-utils"
import { AttributeUI } from "./attributes/attribute"
import { Arrow } from "./baubles/arrow"
import { Toggle } from "./baubles/toggle"
import { ClauseUI } from "./clause"
import { CodeWorkspaceUI } from "./code-workspace"
import { BlockAcceptor } from "./drag-drop/block-acceptor"
import { BlockDragData } from "./drag-drop/drag-data/block-drag-data"
import { ChainDragData } from "./drag-drop/drag-data/chain-drag-data"
import { NewDragData } from "./drag-drop/drag-data/new-drag-data"
import { BlockInstanceEvent } from "./program-changed-event"
import { DragManager } from "./drag-drop/drag-manager"
import { ClauseDragData } from "./drag-drop/drag-data/clause-drag-data"
import { DragListener } from "./drag-drop/drag-listener"
import { BlockDefinition, BlockInstance } from "../types/types"
import { createAttribute } from "./attributes/attribute-factory"
import { BlockRules } from "./block-rules"

class BlockInstanceUI {

  readonly def: BlockDefinition
  readonly b: BlockInstance

  params: Array<AttributeUI> = []
  properties: Array<AttributeUI> = []

  get hasParams(): boolean { return this.params.length > 0 }
  get hasProperties(): boolean { return this.properties.length > 0 }

  clauses: ClauseUI[] = []
  get hasClauses(): boolean {
    return BlockRules.hasClauses(this.def)
  }

  get isAttachable(): boolean { return !this.def.isTerminal }

  get canBeChild(): boolean {
    return BlockRules.canBeChild(this.def)
  }
  get canBeStarter(): boolean {
    return BlockRules.canBeStarter(this.def)
  }

  workspace: CodeWorkspaceUI

  dragData: BlockDragData = new NewDragData(this, 0, false)
  acceptor: BlockAcceptor = new BlockAcceptor(this)
  blockDiv = document.createElement("div")
  actionDiv = document.createElement("div")
  propertiesToggle: Toggle | null = null

  constructor(def: BlockDefinition, b: BlockInstance, workspace: CodeWorkspaceUI) {
    this.def = def
    this.b = b
    this.workspace = workspace

    this.clauses = b.clauses.map( (c, i) => new ClauseUI(def.clauses[i], c, this, i) )
    this.params = b.params.map( (p, j) => createAttribute(j, def.params[j], p, this, false) )
    this.properties = b.properties.map( (p, j) => createAttribute(j, def.properties[j], p, this, true) )
  }

  getBlockCount(id: number): number {
    var count: number = 0
    if (this.b.definitionId === id) { count++ }
    if (this.hasClauses) {
      count = count + NumUtils.sum(this.clauses.map( (clause) => clause.getBlockCount(id) ))
    }
    return count
  }

  getBlockInstance(definitionId: number, instanceId: number): BlockInstanceUI | null {
    if (this.b.definitionId === definitionId && this.b.instanceId === instanceId) {
      return this
    }
    for (var clause of this.clauses) {
      const clauseBlock = clause.getBlockInstance(definitionId, instanceId)
      if (clauseBlock !== null) { return clauseBlock }
    }
    return null
  }

  static getStyleClass(b: BlockDefinition, containerId: string): string {
    if (BlockRules.canBeStarter(b)) {
      return `${containerId}-block-starter`
    }
    if (BlockRules.hasClauses(b)) {
      return `${containerId}-block-container`
    }
    return `${containerId}-block-command`

  }

  getStyleClass(): string {
    return BlockInstanceUI.getStyleClass(this.def, this.workspace.containerId)
  }

  draw(dragData: BlockDragData): HTMLDivElement {
    this.dragData = dragData

    this.blockDiv = document.createElement("div")
    this.blockDiv.classList.add("nt-block")
    const styleClass = this.getStyleClass()
    this.blockDiv.classList.add(styleClass)
    if (this.hasClauses) {
      this.blockDiv.classList.add("nt-block-with-clauses")
    }

    BlockRules.applyStyleOverrides(this.def, this.blockDiv)

    const headerDiv = document.createElement("div")
    headerDiv.classList.add(`${styleClass}-color`)
    BlockRules.maybeSetColorOverride(this.def.blockColor, headerDiv)
    headerDiv.classList.add("nt-block-header")
    this.blockDiv.append(headerDiv)

    this.actionDiv = document.createElement("div")
    this.updateActionText()
    this.actionDiv.classList.add("nt-block-action")
    headerDiv.append(this.actionDiv)

    const paramDiv = document.createElement("div")
    paramDiv.classList.add("nt-block-params")
    headerDiv.append(paramDiv)

    for (var attribute of this.params.values()) {
      paramDiv.append(attribute.drawParameter())
    }

    const propertiesDiv = document.createElement("div")
    propertiesDiv.classList.add("nt-block-properties")
    headerDiv.append(propertiesDiv)

    if (this.hasProperties) {
      this.propertiesToggle = new Toggle(this.b.propertiesDisplay !== "hidden", (isOn) => {
        this.b.propertiesDisplay = isOn ? "shown" : "hidden"
        propertiesDiv.classList.toggle("nt-block-properties-hidden")
        this.workspace.programChanged(new BlockInstanceEvent(this))
      })
      if (this.b.propertiesDisplay === "hidden") {
        propertiesDiv.classList.add("nt-block-properties-hidden")
      }
      this.actionDiv.append(this.propertiesToggle.div)
    }

    for (var attribute of this.properties.values()) {
      const propertyDiv = attribute.drawProperty()
      propertyDiv.classList.add(`${styleClass}-color`)
      BlockRules.maybeSetColorOverride(this.def.blockColor, propertyDiv)
      propertiesDiv.append(propertyDiv)
    }

    if (this.hasClauses) {
      const firstClauseDiv = this.clauses[0].draw(this, headerDiv)
      this.blockDiv.append(firstClauseDiv)

      for (var clause of this.clauses.slice(1)) {
        const clauseDiv = clause.draw(this, null)
        this.blockDiv.append(clauseDiv)
      }

      const clauseFooter = document.createElement("div")
      clauseFooter.classList.add("nt-clause-footer")
      clauseFooter.classList.add(`${styleClass}-color`)
      BlockRules.maybeSetColorOverride(this.def.blockColor, clauseFooter)
      this.blockDiv.append(clauseFooter)
    }

    if (this.isAttachable) {
      const arrow = Arrow.draw()
      this.blockDiv.append(arrow)
    }

    BlockInstanceUI.wireDragEvents(this, this.blockDiv)

    return this.blockDiv
  }

  static wireDragEvents(block: BlockInstanceUI, div: HTMLDivElement): void {
    const dragListener = new DragListener(block.workspace.dragImage, div)
    dragListener.start = (e: InteractEvent) => block.startDrag(e)
    dragListener.end   = () => block.endDrag()

    const dropzone = interact(div).dropzone({
        accept: ".nt-menu-slot, .nt-block, .nt-cap, .nt-notch"
      , checker: (_1, _2, dropped) => block.acceptor.checker(dropped)
    })
    dropzone.on("drop", () => block.drop() )
    dropzone.on("dragenter", () => {
      block.blockDiv.classList.add("nt-drag-over")
    })
    dropzone.on("dragleave", () => {
      block.blockDiv.classList.remove("nt-drag-over")
    })
  }

  updateActionText(): void {
    const codeTip = this.formatCodeTip()
    this.actionDiv.insertAdjacentHTML("beforeend", `<span title="${codeTip}">${this.def.action}</span>`)
  }

  formatCodeTip(): string {
    const out = new StringBuffer()
    if (this.def.note !== null && StringUtils.isNotNullOrEmpty(this.def.note.trimLeft())) {
      out.writeln(this.def.note)
      out.writeln()
    }
    if (this.dragData instanceof ChainDragData) {
      const chain = this.workspace.chains[this.dragData.chainIndex]
      const chainBlocks = chain.blocks.map( (block) => { return { def: block.def, b: block.b }} )
      this.workspace.formatter.formatChainBlocks(out, chainBlocks, this.workspace.ws.chainOpen, this.workspace.ws.chainClose)
      // if this block isn't a valid chain starter, nothing may have been written
      if (out.isEmpty) {
        this.workspace.formatter.formatBlock(out, 0, { def: this.def, b: this.b })
      }
    } else {
      this.workspace.formatter.formatBlock(out, 0, { def: this.def, b: this.b })
    }
    const value = out.toString().trim()
    const escapedValue = StringUtils.escapeHtml(value)
    return escapedValue
  }

  startDrag(event: InteractEvent): void {
    DragManager.start(this, this.dragData, event)
  }

  endDrag(): void {
    DragManager.cancel()
  }

  drop(): void {
    DragManager.drop( (newBlocks) => {
      this.blockDiv.classList.remove("nt-drag-over")

      if (this.dragData instanceof ChainDragData) {
        this.workspace.chains[this.dragData.chainIndex].insertBlocks(this.dragData.blockIndex + 1, newBlocks)
      }

      if (this.dragData instanceof ClauseDragData) {
        const parentBlock = this.workspace.chains[this.dragData.chainIndex].getBlockInstance(this.dragData.parentDefinitionId, this.dragData.parentInstanceId)
        if (parentBlock === null) {
          throw new Error("Could not find parent block?")
        }
        parentBlock.clauses[this.dragData.clauseIndex].insertBlocks(this.dragData.blockIndex + 1, newBlocks)
      }

      const changedBlock = newBlocks[0]
      this.workspace.programChanged(new BlockInstanceEvent(changedBlock))
    })
  }

  enableDropZones(): void {
    if (DragManager.isValidDrop(this.workspace.containerId, (dragState) => BlockAcceptor.isLandingSpot(this, dragState))) {
      this.blockDiv.classList.add("nt-allowed-drop")
    }

    for (var clause of this.clauses) {
      clause.enableDropZones()
    }
  }

  disableDropZones(): void {
    this.blockDiv.classList.remove("nt-allowed-drop")

    for (var clause of this.clauses) {
      clause.disableDropZones()
    }
  }

  resetOwnedBlocksDragData(): void {
    for (var clause of this.clauses) {
      clause.resetOwned()
    }
  }

  resetBlockActionText(): void {
    this.actionDiv.innerHTML = ""
    this.updateActionText()
    if (this.propertiesToggle !== null) {
      this.actionDiv.append(this.propertiesToggle.div)
    }
    for (var clause of this.clauses) {
      for (var block of clause.blocks) {
        block.resetBlockActionText()
      }
    }
  }

}

export { BlockInstanceUI }
