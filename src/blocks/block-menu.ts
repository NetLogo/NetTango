// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import interact from "interactjs"
import { BlockDefinition, MenuConfig } from "../types/types"
import { CodeWorkspaceUI } from "./code-workspace"
import { DragManager } from "./drag-drop/drag-manager"
import { createBlockInstanceEvent } from "./program-changed-event"
import { BlockDefinitionUI } from "./block-definition"
import { EventRouter } from "../event-router"
import { BlockMenuGroupUI } from "./block-menu-group"

class BlockMenuUI {

  private static readonly menuScrolls: Map<string, number> = new Map()

  readonly blocks: BlockDefinition[]
  readonly menuConfig: MenuConfig
  readonly containerId: string
  readonly workspace: CodeWorkspaceUI
  readonly enableDefinitionChanges: boolean

  readonly mainGroup: BlockMenuGroupUI
  readonly tagGroups: BlockMenuGroupUI[]

  color = "rgba(0, 0, 0, 0.2)"

  menuDiv = document.createElement("div")

  constructor(blocks: BlockDefinition[], menuConfig: MenuConfig, workspace: CodeWorkspaceUI, enableDefinitionChanges: boolean) {
    this.blocks = blocks
    this.menuConfig = menuConfig
    this.containerId = workspace.containerId
    this.workspace = workspace
    this.enableDefinitionChanges = enableDefinitionChanges

    this.mainGroup = BlockMenuGroupUI.createMain(this.workspace, this.containerId, this.enableDefinitionChanges, this.menuConfig.mainGroup, this.blocks)
    this.tagGroups = this.menuConfig.tagGroups.map( (group, index) =>
      BlockMenuGroupUI.createTag(this.workspace, this.containerId, this.enableDefinitionChanges, index, group, this.blocks)
    )

  }

  getBlockById(id: number): BlockDefinition {
    var matches = this.blocks.filter( (def) => {
      return def.id === id
    })
    if (matches.length === 0) {
      throw new Error(`No block found for ID# ${id}`)
    }
    if (matches.length > 1) {
      throw new Error(`Multiple blocks found with ID# ${id}`)
    }
    return matches[0]
  }

  draw(): HTMLDivElement {
    this.menuDiv = document.createElement("div")
    // this silliness and `resetScroll()` are a workaround to not get the menu scroll
    // to reset when working in the builder and adding, removing, and chaning blocks
    // that result in a total reload of all DIVs at the moment.  -Jeremy B August 2021
    this.menuDiv.addEventListener("scroll", (ev: Event) => {
      BlockMenuUI.menuScrolls.set(this.containerId, this.menuDiv.scrollTop)
    })
    this.menuDiv.className = ""

    this.menuDiv.id = `${this.containerId}-menu`
    this.menuDiv.classList.add("nt-menu")

    this.menuDiv.append(this.mainGroup.draw())
    this.tagGroups.forEach( (group) => this.menuDiv.append(group.draw()) )

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

  resetScroll(): void {
    if (BlockMenuUI.menuScrolls.has(this.containerId)) {
      this.menuDiv.scrollTop = BlockMenuUI.menuScrolls.get(this.containerId)!
    }
  }

  updateLimits(): void {
    this.mainGroup.updateLimits()
    this.tagGroups.forEach( (group) => group.updateLimits() )
  }

  getSlot(groupIndex: "main" | number, slotIndex: number): BlockDefinitionUI {
    if (groupIndex === "main") {
      return this.mainGroup.blocks[slotIndex]
    } else {
      return this.tagGroups[groupIndex].blocks[slotIndex]
    }
  }

  drop(): void {
    DragManager.drop( (oldBlocks) => {
      this.menuDiv.classList.remove("nt-menu-drag-over")
      const changedBlock = oldBlocks[0]
      EventRouter.fireEvent(createBlockInstanceEvent(changedBlock))
    })
  }

  moveSlot(groupIndex: "main" | number, from: number, to: number) {
    if (groupIndex === "main") {
      this.mainGroup.moveSlot(from, to)
    } else {
      this.tagGroups[groupIndex].moveSlot(from, to)
    }
  }

}

export { BlockMenuUI as BlockMenuUI }
