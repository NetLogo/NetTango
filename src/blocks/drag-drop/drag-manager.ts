// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import type { InteractEvent } from '@interactjs/core/InteractEvent'
import type { Point } from '@interactjs/types/index'

import { BlockInstanceUI } from "../block-instance"
import { BlockDragData } from "./drag-data/block-drag-data"
import { DragInProgress } from './drag-in-progress'

class DragManager {

  private static currentDrag: DragInProgress | null = null

  // Just to try to make it clear this class isn't meant to be instantiated. -Jeremy B January 2021
  private constructor() {}

  static start(block: BlockInstanceUI, dragData: BlockDragData, startEvent: InteractEvent): void {
    if (DragManager.currentDrag !== null) {
      return
    }

    DragManager.currentDrag = dragData.activate(startEvent)
    block.workspace.enableDropZones()
  }

  static cancel(blockHandler: (blocks: BlockInstanceUI[]) => void = () => {}): void {
    if (DragManager.currentDrag === null) {
      return
    }

    const drag = DragManager.currentDrag
    drag.workspace.disableDropZones()

    const blocks = drag.getDraggingBlocks()
    DragManager.currentDrag = null
    drag.cancel()
    blockHandler(blocks)
  }

  static drop(blockHandler: (blocks: BlockInstanceUI[], dragStartOffset: Point) => void = () => {}): void {
    if (DragManager.currentDrag === null) {
      return
    }

    const drag = DragManager.currentDrag
    drag.workspace.disableDropZones()

    DragManager.currentDrag = null
    const blocks = drag.getDraggingBlocks()
    drag.drop()
    blockHandler(blocks, drag.dragStartOffset)
  }

  static slotDrop(dropIndex: number) {
    if (DragManager.currentDrag === null) {
      return
    }

    const drag = DragManager.currentDrag
    drag.workspace.disableDropZones()

    DragManager.currentDrag = null
    drag.slotDrop(dropIndex)
  }

  static isInSameWorkspace(containerId: string): boolean {
    if (DragManager.currentDrag === null) {
      return false
    }

    return containerId === DragManager.currentDrag.workspace.containerId
  }

  static isValidDrop(containerId: string, dragHandler: (dragState: DragInProgress) => boolean = () => { return true }): boolean {
    if (DragManager.currentDrag === null) {
      return false
    }

    return DragManager.isInSameWorkspace(containerId) &&
      DragManager.currentDrag.isWorkspaceDroppable() &&
      dragHandler(DragManager.currentDrag)
  }

}

export { DragManager }
