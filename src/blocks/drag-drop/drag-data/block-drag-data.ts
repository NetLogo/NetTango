// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import type { InteractEvent } from '@interactjs/core/InteractEvent'

import { BlockInstanceUI } from '../../block-instance';
import { DragInProgress } from '../drag-in-progress';

abstract class BlockDragData {
  readonly block: BlockInstanceUI

  constructor(block: BlockInstanceUI) {
    this.block = block
  }

  abstract isLastInCollection(): boolean
  abstract activate(startEvent: InteractEvent): DragInProgress

}

export { BlockDragData }
