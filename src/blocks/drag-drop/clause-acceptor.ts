// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { BlockInstanceUI } from "../block-instance"
import { ClauseUI } from "../clause"
import { checkAnyOfTags } from "../tags/concrete-tags"
import { checkInheritTags } from "../tags/inherit-tags"
import { DragInProgress } from "./drag-in-progress"
import { DragManager } from "./drag-manager"

class ClauseAcceptor {

  readonly clause: ClauseUI

  constructor(clause: ClauseUI) {
    this.clause = clause
  }

  checker(dropped: boolean): boolean {
    if (!dropped) {
      return dropped
    }
    return DragManager.isValidDrop(this.clause.owner.workspace.containerId, (dragState) => {
      return ClauseAcceptor.isLandingSpot(this.clause, dragState)
    })
  }

  static isLandingSpot(clause: ClauseUI, dragState: DragInProgress): boolean {
    const block          = clause.owner
    const draggingBlocks = dragState.getDraggingBlocks()
    const isOverSelf = block.b.instanceId !== null && draggingBlocks.some( (b) => block.b.instanceId !== null && b.getBlockInstance(block.b.definitionId, block.b.instanceId) !== null )
    if (isOverSelf) {
      return false
    }

    return (
      dragState.canBeChild &&
      checkClauseAllowedTags(clause, draggingBlocks) &&
      (clause.blocks.length === 0 || dragState.isInsertable)
    )
  }
}

function checkClauseAllowedTags(clause: ClauseUI, blocks: BlockInstanceUI[]): boolean {
  switch (clause.def.allowedTags.type) {

    case 'any-of':
      return checkAnyOfTags(clause.def.allowedTags.tags, blocks)

    case 'inherit':
      return checkInheritTags(clause, blocks)

    case 'unrestricted':
      return true

  }
}

export { ClauseAcceptor, checkClauseAllowedTags }
