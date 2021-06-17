// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import type { InteractEvent } from '@interactjs/core/InteractEvent'

import { BlockInstanceUI } from "../../block-instance";
import { DragInProgress } from '../drag-in-progress';
import { ActiveDragData } from "./active-drag-data";
import { NumUtils } from '../../../utils/num-utils';

class ChainDragData extends ActiveDragData {
  block: BlockInstanceUI

  constructor(block: BlockInstanceUI, chainIndex: number, blockIndex: number, siblings: BlockInstanceUI[]) {
    super(block, chainIndex, blockIndex, siblings)
    this.block = block
  }

  activate(startEvent: InteractEvent) {
    if (this.blockIndex === 0) {
      return new WholeChainDrag(this.block, this, startEvent)
    } else {
      return new ChainBlockDrag(this.block, this, startEvent)
    }
  }
}

class ChainBlockDrag extends DragInProgress {

  readonly draggingBlocks: BlockInstanceUI[]
  readonly dragData: ChainDragData

  getDraggingBlocks(): BlockInstanceUI[] { return this.draggingBlocks }

  constructor(block: BlockInstanceUI, dragData: ChainDragData, startEvent: InteractEvent) {
    super(block.workspace, startEvent)
    this.dragData = dragData
    this.draggingBlocks = this.workspace.chains[this.dragData.chainIndex].removeBlocks(this.dragData.blockIndex)
    this.draw()
  }

  cancel(): void {
    super.cancel()
    this.workspace.chains[this.dragData.chainIndex].insertBlocks(this.dragData.blockIndex, this.draggingBlocks)
  }

}

class WholeChainDrag extends DragInProgress {

  private readonly oldChainX: number
  private readonly oldChainY: number

  readonly draggingBlocks: BlockInstanceUI[]
  readonly dragData: ChainDragData

  getDraggingBlocks(): BlockInstanceUI[] { return this.draggingBlocks }

  constructor(block: BlockInstanceUI, dragData: ChainDragData, startEvent: InteractEvent) {
    super(block.workspace, startEvent)
    this.dragData  = dragData
    const oldChain = this.workspace.chains[dragData.chainIndex]
    this.oldChainX = oldChain.c.x
    this.oldChainY = oldChain.c.y
    this.draggingBlocks = oldChain.blocks
    this.workspace.removeChain(dragData.chainIndex)
    this.draw()
  }

  cancel(): void {
    super.cancel()
    this.workspace.createChain(this.draggingBlocks, NumUtils.toInt(this.oldChainX, 0), NumUtils.toInt(this.oldChainY, 0))
  }

}

export { ChainDragData }
