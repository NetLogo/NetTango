// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { QuoteOptions } from "./blocks/attributes/select-attribute"
import { BlockPlacement } from "./blocks/block-placement"
import { AttributeTypes } from "./blocks/attributes/attribute"
import { CodeFormatter } from "./blocks/code-formatter"
import { CodeWorkspaceUI } from "./blocks/code-workspace"
import { VersionManager } from "./versions/version-manager"
import { CodeWorkspace } from "./types/types"
import { ProgramChangedEvent } from "./blocks/program-changed-event"
import { ObjectUtils } from "./utils/object-utils"

type FormatAttributeType = (containerId: string, blockId: number, instanceId: number, attributeId: number, value: any, attributeType: AttributeTypes, isProperty: boolean) => string

function restoreWorkspace(containerId: string, workspaceEnc: CodeWorkspace, language: string, formatAttribute: FormatAttributeType): CodeWorkspaceUI {
  if (workspaceEnc.version !== VersionManager.VERSION) {
    throw new Error(`The supported NetTango version is ${VersionManager.VERSION}, but the given definition version was ${workspaceEnc["version"]}.`)
  }
  const workspace = new CodeWorkspaceUI(containerId, workspaceEnc, language, formatAttribute)
  return workspace
}

function encodeWorkspace(workspace: CodeWorkspaceUI): CodeWorkspace {
  return ObjectUtils.clone(workspace.ws)
}

/**
 * NetTango functions can be used to create a blocks-based programming interface
 * associated with an HTML canvas.
 */
class NetTango {

  static blockPlacementOptions = BlockPlacement
  static selectQuoteOptions    = QuoteOptions

  private static readonly workspaces: Map<string, CodeWorkspaceUI> = new Map()

  /// Add a callback function to receive programChanged events from the
  /// workspace. Callback functions should take one parameter, which is
  /// the canvasId for the workspace (as a String).
  static onProgramChanged(containerId: string, callback: (containerId: string, event: ProgramChangedEvent) => void): void {
    if (!NetTango.workspaces.has(containerId)) {
      throw new Error("Cannot find workspace for given container ID.")
    }
    const notifier = (event: ProgramChangedEvent) => callback(containerId, event)
    NetTango.workspaces.get(containerId)!.notifier = notifier
  }

  /// Exports the code for a workspace in a given target language.
  /// The only language supported now is "NetLogo".
  static exportCode(containerId: string, formatAttribute: FormatAttributeType | null): string {
    if (!NetTango.workspaces.has(containerId)) {
      throw new Error("Cannot find workspace for given container ID.")
    }
    return NetTango.workspaces.get(containerId)!.exportCode(formatAttribute)
  }

  static formatAttributeValue(containerId: string, definitionId: number, instanceId: number, attributeId: number, isProperty: boolean): string {
    if (!NetTango.workspaces.has(containerId)) {
      throw new Error(`Unknown container ID: ${containerId}`)
    }
    const workspace = NetTango.workspaces.get(containerId)!
    const block     = workspace.getBlockInstance(definitionId, instanceId)
    const attribute = isProperty ? block.properties[attributeId] : block.params[attributeId]
    return CodeFormatter.formatAttributeValue({ def: attribute.def, a: attribute.a })
  }

  /// Exports the current state of the workspace as a JSON object to be
  /// restored at a later point.
  static save(containerId: string): any {
    if (!NetTango.workspaces.has(containerId)) {
      throw new Error(`Unknown container ID: ${containerId}`)
    }

    const definition = encodeWorkspace(NetTango.workspaces.get(containerId)!)
    return definition
  }

  /// Call `restore` to instantiate a workspace associated with an HTML canvas.
  /// TODO: Document JSON specification format--for now see README.md
  static restore(language: "NetLogo", containerId: string, definition: any, formatAttribute: FormatAttributeType): void {
    const ws: CodeWorkspace = VersionManager.updateWorkspace(definition)

    try {
      var notifier = null
      if (NetTango.workspaces.has(containerId)) {
        const oldWs = NetTango.workspaces.get(containerId)!
        oldWs.removeEventListeners()
        notifier = oldWs.notifier
      }
      const workspace = restoreWorkspace(containerId, ws, language, formatAttribute)
      NetTango.workspaces.set(containerId, workspace)
      workspace.draw()
      workspace.notifier = notifier
    } catch (e) {
      console.log(e)
      throw new Error("There was an error initializing the workspace with the given NetTango model JSON.")
    }

  }

  static hasWorkspace(containerId: string): boolean { return NetTango.workspaces.has(containerId) }

}

if (window !== undefined && window !== null && !window.hasOwnProperty("NetTango")) {
  const w: any = window
  w["NetTango"] = NetTango
}

export { FormatAttributeType, NetTango, encodeWorkspace, restoreWorkspace }
