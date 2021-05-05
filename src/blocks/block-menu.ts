// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetTango/NetTango

import interact from "interactjs"
import { BlockInput } from "../types/types"
import { CodeWorkspace } from "./code-workspace"
import { DragManager } from "./drag-drop/drag-manager"
import { BlockChangedEvent } from "./program-changed-event"
import { Slot } from "./slot"

/**
 * Visual programming menu bar
 */
class BlockMenu {

  readonly blocks: BlockInput[]
  readonly workspace: CodeWorkspace

  readonly slots: Slot[]

  /// Menu background color
  color = "rgba(0, 0, 0, 0.2)"

  menuDiv = document.createElement("div")

  constructor(blocks: BlockInput[], workspace: CodeWorkspace) {
    this.blocks = blocks
    this.workspace = workspace
    this.slots = blocks.map( (b, i) => new Slot(b, workspace, i) )
  }

  getBlockById(id: number): BlockInput | null {
    var matches = this.slots.filter( (s) => {
      return s.b.id === id
    })
    if (matches.length > 0) {
      return matches[0].b
    }
    return null
  }

  draw(): HTMLDivElement {
    this.menuDiv = document.createElement("div")
    this.menuDiv.id = `${this.workspace.containerId}-menu`
    this.menuDiv.classList.add("nt-menu")

    for (var i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i]
      this.menuDiv.append(slot.draw(i))
    }

    const dropZone = interact(this.menuDiv).dropzone({
      accept:  ".nt-menu-slot, .nt-block, .nt-cap, .nt-notch"
    , checker: (_1, _2, dropped) => this.workspace.checker(dropped)
    })

    dropZone.on("dragenter", () => {
      this.menuDiv.classList.add("nt-menu-drag-over")
    })
    dropZone.on("dragleave", () => {
      this.menuDiv.classList.remove("nt-menu-drag-over")
    })
    dropZone.on("drop", () => {
      this.drop()
    })

    this.updateLimits()

    return this.menuDiv
  }

  updateLimits(): void {
    for (var slot of this.slots) {
      slot.updateForLimit()
    }
  }

  drop(): void {
    DragManager.drop( (oldBlocks) => {
      this.menuDiv.classList.remove("nt-menu-drag-over")
      const changedBlock = oldBlocks[0]
      this.workspace.programChanged(new BlockChangedEvent(changedBlock))
    })
  }

}

export { BlockMenu }
