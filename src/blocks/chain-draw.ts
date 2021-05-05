// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetTango/NetTango

import { Arrow } from "./baubles/arrow"
import { Notch } from "./baubles/notch"
import { Block } from "./block"
import { BlockCollection } from "./block-collection"

// To avoid circular dependencies we have a separate drawer for the "chain" that is made while dragging, because
// it does not need to have drop acceptors, and so doesn't need to depend on them.

class ChainDraw {

  static draw(drawCap: (isTop: boolean, block: Block) => HTMLDivElement, div: HTMLDivElement, blocks: Block[], useClones: boolean, fragmentDiv: HTMLDivElement | null = null): void {
    div.innerHTML = ""

    if (blocks[0].canBeStarter) {
      div.classList.add("nt-chain-starter")
      div.classList.remove("nt-chain-fragment")

      const topCap = drawCap(true, blocks[0])
      div.append(topCap)

    } else {
      div.classList.remove("nt-chain-starter")
      div.classList.add("nt-chain-fragment")

      if (fragmentDiv !== null) {
        div.append(fragmentDiv)
      }

      const topNotch = Notch.draw(true, blocks[0])
      div.append(topNotch)

      const arrow = Arrow.draw()
      div.append(arrow)
    }

    BlockCollection.appendBlocks(div, blocks, "nt-block", useClones)

    if (blocks[blocks.length - 1].isAttachable) {
      const bottomNotch = Notch.draw(false, blocks[blocks.length - 1])
      div.append(bottomNotch)
    } else {
      const bottomCap = drawCap(false, blocks[blocks.length - 1])
      div.append(bottomCap)
    }
  }

}

export { ChainDraw }
