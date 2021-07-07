// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import type { InteractEvent } from '@interactjs/core/InteractEvent'
import { StringBuffer } from "../utils/string-buffer"
import { StringUtils } from "../utils/string-utils"
import { BlockInstanceUI } from "./block-instance"
import { CodeWorkspaceUI } from "./code-workspace"
import { MenuItemEvent } from "./program-changed-event"
import { DragListener } from "./drag-drop/drag-listener"
import { DragManager } from "./drag-drop/drag-manager"
import { NewDragData } from './drag-drop/drag-data/new-drag-data'
import { BlockDefinition, BlockInstance } from '../types/types'
import { makeAttributeDefault } from './attributes/attribute-factory'

class BlockDefinitionUI {

  readonly def: BlockDefinition
  readonly workspace: CodeWorkspaceUI

  slotIndex: number
  slotDiv: HTMLDivElement = document.createElement("div")
  isAtLimit = false

  constructor(def: BlockDefinition, workspace: CodeWorkspaceUI, slotIndex: number) {
    this.def = def
    this.workspace = workspace
    this.slotIndex = slotIndex
  }

  isAvailable(): boolean {
    const free = this.def.limit - this.workspace.getBlockCount(this.def.id)
    return (this.def.limit <= 0 || free > 0)
  }

  draw(index: number): HTMLDivElement {
    this.slotIndex = index
    this.slotDiv = document.createElement("div")
    this.slotDiv.classList.add("nt-menu-slot")
    const styleClass = BlockInstanceUI.getStyleClass(this.def, this.workspace.containerId)
    this.slotDiv.classList.add(styleClass)
    this.slotDiv.classList.add(`${styleClass}-color`)

    const codeTip = this.formatCodeTip(this.def)
    const titleSpan = `<span title="${codeTip}">${this.def.action}</span>`
    this.slotDiv.insertAdjacentHTML("beforeend", titleSpan)

    if (this.def.blockColor  !== null) { this.slotDiv.style.backgroundColor = this.def.blockColor }
    if (this.def.borderColor !== null) { this.slotDiv.style.borderColor     = this.def.borderColor }
    if (this.def.textColor   !== null) { this.slotDiv.style.color           = this.def.textColor }
    if (this.def.font        !== null) {
      // lineHeight gets reset by the `font` property
      const lineHeight = this.slotDiv.style.lineHeight
      this.slotDiv.style.font       = this.def.font
      this.slotDiv.style.lineHeight = lineHeight
    }

    const dragListener = new DragListener(this.workspace.dragImage, this.slotDiv, "nt-block-dragging", "nt-menu-slot-at-limit")
    dragListener.start = (e: InteractEvent) => this.startDrag(e)
    dragListener.end   = () => this.endDrag()

    this.slotDiv.addEventListener("dblclick", (e) => this.raiseDoubleClick(e) )
    this.slotDiv.addEventListener("contextmenu", (e) => this.raiseContextMenu(e) )
    this.updateForLimit()
    return this.slotDiv
  }

  formatCodeTip(block: BlockDefinition): string {
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
    const newInstance = new BlockInstanceUI(this.def, this.makeInstance(), this.workspace)
    const dragData = new NewDragData(newInstance, this.slotIndex)
    newInstance.draw(dragData)
    DragManager.start(newInstance, dragData, event)
  }

  endDrag(): void {
    DragManager.cancel()
  }

  raiseDoubleClick(e: MouseEvent): void {
    const event = new MenuItemEvent("menu-item-clicked", this.def.id, e.pageX, e.pageY)
    this.workspace.programChanged(event)
  }

  raiseContextMenu(e: MouseEvent): boolean {
    e.preventDefault()
    e.stopPropagation()
    const event = new MenuItemEvent("menu-item-context-menu", this.def.id, e.pageX, e.pageY)
    this.workspace.programChanged(event)
    return false
  }

}

export { BlockDefinitionUI }
