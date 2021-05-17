// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { ChainUI } from "../chain";
import { checkConcreteTags } from "../tags/concrete-tags";
import { DragInProgress } from "./drag-in-progress";
import { DragManager } from "./drag-manager";

class ChainAcceptor {

  readonly chain: ChainUI

  constructor(chain: ChainUI) {
    this.chain = chain
  }

  checker(dropped: boolean) {
    if (!dropped) {
      return dropped
    }
    return DragManager.isValidDrop(this.chain.workspace.containerId, (dragState) => {
      return ChainAcceptor.isLandingSpot(this.chain, dragState)
    })
  }

  // the only "landing spot" for a chain is the top section
  static isLandingSpot(chain: ChainUI, dragState: DragInProgress): boolean {
    const draggingBlocks = dragState.getDraggingBlocks()
    const block = chain.blocks[0]
    const isOverSelf = block.b.instanceId !== null && draggingBlocks.some( (b) => block.b.instanceId !== null && b.getBlockInstance(block.b.definitionId, block.b.instanceId) !== null )
    if (isOverSelf) {
      return false
    }

    return (
      !chain.blocks[0].canBeStarter &&
      dragState.isInsertable &&
      // not if you're dropping a starter that cannot contain some of my blocks
      checkConcreteTags(draggingBlocks[0].def.allowedTags, chain.blocks)
    )
  }

}

export { ChainAcceptor }
