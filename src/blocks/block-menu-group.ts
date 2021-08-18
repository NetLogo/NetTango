// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import interact from "interactjs"
import { BlockDefinition, Grouping, TagGrouping } from "../types/types"
import { CodeWorkspaceUI } from "./code-workspace"
import { DragManager } from "./drag-drop/drag-manager"
import { BlockDefinitionUI } from "./block-definition"
import { ArrayUtils } from "../utils/array-utils"
import { DomUtils } from "../utils/dom-utils"
import { EventRouter } from "../event-router"
import { BlockDefinitionEvent, MenuGroupCollapseEvent, MenuGroupEvent } from "../events"
import { Toggle } from "./baubles/toggle"

class BlockMenuGroupUI {
  readonly containerId: string
  readonly enableDefinitionChanges: boolean
  readonly groupIndex: "main" | number
  readonly header: string
  readonly group: Grouping
  readonly blocks: BlockDefinitionUI[]

  readonly groupDiv: HTMLDivElement = document.createElement("div")
  readonly blocksDiv: HTMLDivElement = document.createElement("div")

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

  static createMain(workspace: CodeWorkspaceUI, containerId: string, enableDefinitionChanges: boolean, group: Grouping, defs: BlockDefinition[]) {
    const header = group.header ?? "blocks"
    return new BlockMenuGroupUI(workspace, containerId, enableDefinitionChanges, "main", header, group, defs)
  }

  static createTag(workspace: CodeWorkspaceUI, containerId: string, enableDefinitionChanges: boolean, groupIndex: number, group: TagGrouping, defs: BlockDefinition[]) {
    const header = group.header ?? ((group.tags.length > 0) ? group.tags[0] : "empty")
    return new BlockMenuGroupUI(workspace, containerId, enableDefinitionChanges, groupIndex, header, group, defs)
  }

  draw(): HTMLDivElement {
    this.groupDiv.classList.add("nt-menu-group")

    const checker = (d: boolean) => d && DragManager.isInSameWorkspace(this.containerId) && DragManager.isInSameGroup(this.groupIndex)

    const headerDiv = document.createElement("div")
    headerDiv.innerText = this.header
    headerDiv.classList.add("nt-drop-spot")
    this.groupDiv.append(headerDiv)

    headerDiv.addEventListener("contextmenu", (e) => this.fireGroupEvent(e, "menu-group-context-menu") )
    headerDiv.addEventListener("dblclick", (e) => this.fireGroupEvent(e, "menu-group-clicked") )

    const blocksToggle = new Toggle(!this.group.isCollapsed, (isOn) => {
      this.group.isCollapsed = !isOn
      this.blocksDiv.classList.toggle("nt-group-blocks-hidden")
      const collapseEvent: MenuGroupCollapseEvent = {
        type:        "menu-group-collapse-toggled"
      , containerId: this.containerId
      , groupIndex:  this.groupIndex
      , isCollapsed: this.group.isCollapsed
      }
      EventRouter.fireEvent(collapseEvent)
    })
    if (this.group.isCollapsed) {
      this.blocksDiv.classList.add("nt-group-blocks-hidden")
    }
    headerDiv.append(blocksToggle.div)

    if (this.enableDefinitionChanges) {
      const dropZone = interact(headerDiv).dropzone({
        accept: ".nt-menu-slot"
      , checker: (_1, _2, dropped) => checker(dropped)
      })
      dropZone.on("dragenter", () => {
        headerDiv.classList.add("nt-menu-slot-over")
      })
      dropZone.on("dragleave", () => {
        headerDiv.classList.remove("nt-menu-slot-over")
      })
      dropZone.on("drop", () => {
        headerDiv.classList.remove("nt-menu-slot-over")
        DragManager.slotDrop(this.groupIndex, 0)
      })
    }

    const slotDropNotifier = (j: number) => {
      DragManager.slotDrop(this.groupIndex, j)
    }

    this.blocks.forEach( (slot, i) => {
      this.blocksDiv.append(slot.draw(i, slotDropNotifier, this.enableDefinitionChanges))
    })
    this.groupDiv.append(this.blocksDiv)

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
    DomUtils.swapChildren(this.blocksDiv, from, to)
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

  fireGroupEvent(ev: MouseEvent, type: "menu-group-clicked" | "menu-group-context-menu"): false {
    ev.preventDefault()
    ev.stopPropagation()
    const groupEvent: MenuGroupEvent = {
      type:        type
    , containerId: this.containerId
    , groupIndex:  this.groupIndex
    , x:           ev.pageX
    , y:           ev.pageY
    }
    EventRouter.fireEvent(groupEvent)
    return false
  }

}

export { BlockMenuGroupUI }
