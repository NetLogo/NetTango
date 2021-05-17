// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { BlockInstanceUI } from "../block-instance"
import { BlockRules } from "../block-rules"
import { ClauseUI } from "../clause"

class Notch {

  static draw(isTop: boolean, block: BlockInstanceUI): HTMLDivElement {

    const div = document.createElement("div")
    div.classList.add("nt-notch")
    const blockStyle = block.getStyleClass()
    div.classList.add(blockStyle)

    BlockRules.applyStyleOverrides(block.def, div)

    if (isTop) {
      div.classList.add("nt-notch-top")
    } else {
      div.classList.add("nt-notch-bottom")
    }

    const colorClass = `${blockStyle}-color`
    const posClasses = ["filler", "left", "middle", "right"]
    posClasses.forEach( (notchClass) => {
      const filler = document.createElement("div")
      const notchClasses = [`nt-notch-${notchClass}`, colorClass]
      notchClasses.forEach( (cl) => filler.classList.add(cl) )
      if (!isTop || notchClass !== "middle") {
        BlockRules.maybeSetColorOverride(block.def.blockColor, filler)
      }
      div.append(filler)
    })

    BlockInstanceUI.wireDragEvents(block, div)

    return div
  }

  static drawClause(isTop: boolean, clause: ClauseUI): HTMLDivElement {
    const div = document.createElement("div")
    div.classList.add("nt-notch")
    const blockStyle = clause.owner.getStyleClass()
    div.classList.add(blockStyle)

    BlockRules.applyStyleOverrides(clause.owner.def, div)

    if (isTop) {
      div.classList.add("nt-notch-top")
    } else {
      div.classList.add("nt-notch-bottom")
    }

    const colorClass = `${blockStyle}-color`
    const posClasses = ["filler", "left", "middle", "right"]
    posClasses.forEach( (notchClass) => {
      const filler = document.createElement("div")
      const notchClasses = [`nt-notch-${notchClass}`, colorClass]
      notchClasses.forEach( (cl) => filler.classList.add(cl) )
      if (!isTop || notchClass !== "middle") {
        BlockRules.maybeSetColorOverride(clause.owner.def.blockColor, filler)
      }
      div.append(filler)
    });

    if (!isTop) {
      const clauseFiller = document.createElement("div")
      clauseFiller.className = "nt-notch-clause-filler"
      div.append(clauseFiller)
    }

    return div
  }

}

export { Notch }
