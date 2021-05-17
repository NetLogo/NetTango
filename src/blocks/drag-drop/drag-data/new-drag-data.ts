// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import type { InteractEvent } from '@interactjs/core/InteractEvent'

import { BlockInstanceUI } from "../../block-instance"
import { DragInProgress } from '../drag-in-progress';
import { BlockDragData } from "./block-drag-data"

class NewDragData extends BlockDragData {
  slotIndex: number

  constructor(block: BlockInstanceUI, index: number) {
    super(block)
    this.slotIndex   = index
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
    this.draw(false)
  }

  getDraggingBlocks(): BlockInstanceUI[] { return this.draggingBlocks }

  cancel(): void {
    super.cancel()
    const slot = this.workspace.menu.slots[this.dragData.slotIndex]
    slot.slotDiv.classList.remove("nt-block-dragging")
  }

  drop(): void {
    super.drop()
    const slot = this.workspace.menu.slots[this.dragData.slotIndex]
    slot.slotDiv.classList.remove("nt-block-dragging")
  }

}

export { NewDragData }
