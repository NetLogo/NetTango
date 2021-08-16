// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { QuoteOptions } from "./blocks/attributes/select-attribute"
import { BlockPlacement } from "./blocks/block-placement"
import { AttributeTypes } from "./attribute-types"
import { CodeFormatter } from "./blocks/code-formatter"
import { CodeWorkspaceUI } from "./blocks/code-workspace"
import { VersionManager } from "./versions/version-manager"
import { CodeWorkspace, ExpressionDefinition } from "./types/types"
import { ProgramChangedEvent } from "./events"
import { ObjectUtils } from "./utils/object-utils"
import { defaultExpressions } from "./default-expressions"
import { BlockStyleUI } from "./blocks/block-style"
import { EventRouter } from "./event-router"

type FormatAttributeType = (containerId: string, blockId: number, instanceId: number, attributeId: number, value: any, attributeType: AttributeTypes, isProperty: boolean) => string

type NetTangoOptions = {
  enableDefinitionChanges: boolean
}

const defaultOptions = Object.freeze({
  enableDefinitionChanges: true
})

function restoreWorkspace(containerId: string, workspaceEnc: CodeWorkspace, language: string, formatAttribute: FormatAttributeType, options: NetTangoOptions): CodeWorkspaceUI {
  if (workspaceEnc.version !== VersionManager.VERSION) {
    throw new Error(`The supported NetTango version is ${VersionManager.VERSION}, but the given definition version was ${workspaceEnc["version"]}.`)
  }
  const expressions: ExpressionDefinition[] = defaultExpressions.has(language) ? defaultExpressions.get(language)! : []
  const workspace = new CodeWorkspaceUI(containerId, workspaceEnc, language, expressions, formatAttribute, options.enableDefinitionChanges)
  return workspace
}

function encodeWorkspace(workspace: CodeWorkspaceUI): CodeWorkspace {
  return ObjectUtils.clone(workspace.ws)
}

// NetTango functions can be used to create a blocks-based programming interface
// associated with an HTML element.
class NetTango {

  static blockPlacementOptions = BlockPlacement
  static selectQuoteOptions    = QuoteOptions
  static defaultExpressions    = defaultExpressions
  static defaultBlockStyles    = {
    commandBlockStyle:   BlockStyleUI.DEFAULT_COMMAND_STYLE
  , containerBlockStyle: BlockStyleUI.DEFAULT_CONTAINER_STYLE
  , starterBlockStyle:   BlockStyleUI.DEFAULT_STARTER_STYLE
  }

  private static readonly workspaces: Map<string, CodeWorkspaceUI> = new Map()

  static addEventListener(containerId: string, listener: (event: ProgramChangedEvent) => void): void {
    NetTango.errorIfNoWorkspace(containerId)
    const externalEventTypes: ProgramChangedEvent['type'][] = [
      "block-instance-changed"
    , "attribute-changed"
    , "menu-item-clicked"
    , "menu-item-context-menu"
    , "block-definition-moved"
    , "menu-group-clicked"
    , "menu-group-context-menu"
    , "menu-group-collapse-toggled"
    ]
    EventRouter.addListener("external-listener", containerId, externalEventTypes, listener)
  }

  /// Exports the code for a workspace in a given target language.
  /// The only language supported now is "NetLogo".
  static exportCode(containerId: string, formatAttribute: FormatAttributeType | null): string {
    const workspace = NetTango.getWorkspace(containerId)
    return workspace.exportCode(formatAttribute)
  }

  static formatAttributeValue(containerId: string, definitionId: number, instanceId: number, attributeId: number, isProperty: boolean): string {
    const workspace = NetTango.getWorkspace(containerId)
    const block     = workspace.getBlockInstance(definitionId, instanceId)
    const attribute = isProperty ? block.properties[attributeId] : block.params[attributeId]
    return CodeFormatter.formatAttributeValue({ def: attribute.def, a: attribute.a })
  }

  /// Exports the current state of the workspace as a JSON object to be
  /// restored at a later point.
  static save(containerId: string): any {
    const workspace  = NetTango.getWorkspace(containerId)
    const definition = encodeWorkspace(workspace)
    return definition
  }

  /// Call `restore` to instantiate a workspace associated with an HTML canvas.
  /// TODO: Document JSON specification format--for now see README.md
  static restore(language: "NetLogo", containerId: string, definition: any, formatAttribute: FormatAttributeType, options: NetTangoOptions): void {
    const ws: CodeWorkspace = VersionManager.updateWorkspace(definition)

    try {
      const workspace = restoreWorkspace(containerId, ws, language, formatAttribute, options)
      NetTango.workspaces.set(containerId, workspace)
      workspace.draw()
    } catch (e) {
      console.log(e)
      throw new Error("There was an error initializing the workspace with the given NetTango model JSON.")
    }

  }

  static hasWorkspace(containerId: string): boolean {
    return NetTango.workspaces.has(containerId)
  }

  static errorIfNoWorkspace(containerId: string): void {
    if (!NetTango.hasWorkspace(containerId)) {
      throw new Error(`Unknown container ID: ${containerId}`)
    }
  }

  static getWorkspace(containerId: string): CodeWorkspaceUI {
    NetTango.errorIfNoWorkspace(containerId)
    return NetTango.workspaces.get(containerId)!
  }

  static moveBlock(containerId: string, groupIndex: "main" | number, from: number, to: number) {
    const workspace = NetTango.getWorkspace(containerId)
    workspace.menu.moveSlot(groupIndex, from, to)
  }

}

if (window !== undefined && window !== null && !window.hasOwnProperty("NetTango")) {
  const w: any = window
  w["NetTango"] = NetTango
}

export { FormatAttributeType, NetTango, NetTangoOptions, encodeWorkspace, restoreWorkspace, defaultOptions }
