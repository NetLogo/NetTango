// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { VersionUtils } from "./version-utils"

class Version2 {

  static update(json: any): void {
    VersionUtils.updateBlocks3(json, Version2.updateBlockSelectAttributes, Version2.updateBlockSelectAttributes)
  }

  static updateBlockSelectAttributes(b: any): void {
    VersionUtils.updateBlockAttributes(b, Version2.objectifySelectAttributes)
  }

  static objectifySelectAttribute(attribute: any): void {
    if (!attribute.hasOwnProperty("values") || !Array.isArray(attribute["values"])) {
      return
    }
    attribute["values"] = attribute["values"].map( (v) => { return { "actual": v } } )
  }

  static objectifySelectAttributes(attributes: any[]): void {
    for (var a of attributes.filter( (f) => f.hasOwnProperty("type") && f["type"] === "select" )) {
      Version2.objectifySelectAttribute(a)
    }
  }

}

export { Version2 }
