// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import interact from "interactjs"
import { BlockDefinition, Grouping, MenuConfig, TagGrouping } from "../types/types"
import { CodeWorkspaceUI } from "./code-workspace"
import { DragManager } from "./drag-drop/drag-manager"
import { createBlockInstanceEvent } from "./program-changed-event"
import { BlockDefinitionUI } from "./block-definition"
import { DropSpot } from "./baubles/drop-spot"
import { ArrayUtils } from "../utils/array-utils"
import { DomUtils } from "../utils/dom-utils"
import { EventRouter } from "../event-router"
import { BlockDefinitionEvent } from "../events"

class BlockMenuGroupUI {
  readonly containerId: string
  readonly enableDefinitionChanges: boolean
  readonly groupIndex: "main" | number
  readonly header: string
  readonly group: Grouping
  readonly blocks: BlockDefinitionUI[]

  readonly groupDiv: HTMLDivElement = document.createElement("div")

  private constructor(workspace: CodeWorkspaceUI, containerId: string, enableDefinitionChanges: boolean, groupIndex: "main" | number, header: string, group: Grouping, defs: BlockDefinition[]) {
    this.containerId             = containerId
    this.enableDefinitionChanges = enableDefinitionChanges
    this.groupIndex              = groupIndex
    this.header                  = header
    this.group                   = group

    const getBlockById = (id: number): BlockDefinition => defs.filter( (def) => def.id === id )[0]
    this.blocks = this.group.order.map( (id, index) => {
      const def = getBlockById(id)
      return new BlockDefinitionUI(def, workspace, groupIndex, index)
    })
  }

  static createMain(workspace: CodeWorkspaceUI, containerId: string, enableDefinitionChanges: boolean, header: string, group: Grouping, defs: BlockDefinition[]) {
    return new BlockMenuGroupUI(workspace, containerId, enableDefinitionChanges, "main", header, group, defs)
  }

  static createTag(workspace: CodeWorkspaceUI, containerId: string, enableDefinitionChanges: boolean, groupIndex: number, group: TagGrouping, defs: BlockDefinition[]) {
    return new BlockMenuGroupUI(workspace, containerId, enableDefinitionChanges, groupIndex, group.tag, group, defs)
  }

  draw(): HTMLDivElement {
    this.groupDiv.classList.add("nt-menu-group")

    const checker = (d: boolean) => d && DragManager.isInSameWorkspace(this.containerId) && DragManager.isInSameGroup(this.groupIndex)
    const dropSpot = DropSpot.draw(this.header, () => DragManager.slotDrop(this.groupIndex, 0), this.enableDefinitionChanges, checker)
    this.groupDiv.append(dropSpot)

    const slotDropNotifier = (j: number) => {
      DragManager.slotDrop(this.groupIndex, j)
    }

    this.blocks.forEach( (slot, i) => {
      this.groupDiv.append(slot.draw(i, slotDropNotifier, this.enableDefinitionChanges))
    })

    return this.groupDiv
  }

  moveSlot(from: number, to: number): void {
    const max = (this.blocks.length - 1)
    to = to < 0 ? 0 : (to > max ? max : to)
    if (from === to) {
      return
    }
    const block = this.blocks[from].def
    if (this.blocks[from].slotIndex !== from) {
      throw new Error(`Slot index incorrect for: ${from}`)
    }
    ArrayUtils.swap(this.group.order, from, to)
    ArrayUtils.swap(this.blocks, from, to)
    this.blocks.forEach( (slot, i) => slot.slotIndex = i )
    // The +1's are to skip the top-drop element.
    DomUtils.swapChildren(this.groupDiv, from + 1, to + 1)
    const event: BlockDefinitionEvent = {
      type:        "block-definition-moved"
    , containerId: this.containerId
    , blockId:     block.id
    }
    EventRouter.fireEvent(event)
  }

  updateLimits(): void {
    this.blocks.forEach( (block) => block.updateForLimit() )
  }

}

export { BlockMenuGroupUI }
