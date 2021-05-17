// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import type { InteractEvent } from '@interactjs/core/InteractEvent'
import type { Point } from '@interactjs/types/index'

import { ArrayUtils } from '../../utils/array-utils'
import { DragCap } from '../baubles/drag-cap'
import { BlockInstanceUI } from "../block-instance"
import { ChainDraw } from '../chain-draw'
import { CodeWorkspaceUI } from "../code-workspace"
import { DragListener } from './drag-listener'

abstract class DragInProgress {

  readonly workspace: CodeWorkspaceUI
  readonly dragStartOffset: Point

  constructor(workspace: CodeWorkspaceUI, startEvent: InteractEvent) {
    this.workspace       = workspace
    const offset         = DragListener.getOffsetToRoot(startEvent.target as HTMLElement)
    this.dragStartOffset = { x: startEvent.pageX - offset.x, y: startEvent.pageY - offset.y }
  }

  abstract getDraggingBlocks(): BlockInstanceUI[]

  cancel() {}
  drop() {}

  get canBeChild(): boolean   { return ArrayUtils.ifNotNullOrEmpty(this.getDraggingBlocks(), (a) => a[0].canBeChild, false) }
  get canBeStarter(): boolean { return ArrayUtils.ifNotNullOrEmpty(this.getDraggingBlocks(), (a) => a[0].canBeStarter, false) }
  get isInsertable(): boolean { return ArrayUtils.ifNotNullOrEmpty(this.getDraggingBlocks(), (a) => a[a.length - 1].isAttachable, false) }

  protected draw(useClones: boolean): void {
    ChainDraw.draw(DragCap.draw, this.workspace.dragImage, this.getDraggingBlocks(), useClones)
  }

}

export { DragInProgress }
