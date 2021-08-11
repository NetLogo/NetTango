// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import type { InteractEvent } from '@interactjs/core/InteractEvent'

import { BlockInstanceUI } from "../../block-instance"
import { DragInProgress } from '../drag-in-progress';
import { BlockDragData } from "./block-drag-data"

class NewDragData extends BlockDragData {
  groupIndex: "main" | number
  slotIndex: number
  isAvailable: boolean

  constructor(block: BlockInstanceUI, groupIndex: "main" | number, slotIndex: number, isAvailable: boolean) {
    super(block)
    this.groupIndex  = groupIndex
    this.slotIndex   = slotIndex
    this.isAvailable = isAvailable
  }

  isLastInCollection(): boolean {
    return true
  }

  activate(startEvent: InteractEvent): DragInProgress {
    return new NewBlockDrag(this.block, this, startEvent)
  }

}

class NewBlockDrag extends DragInProgress {

  readonly draggingBlocks: BlockInstanceUI[]
  readonly dragData: NewDragData

  constructor(block: BlockInstanceUI, dragData: NewDragData, startEvent: InteractEvent) {
    super(block.workspace, startEvent)
    this.draggingBlocks = [block]
    this.dragData       = dragData
    this.draw()
  }

  getDraggingBlocks(): BlockInstanceUI[] { return this.draggingBlocks }

  isWorkspaceDroppable(): boolean {
    return this.dragData.isAvailable
  }

  isGroupDroppable(groupIndex: "main" | number): boolean {
    return this.dragData.groupIndex === groupIndex
  }

  cancel(): void {
    super.cancel()
    const slot = this.workspace.menu.getSlot(this.dragData.groupIndex, this.dragData.slotIndex)
    slot.slotDiv.classList.remove("nt-block-dragging")
  }

  drop(): void {
    super.drop()
    const slot = this.workspace.menu.getSlot(this.dragData.groupIndex, this.dragData.slotIndex)
    slot.slotDiv.classList.remove("nt-block-dragging")
  }

  slotDrop(dropIndex: number): void {
    super.slotDrop(dropIndex)
    const slot = this.workspace.menu.getSlot(this.dragData.groupIndex, this.dragData.slotIndex)
    slot.slotDiv.classList.remove("nt-block-dragging")
    this.workspace.menu.moveSlot(this.dragData.groupIndex, this.dragData.slotIndex, dropIndex)
  }

}

export { NewDragData }
