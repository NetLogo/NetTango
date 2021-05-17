// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { ArrayUtils } from "../utils/array-utils"
import { VersionUtils } from "./version-utils"

class Version4 {

  static update(json: any): void {
    // locations were stored on blocks, but we're letting HTML/CSS handle layout for us
    // so keep the chain location on the chain itself and remove it from the blocks
    // -Jeremy B May 2020
    Version4.addLocationToChains(json)
    VersionUtils.updateBlocks6(json, Version4.removeBlockLocations, Version4.removeBlockLocations)
  }

  static addLocationToChains(json: any): void {
    if (!json.hasOwnProperty("program") || typeof(json["program"]) !== "object") {
      return
    }

    const program: any = json["program"]
    const newChains: any[] = []
    ArrayUtils.maybeForEach(program, "chains", (chain) => {
      var x = 0
      var y = 0
      if (chain.length !== 0) {
        const first = chain[0]
        if (typeof(first["x"]) === "number" && typeof(first["y"]) === "number") {
          x = Math.floor(first["x"])
          y = Math.floor(first["y"])
        }
      }

      const newChain = {
        "blocks": chain,
        "x": x,
        "y": y
      }
      newChains.push(newChain)
    })
    program["chains"] = newChains

  }

  static removeBlockLocations(b: any): void {
    delete b["x"]
    delete b["y"]
  }
}

export { Version4 }
