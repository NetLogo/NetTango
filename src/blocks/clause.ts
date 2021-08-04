// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import interact from "interactjs"

import { StringUtils } from "../utils/string-utils"
import { Arrow } from "./baubles/arrow"
import { Notch } from "./baubles/notch"
import { BlockInstanceUI } from "./block-instance"
import { BlockCollection } from "./block-collection"
import { ClauseAcceptor } from "./drag-drop/clause-acceptor"
import { ActiveDragData } from "./drag-drop/drag-data/active-drag-data"
import { ClauseDragData } from "./drag-drop/drag-data/clause-drag-data"
import { DragManager } from "./drag-drop/drag-manager"
import { createBlockInstanceEvent } from "./program-changed-event"
import { Clause, ClauseInstance } from "../types/types"
import { BlockRules } from "./block-rules"
import { EventRouter } from "../event-router"

class ClauseUI extends BlockCollection {

  readonly def: Clause
  readonly c: ClauseInstance
  readonly owner: BlockInstanceUI
  readonly clauseIndex: number

  divider: HTMLDivElement = document.createElement("div")
  leftBar: HTMLDivElement = document.createElement("div")
  blocksDiv: HTMLDivElement = document.createElement("div")

  constructor(def: Clause, c: ClauseInstance, owner: BlockInstanceUI, clauseIndex: number) {
    super(c.blocks, owner.workspace)
    this.def = def
    this.c = c
    this.owner = owner
    this.clauseIndex = clauseIndex
  }

  getHighlightElement(): HTMLDivElement {
    const element = (this.blocks.length === 0) ? this.div : this.blocks[0].blockDiv
    return element
  }

  draw(container: BlockInstanceUI, extraDropDiv: HTMLDivElement | null): HTMLDivElement {
    const acceptor = new ClauseAcceptor(this)

    this.div = document.createElement("div")
    this.div.classList.add("nt-clause")

    if (extraDropDiv !== null) {
      const extraDropzone = interact(extraDropDiv).dropzone({
          accept: ".nt-menu-slot, .nt-block, .nt-cap, .nt-notch"
        , checker: (_1, _2, dropped) => acceptor.checker(dropped)
      })
      extraDropzone.on("drop", () => this.drop() )
      extraDropzone.on("dragenter", () => {
        this.getHighlightElement().classList.add("nt-block-clause-drag-over")
      })
      extraDropzone.on("dragleave", () => {
        this.getHighlightElement().classList.remove("nt-block-clause-drag-over")
      })
    }

    const styleClass = container.getStyleClass()

    this.leftBar = document.createElement("div")
    this.leftBar.classList.add("nt-clause-left-bar")
    this.leftBar.classList.add(`${styleClass}-color`)
    BlockRules.maybeSetColorOverride(container.def.blockColor, this.leftBar)
    this.div.append(this.leftBar)

    this.divider = document.createElement("div")
    this.divider.classList.add("nt-clause-divider")
    this.divider.classList.add(`${styleClass}-color`)
    BlockRules.maybeSetColorOverride(container.def.blockColor, this.divider)
    this.div.append(this.divider)

    const dividerText = StringUtils.toStrNotEmpty(this.def.action, "")
    if (StringUtils.isNotNullOrEmpty(dividerText.trim())) {
      const dividerTextDiv = document.createElement("div")
      dividerTextDiv.classList.add("nt-clause-divider-text")
      dividerTextDiv.innerText = dividerText
      this.divider.append(dividerTextDiv)
    }
    // I would much prefer to just put the arrow in the clause directly, but it gets a little
    // tricky to figure out where to place it veritically with dividers, empty clauses, etc.
    // So this makes this mildly easier, but still a little hacky (see the CSS file for more).
    // -Jeremy B August 2020
    const arrow = Arrow.draw()
    this.divider.append(arrow)

    const dropzone = interact(this.div).dropzone({
        accept: ".nt-menu-slot, .nt-block, .nt-cap, .nt-notch"
      , checker: (_1, _2, dropped) => acceptor.checker(dropped)
    })
    dropzone.on("drop", () => this.drop() )
    dropzone.on("dragenter", () => {
      this.getHighlightElement().classList.add("nt-block-clause-drag-over")
    })
    dropzone.on("dragleave", () => {
      this.getHighlightElement().classList.remove("nt-block-clause-drag-over")
    })

    this.blocksDiv = document.createElement("div")
    this.blocksDiv.classList.add("nt-clause-blocks")

    if (this.blocks.length === 0) {
      this.setEmpty()
      return this.div
    }

    this.div.append(this.blocksDiv)

    for (var i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i]
      const siblings = this.blocks.slice(i + 1)
      if (!(this.owner.dragData instanceof ActiveDragData)) {
        throw new Error("Cannot draw a clause for a block missing drag data.")
      }
      const dragData = new ClauseDragData(block, this.owner.dragData.chainIndex, i, this.owner.b.definitionId, this.owner.b.instanceId, siblings, this.clauseIndex)
      block.draw(dragData)
    }

    BlockCollection.appendBlocks(this.blocksDiv, this.blocks, "nt-block-clause")

    return this.div
  }

  setEmpty(): void {
    this.div.classList.add("nt-clause-empty")
    this.div.append(Notch.drawClause(false, this))

    const dropElement = document.createElement("div")
    dropElement.className = "nt-clause-drop"
    this.div.append(dropElement)

    this.div.append(Notch.drawClause(true,  this))
  }

  setNonEmpty(): void {
    this.div.classList.remove("nt-clause-empty")
  }

  resetOwned(): void {
    for (var i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i]
      if (!(this.owner.dragData instanceof ActiveDragData)) {
        throw new Error("Cannot draw a clause for a block missing drag data or instance ID.")
      }
      block.dragData = new ClauseDragData(block, this.owner.dragData.chainIndex, i, this.owner.b.definitionId, this.owner.b.instanceId, this.blocks.slice(i + 1), this.clauseIndex)
      block.resetOwnedBlocksDragData()
    }
  }

  redrawBlocks(): void {
    this.div.innerHTML = ""
    this.blocksDiv.innerHTML = ""

    this.div.append(this.leftBar)
    this.div.append(this.divider)

    if (this.blocks.length === 0) {
      this.setEmpty()
      return
    }

    this.setNonEmpty()

    this.div.append(this.blocksDiv)

    for (var i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i]
      if (!(this.owner.dragData instanceof ActiveDragData)) {
        throw new Error("Cannot draw a clause for a block missing drag data or instance ID.")
      }
      block.dragData = new ClauseDragData(block, this.owner.dragData.chainIndex, i, this.owner.b.definitionId, this.owner.b.instanceId, this.blocks.slice(i + 1), this.clauseIndex)
      block.resetOwnedBlocksDragData()
    }

    BlockCollection.appendBlocks(this.blocksDiv, this.blocks, "nt-block-clause")
  }

  enableDropZones(): void {
    if (DragManager.isValidDrop(this.containerId, (dragState) => ClauseAcceptor.isLandingSpot(this, dragState))) {
      this.div.classList.add("nt-allowed-drop")
    }

    for (const block of this.blocks) {
      block.enableDropZones()
    }
  }

  disableDropZones(): void {
    this.div.classList.remove("nt-allowed-drop")

    for (var block of this.blocks) {
      block.disableDropZones()
    }
  }

  drop(): void {
    DragManager.drop( (newBlocks) => {
      this.getHighlightElement().classList.remove("nt-block-clause-drag-over")
      this.insertBlocks(0, newBlocks)
      this.div.classList.remove("nt-clause-empty")

      const changedBlock = newBlocks[0]
      EventRouter.fireEvent(createBlockInstanceEvent(changedBlock))
    })
  }

}

export { ClauseUI }
