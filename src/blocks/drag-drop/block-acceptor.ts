// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { BlockInstanceUI } from "../block-instance";
import { checkConcreteTags } from "../tags/concrete-tags";
import { checkClauseAllowedTags } from "./clause-acceptor";
import { ChainDragData } from "./drag-data/chain-drag-data";
import { ClauseDragData } from "./drag-data/clause-drag-data";
import { NewDragData } from "./drag-data/new-drag-data";
import { DragInProgress } from "./drag-in-progress";
import { DragManager } from "./drag-manager";

class BlockAcceptor {

  readonly block: BlockInstanceUI

  constructor(block: BlockInstanceUI) {
    this.block = block
  }

  checker(dropped: boolean): boolean {
    if (!dropped || this.block.dragData instanceof NewDragData) {
      return dropped
    }
    return DragManager.isValidDrop(this.block.containerId, (dragState) => {
      return BlockAcceptor.isLandingSpot(this.block, dragState)
    })
  }

  static isLandingSpot(block: BlockInstanceUI, dragState: DragInProgress): boolean {
    const draggingBlocks = dragState.getDraggingBlocks()
    const isOverSelf = block.b.instanceId !== null && draggingBlocks.some( (b) => block.b.instanceId !== null && b.getBlockInstance(block.b.definitionId, block.b.instanceId) !== null )
    if (isOverSelf) {
      return false
    }

    const areTagsAllowed = BlockAcceptor.checkBlocks(block, draggingBlocks)
    const isPositionOkay = block.dragData.isLastInCollection() || dragState.isInsertable
    return dragState.canBeChild && block.isAttachable && areTagsAllowed && isPositionOkay
  }

  static checkBlocks(block: BlockInstanceUI, blocks: BlockInstanceUI[]): boolean {
    if (block.dragData instanceof NewDragData) {
      throw new Error("Should not have a new block accepting drags, they are unplaced blocks from menu slots.");
    }

    if (block.dragData instanceof ChainDragData) {
      return checkConcreteTags(block.workspace.chains[block.dragData.chainIndex].blocks[0].def.allowedTags, blocks)
    }

    if (block.dragData instanceof ClauseDragData) {
      return checkClauseAllowedTags(block.workspace.getBlockInstance(block.dragData.parentDefinitionId, block.dragData.parentInstanceId).clauses[block.dragData.clauseIndex], blocks)
    }

    throw new Error(`Unknown block drag data type: ${block.dragData}`)
  }

}

export { BlockAcceptor }
