// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import interact from "interactjs"
import { BlockDefinition } from "../types/types"
import { CodeWorkspaceUI } from "./code-workspace"
import { DragManager } from "./drag-drop/drag-manager"
import { BlockInstanceEvent, BlockDefinitionEvent } from "./program-changed-event"
import { BlockDefinitionUI } from "./block-definition"
import { DropSpot } from "./baubles/drop-spot"
import { ArrayUtils } from "../utils/array-utils"
import { DomUtils } from "../utils/dom-utils"

class BlockMenuUI {

  readonly blocks: BlockDefinition[]
  readonly workspace: CodeWorkspaceUI

  readonly slots: BlockDefinitionUI[]

  color = "rgba(0, 0, 0, 0.2)"

  menuDiv = document.createElement("div")

  constructor(blocks: BlockDefinition[], workspace: CodeWorkspaceUI) {
    this.blocks = blocks
    this.workspace = workspace
    this.slots = blocks.map( (b, i) => new BlockDefinitionUI(b, workspace, i) )
  }

  getBlockById(id: number): BlockDefinition {
    var matches = this.slots.filter( (s) => {
      return s.def.id === id
    })
    if (matches.length === 0) {
      throw new Error(`No block found for ID# ${id}`)
    }
    if (matches.length > 1) {
      throw new Error(`Multiple blocks found with ID# ${id}`)
    }
    return matches[0].def
  }

  draw(): HTMLDivElement {
    this.menuDiv = document.createElement("div")
    this.menuDiv.id = `${this.workspace.containerId}-menu`
    this.menuDiv.classList.add("nt-menu")

    const dropSpot = DropSpot.draw(() => DragManager.slotDrop(0))
    dropSpot.classList.add("nt-menu-slot-wrapper")
    this.menuDiv.append(dropSpot)

    const slotDropNotifier = (j: number) => {
      DragManager.slotDrop(j)
    }

    this.slots.forEach( (slot, i) => {
      this.menuDiv.append(slot.draw(i, slotDropNotifier))
    })

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

  moveSlot(from: number, to: number): void {
    const block = this.blocks[from]
    if (this.slots[from].slotIndex !== from) {
      throw new Error(`Slot index incorrect for: ${from}`)
    }
    ArrayUtils.swap(this.blocks, from, to)
    ArrayUtils.swap(this.slots, from, to)
    this.slots.forEach( (slot, i) => slot.slotIndex = i )
    // The +1's are to skip the top-drop element.
    DomUtils.swapChildren(this.menuDiv, from + 1, to + 1)
    const event = new BlockDefinitionEvent(block.id)
    this.workspace.programChanged(event)
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
      this.workspace.programChanged(new BlockInstanceEvent(changedBlock))
    })
  }

}

export { BlockMenuUI as BlockMenuUI }
