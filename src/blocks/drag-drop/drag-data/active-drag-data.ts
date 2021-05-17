// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { BlockInstanceUI } from "../../block-instance"
import { BlockDragData } from "./block-drag-data"

abstract class ActiveDragData extends BlockDragData {
  chainIndex: number
  blockIndex: number
  siblings: BlockInstanceUI[]

  constructor(block: BlockInstanceUI, chainIndex: number, blockIndex: number, siblings: BlockInstanceUI[]) {
    super(block)
    this.chainIndex = chainIndex
    this.blockIndex = blockIndex
    this.siblings   = siblings
  }

  isLastInCollection(): boolean {
    return this.siblings.length === 0
  }

}

export { ActiveDragData }
