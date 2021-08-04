// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import interact from "interactjs"
import type { InteractEvent } from '@interactjs/core/InteractEvent'

import { BlockInstanceUI } from "./block-instance"
import { BlockCollection } from "./block-collection"
import { CodeWorkspaceUI } from "./code-workspace"
import { ChainAcceptor } from "./drag-drop/chain-acceptor"
import { ChainDragData } from "./drag-drop/drag-data/chain-drag-data"
import { DragListener } from "./drag-drop/drag-listener"
import { DragManager } from "./drag-drop/drag-manager"
import { createBlockInstanceEvent } from "./program-changed-event"
import { Chain } from "../types/types"
import { Cap } from "./baubles/cap"
import { ChainDraw } from "./chain-draw"
import { EventRouter } from "../event-router"

class ChainUI extends BlockCollection {

  static readonly FRAGMENT_HEIGHT = 40

  readonly c: Chain
  readonly workspace: CodeWorkspaceUI

  chainIndex: number

  fragmentDiv = document.createElement("div")

  get isFragment(): boolean { return this.blocks.length === 0 || !this.blocks[0].canBeStarter }

  constructor(c: Chain, workspace: CodeWorkspaceUI, chainIndex: number) {
    super(c.blocks, workspace)
    this.c = c
    this.workspace = workspace
    this.chainIndex = chainIndex
  }

  draw(newChainIndex: number): HTMLDivElement {
    this.chainIndex = newChainIndex

    this.fragmentDiv = document.createElement("div")
    this.fragmentDiv.classList.add("nt-fragment")
    const acceptor = new ChainAcceptor(this)
    const fragmentDropzone = interact(this.fragmentDiv).dropzone({
      accept: ".nt-menu-slot, .nt-block, .nt-cap, .nt-notch"
      , checker: (_1, _2, dropped) => acceptor.checker(dropped)
    })
    fragmentDropzone.on("drop", (e) => this.drop(e) )
    fragmentDropzone.on("dragenter", () => {
      this.fragmentDiv.classList.add("nt-drag-over")
    } )
    fragmentDropzone.on("dragleave", () => {
      this.fragmentDiv.classList.remove("nt-drag-over")
    } )

    this.div = document.createElement("div")
    this.div.classList.add("nt-chain")

    if (this.blocks.length === 0) {
      return this.div
    }

    for (var i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i]
      const dragData = new ChainDragData(block, this.chainIndex, i, this.blocks.slice(i + 1))
      block.draw(dragData)
    }

    ChainDraw.draw(Cap.draw, this.div, this.blocks, this.fragmentDiv)

    this.updatePosition(this.c.x, this.c.y)

    return this.div
  }

  updatePosition(x: number, y: number): void {
    this.c.x = x
    this.c.y = y
    this.div.style.left = `${x}px`
    this.div.style.top  = `${y}px`
  }

  resetDragData(newChainIndex: number): void {
    this.chainIndex = newChainIndex
    for (var i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i]
      block.dragData = new ChainDragData(block, this.chainIndex, i, this.blocks.slice(i + 1))
      block.resetOwnedBlocksDragData()
    }
  }

  redrawBlocks(): void {
    for (var i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i]
      block.dragData = new ChainDragData(block, this.chainIndex, i, this.blocks.slice(i + 1))
      block.resetOwnedBlocksDragData()
    }
    ChainDraw.draw(Cap.draw, this.div, this.blocks, this.fragmentDiv)
  }

  addBlocks(newBlocks: BlockInstanceUI[]): void {
    this.insertBlocks(this.blocks.length, newBlocks)
  }

  enableDropZones(): void {
    if (DragManager.isValidDrop(this.containerId, (dragState) => ChainAcceptor.isLandingSpot(this, dragState))) {
      this.div.classList.add("nt-allowed-drop")
    }

    if (this.isFragment) {
      this.fragmentDiv.classList.add("show")
      const top = Math.round(this.c.y) - ChainUI.FRAGMENT_HEIGHT
      this.div.style.top = `${top}px`
    }

    for (var block of this.blocks) {
      block.enableDropZones()
    }
  }

  disableDropZones(): void {
    this.div.classList.remove("nt-allowed-drop")

    this.fragmentDiv.classList.remove("show")
    const top = Math.round(this.c.y)
    this.div.style.top = `${top}px`

    for (var block of this.blocks) {
      block.disableDropZones()
    }
  }

  drop(event: InteractEvent): void {
    DragManager.drop( (newBlocks, dragStartOffset) => {
      this.fragmentDiv.classList.remove("nt-drag-over")
      const newFirst = newBlocks[0]
      const offset = DragListener.getOffset(this.div)
      // The casts here are necessary I believe because the type defs are wrong, `dragEvent` does exist on the
      // `InteractEvent` when a drop occurs. -Jeremy B January 2020
      const dropY = ((event as any).dragEvent.page.y as number) - offset.y - dragStartOffset.y
      this.c.y = this.c.y - ChainUI.FRAGMENT_HEIGHT + Math.floor(dropY)
      this.insertBlocks(0, newBlocks)
      EventRouter.fireEvent(createBlockInstanceEvent(newFirst))
    })
  }

}

export { ChainUI as ChainUI }
