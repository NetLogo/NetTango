// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { VersionUtils } from "./version-utils"

class Version1 {

  static update(json: any): any {
    const actionToId: Map<string, number> = new Map()
    const blockIdToAttributeIdOffset: Map<number, number> = new Map()
    var attributeId = 0

    const blockDefinitionHandler = (b: any) => {
      if (!b.hasOwnProperty("action")) { return }

      Version1.markRequiredBlocks(b)

      const id = actionToId.size
      b["id"] = id
      const action: string = b["action"]
      actionToId.set(action, id)

      blockIdToAttributeIdOffset.set(id, attributeId)

      attributeId = Version1.addIdsToParamsAndProps(attributeId, b)
    }

    const blockInstanceHandler = (b: any) => {
      Version1.addIdToBlock(actionToId, blockIdToAttributeIdOffset, b)
      Version1.markRequiredBlocks(b)
    }

    VersionUtils.updateBlocks3(json, blockDefinitionHandler, blockInstanceHandler)

  }

  static addIdsToParamsAndProps(attributeId: number, b: any): number {
    const attributesHandler = (attributes: any[]) => {
      attributeId = Version1.addIdsToAttributes(attributeId, attributes)
    }
    VersionUtils.updateBlockAttributes(b, attributesHandler)

    return attributeId
  }

  static addIdsToAttributes(attributeId: number, attributes: any[]): number {
    for (var attribute of attributes) {
      attribute["id"] = attributeId
      attributeId++
    }
    return attributeId
  }

  static addIdToBlock(actionToId: Map<string, number>, blockIdToAttributeIdOffset: Map<number, number>, b: any): void {
    if (!b.hasOwnProperty("action")) { return }

    const action: string = b["action"]
    if (actionToId.has(action)) {
      const id = actionToId.get(action)!
      b["id"] = id
      Version1.addIdsToParamsAndProps(blockIdToAttributeIdOffset.get(id)!, b)
    }
  }

  static markRequiredBlocks(b: any): void {
    // even if a block is not required, we mark it so if it's a procedure
    if (b.hasOwnProperty("type") && b["type"] === "nlogo:procedure" && b["required"] === false) {
      b["required"] = true
    }
  }

}

export { Version1 }
