// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { BlockInstanceUI } from "../block-instance"
import { BlockRules } from "../block-rules"

class DragCap {

  static draw(isTop: Boolean, block: BlockInstanceUI): HTMLDivElement {
    const div = document.createElement("div")
    div.classList.add("nt-cap")
    const blockStyle = block.getStyleClass()
    const classes = [blockStyle, `${blockStyle}-color`]
    classes.forEach( (bs) => div.classList.add(bs) )

    BlockRules.applyStyleOverrides(block.def, div)
    BlockRules.maybeSetColorOverride(block.def.blockColor, div)

    if (isTop) {
      div.classList.add("nt-cap-top")
    } else {
      div.classList.add("nt-cap-bottom")
    }

    return div
  }

}

export { DragCap }
