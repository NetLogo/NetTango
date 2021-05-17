// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { BlockInstanceUI } from "../block-instance"
import { DragCap } from "./drag-cap"

class Cap {

  static draw(isTop: Boolean, block: BlockInstanceUI): HTMLDivElement {
    const div = DragCap.draw(isTop, block)
    BlockInstanceUI.wireDragEvents(block, div)
    return div
  }

}

export { Cap }
