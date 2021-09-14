// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import interact from "interactjs"
import type { InteractEvent } from '@interactjs/core/InteractEvent'

import { StringBuffer } from "../utils/string-buffer"
import { StringUtils } from "../utils/string-utils"
import { BlockInstanceUI } from "./block-instance"
import { CodeWorkspaceUI } from "./code-workspace"
import { MenuItemEvent } from "../events"
import { DragListener } from "./drag-drop/drag-listener"
import { DragManager } from "./drag-drop/drag-manager"
import { NewDragData } from './drag-drop/drag-data/new-drag-data'
import { BlockDefinition, BlockInstance } from '../types/types'
import { makeAttributeDefault } from './attributes/attribute-factory'
import { EventRouter } from "../event-router"

class BlockDefinitionUI {

  readonly def: BlockDefinition
  readonly containerId: string
  readonly workspace: CodeWorkspaceUI
  readonly enableCodeTips: boolean

  groupIndex: "main" | number
  slotIndex: number
  wrapperDiv: HTMLDivElement = document.createElement("div")
  slotDiv: HTMLDivElement = document.createElement("div")

  constructor(def: BlockDefinition, workspace: CodeWorkspaceUI, groupIndex: "main" | number, slotIndex: number, enableCodeTips: boolean) {
    this.def = def
    this.containerId = workspace.containerId
    this.workspace = workspace
    this.groupIndex = groupIndex
    this.slotIndex = slotIndex
    this.enableCodeTips = enableCodeTips
  }

  isAvailable(): boolean {
    const free = this.def.limit - this.workspace.getBlockCount(this.def.id)
    return (this.def.limit <= 0 || free > 0)
  }

  draw(index: number, slotDropNotifier: (i: number) => void, enableDefinitionChanges: boolean): HTMLDivElement {
    this.slotIndex = index
    this.wrapperDiv.classList.add("nt-menu-slot-wrapper")
    this.wrapperDiv.appendChild(this.slotDiv)

    this.slotDiv.classList.add("nt-menu-slot")
    const styleClass = BlockInstanceUI.getStyleClass(this.def, this.containerId)
    this.slotDiv.classList.add(styleClass)
    this.slotDiv.classList.add(`${styleClass}-color`)
    this.slotDiv.innerText = this.def.action

    if (this.def.blockColor  !== null) { this.slotDiv.style.backgroundColor = this.def.blockColor }
    if (this.def.borderColor !== null) { this.slotDiv.style.borderColor     = this.def.borderColor }
    if (this.def.textColor   !== null) { this.slotDiv.style.color           = this.def.textColor }
    if (this.def.font        !== null) {
      // lineHeight gets reset by the `font` property
      const lineHeight = this.slotDiv.style.lineHeight
      this.slotDiv.style.font       = this.def.font
      this.slotDiv.style.lineHeight = lineHeight
    }

    const cancelClass = enableDefinitionChanges ? null : "nt-menu-slot-at-limit"
    const dragListener = new DragListener(this.workspace.dragImage, this.slotDiv, "nt-block-dragging", cancelClass)
    dragListener.start = (e: InteractEvent) => this.startDrag(e)
    dragListener.end   = () => this.endDrag()

    this.slotDiv.addEventListener("dblclick", (e) => this.raiseDoubleClick(e) )
    this.slotDiv.addEventListener("contextmenu", (e) => this.raiseContextMenu(e) )
    this.updateForLimit()

    if (enableDefinitionChanges) {
      const dropZone = interact(this.wrapperDiv).dropzone({
        accept: ".nt-menu-slot"
      , checker: (_1, _2, dropped) => dropped && DragManager.isInSameWorkspace(this.containerId) && DragManager.isInSameGroup(this.groupIndex)
      })
      dropZone.on("dragenter", () => {
        this.wrapperDiv.classList.add("nt-menu-slot-over")
      })
      dropZone.on("dragleave", () => {
        this.wrapperDiv.classList.remove("nt-menu-slot-over")
      })
      dropZone.on("drop", () => {
        this.wrapperDiv.classList.remove("nt-menu-slot-over")
        slotDropNotifier(this.slotIndex + 1)
      })
    }

    return this.wrapperDiv
  }

  formatCodeTip(): string {
    const out = new StringBuffer()
    if (this.def.note !== null && StringUtils.isNotNullOrEmpty(this.def.note.trimLeft())) {
      out.writeln(this.def.note)
      out.writeln()
    }
    const fakeInstance = this.makeInstance()
    this.workspace.formatter.formatBlock(out, 0, { def: this.def, b: fakeInstance })
    const value = out.toString().trim()
    const escapedValue = StringUtils.escapeHtml(value)
    return escapedValue
  }

  updateForLimit(): void {
    if (this.isAvailable()) {
      this.slotDiv.classList.remove("nt-menu-slot-at-limit")
    } else {
      this.slotDiv.classList.add("nt-menu-slot-at-limit")
    }
  }

  static makeInstance(b: BlockDefinition, instanceId: number): BlockInstance {
    return {
      definitionId:      b.id
    , instanceId:        instanceId
    , clauses:           b.clauses.map( (c) => { return { blocks: [] } } )
    , params:            b.params.map( (a) => makeAttributeDefault(a) )
    , properties:        b.properties.map( (a) => makeAttributeDefault(a) )
    , propertiesDisplay: "shown"
    }
  }

  makeInstance(): BlockInstance {
    return BlockDefinitionUI.makeInstance(this.def, this.workspace.getBlockCount(this.def.id))
  }

  startDrag(event: InteractEvent): void {
    const newInstance = new BlockInstanceUI(this.def, this.makeInstance(), this.workspace, this.enableCodeTips)
    const dragData = new NewDragData(newInstance, this.groupIndex, this.slotIndex, this.isAvailable())
    if (this.isAvailable()) {
      newInstance.draw(dragData)
    } else {
      newInstance.drawStub(dragData)
    }
    DragManager.start(newInstance, dragData, event)
  }

  endDrag(): void {
    DragManager.cancel()
  }

  raiseDoubleClick(e: MouseEvent): void {
    const event: MenuItemEvent = {
      type: "menu-item-clicked"
    , containerId: this.containerId
    , groupIndex:  this.groupIndex
    , slotIndex:   this.slotIndex
    , blockId:     this.def.id
    , x:           e.pageX
    , y:           e.pageY
    }
    EventRouter.fireEvent(event)
  }

  raiseContextMenu(e: MouseEvent): boolean {
    e.preventDefault()
    e.stopPropagation()
    const event: MenuItemEvent = {
      type: "menu-item-context-menu"
    , containerId: this.containerId
    , groupIndex:  this.groupIndex
    , slotIndex:   this.slotIndex
    , blockId:     this.def.id
    , x:           e.pageX
    , y:           e.pageY
    }
    EventRouter.fireEvent(event)
    return false
  }

}

export { BlockDefinitionUI }
