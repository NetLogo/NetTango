// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import type { InteractEvent } from '@interactjs/core/InteractEvent'

import { BlockInstanceUI } from "../../block-instance"
import { DragInProgress } from '../drag-in-progress';
import { ActiveDragData } from "./active-drag-data"

class ClauseDragData extends ActiveDragData {
  parentDefinitionId: number
  parentInstanceId: number
  clauseIndex: number

  constructor(block: BlockInstanceUI, chainIndex: number, blockIndex: number, parentDefinitionId: number, parentInstanceId: number, siblings: BlockInstanceUI[], clauseIndex: number) {
    super(block, chainIndex, blockIndex, siblings)
    this.parentDefinitionId = parentDefinitionId
    this.parentInstanceId   = parentInstanceId
    this.clauseIndex        = clauseIndex
  }

  activate(startEvent: InteractEvent) {
    return new ClauseBlockDrag(this.block, this, startEvent)
  }

}

class ClauseBlockDrag extends DragInProgress {

  readonly draggingBlocks: BlockInstanceUI[]
  readonly dragData: ClauseDragData

  getDraggingBlocks(): BlockInstanceUI[] { return this.draggingBlocks }

  constructor(block: BlockInstanceUI, dragData: ClauseDragData, startEvent: InteractEvent) {
    super(block.workspace, startEvent)
    this.dragData = dragData
    const parentBlock = this.workspace.chains[this.dragData.chainIndex].getBlockInstance(this.dragData.parentDefinitionId, this.dragData.parentInstanceId)
    if (parentBlock === null) {
      throw new Error("Our drag event referenced a block in a clause for a block that doesn't exist?")
    }
    this.draggingBlocks = parentBlock.clauses[this.dragData.clauseIndex].removeBlocks(this.dragData.blockIndex)
    this.draw()
  }

  cancel(): void {
    super.cancel()
    const parentBlock = this.workspace.chains[this.dragData.chainIndex].getBlockInstance(this.dragData.parentDefinitionId, this.dragData.parentInstanceId)
    if (parentBlock === null) {
      throw new Error("Could not find the parent block that owns the clause a block was dragged from.")
    }
    parentBlock.clauses[this.dragData.clauseIndex].insertBlocks(this.dragData.blockIndex, this.draggingBlocks)
  }

}

export { ClauseDragData }
