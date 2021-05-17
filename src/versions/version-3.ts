// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { VersionUtils } from "./version-utils"

class Version3 {

  static update(json: any): void {
    VersionUtils.updateBlocks3(json, (b) => {}, Version3.unscaleBlockLocation)

    if (!json.hasOwnProperty("program") || typeof(json["program"]) !== "object") {
      return
    }

    const program: any = json["program"]
    if (!program.hasOwnProperty("chains") || !Array.isArray(program["chains"])) {
      return
    }

    Version3.removeEmptyChains(json["program"])
  }

  // This looks a little weird, but previously chains would be added that the user did not create
  // in order to have the procedures available so code would compile.  We're more explicit about
  // this now, and any version 2 model we see that has these empty procedures would've had them
  // removed anyway (not displayed to the user).  Hence we clear them so users aren't surprised
  // to find procedures they hadn't previously added.  -Jeremy B Jan-2020
  static removeEmptyChains(program: any): void {
    const chains: any[] = program["chains"]
    program["chains"] = chains.filter( (chain) => {
      if (!Array.isArray(chain) || chain.length === 0) {
        return false
      }
      if (chain.length > 1) {
        return true
      }
      // else length is 1
      const first: any = chain[0]
      if (first.hasOwnProperty("required") && typeof(first["required"]) === "boolean" && first["required"] === true) {
        return false
      }
      return true
    })
  }

  static unscaleBlockLocation(b: any): void {
    if (typeof(b["x"]) === "number") {
      b["x"] = (b["x"] * 10)
    }
    if (typeof(b["y"]) === "number") {
      b["y"] = (b["y"] * 10)
    }
  }

}

export { Version3 }
