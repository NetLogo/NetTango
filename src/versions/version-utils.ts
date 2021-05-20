// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { ArrayUtils } from "../utils/array-utils"

class VersionUtils {

  static updateBlocks(workspaceEnc: any, blockDefinitionHandler: (block: any) => void, blockInstanceHandler: (block: any) => void): void {
    workspaceEnc.blocks.forEach( (b: any) => blockDefinitionHandler(b) )
    const seen = new Set<any>()
    const handleBlockInstanceRec = (b: any) => {
      if (seen.has(b)) {
        console.log("Processed already: ", b)
        throw new Error("Uh, we already processed this?")
      }
      seen.add(b)
      blockInstanceHandler(b)
      b.clauses.forEach( (cl: any) => {
        cl.blocks.forEach( (b: any) => {
          handleBlockInstanceRec(b)
        })
      })
    }
    workspaceEnc.program.chains.forEach( (c: any) => {
      c.blocks.forEach(handleBlockInstanceRec)
    })
  }

  static updateBlocks6(json: any, blockDefinitionHandler: (block: any) => void, blockInstanceHandler: (block: Object) => void): void {
    if (!json.hasOwnProperty("blocks") || !Array.isArray(json["blocks"])) {
      return
    }

    for (var b of json["blocks"]) {
      blockDefinitionHandler(b)
    }

    if (!json.hasOwnProperty("program") || typeof(json["program"]) !== "object") {
      return
    }

    const program: any = json["program"]

    const seen = new Set<any>()
    const handleBlockInstanceRec = (b: any) => {
      if (seen.has(b)) {
        console.log("Processed already: ", b)
        throw new Error("Uh, we already processed this?")
      }
      seen.add(b)
      blockInstanceHandler(b)

      // the `children` property was removed in version 5, but this should be harmless to
      // leave in as it checks the existence of the property first.  This line can be
      // removed the next time a big structure change requires changing `updateBlocks()`.
      // -Jeremy B July 2020
      ArrayUtils.maybeForEach(b, "children", (child) => handleBlockInstanceRec(child))
      ArrayUtils.maybeForEach(b, "clauses", (clause) => {
        ArrayUtils.maybeForEach(clause, "children", (child) => handleBlockInstanceRec(child))
      })
    }

    ArrayUtils.maybeForEach(program, "chains", (chain) => {
      ArrayUtils.maybeForEach(chain, "blocks", (b) => {
        handleBlockInstanceRec(b)
      })
    })

  }

  /// the data structure changed for version 4, so this remains for updating version 3 or
  /// earlier files.
  static updateBlocks3(json: any, blockDefinitionHandler: (block: any) => void, blockInstanceHandler: (block: any) => void): void {
    if (!json.hasOwnProperty("blocks") || !Array.isArray(json["blocks"])) {
      return
    }

    for (var b of json["blocks"]) {
      blockDefinitionHandler(b)
    }

    // it's possible we want all the block definition updates done before processing any children
    // so run through them again.  -Jeremy B August 2019
    for (var b of json["blocks"]) {
      ArrayUtils.maybeForEach(b, "children", (child) => blockInstanceHandler(child))
      ArrayUtils.maybeForEach(b, "clauses", (clause) => {
        ArrayUtils.maybeForEach(clause, "children", (child) => blockInstanceHandler(child))
      })
    }

    if (!json.hasOwnProperty("program") || typeof(json["program"]) !== "object") {
      return
    }

    const seen = new Set<any>()
    const handleBlockInstanceRec = (b: any) => {
      if (seen.has(b)) {
        console.log("Processed already: ", b)
        throw new Error("Uh, we already processed this?")
      }
      seen.add(b)
      blockInstanceHandler(b)

      ArrayUtils.maybeForEach(b, "children", (child) => handleBlockInstanceRec(child))
      ArrayUtils.maybeForEach(b, "clauses", (clause) => {
        ArrayUtils.maybeForEach(clause, "children", (child) => handleBlockInstanceRec(child))
      })
    }

    const program = json["program"]
    ArrayUtils.maybeForEach(program, "chains", (chain) => {
      for (var b of chain) {
        handleBlockInstanceRec(b)
      }
    })
  }

  static updateBlockAttributes(b: any, attributesHandler: (items: any[]) => void): void {
    if (b.hasOwnProperty("params") && Array.isArray(b["params"])) {
      attributesHandler(b["params"])
    }

    if (b.hasOwnProperty("properties") && Array.isArray(b["properties"])) {
      attributesHandler(b["properties"])
    }
  }

}

export { VersionUtils }
