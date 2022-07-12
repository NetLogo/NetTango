// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { BlockInstance } from "../types/types"
import { NumUtils } from "../utils/num-utils"
import { BlockInstanceUI } from "./block-instance"
import { CodeWorkspaceUI } from "./code-workspace"

abstract class BlockCollection {

  readonly bs: BlockInstance[]
  readonly blocks: BlockInstanceUI[]
  readonly containerId: string

  div: HTMLDivElement = document.createElement("div")

  constructor(bs: BlockInstance[], workspace: CodeWorkspaceUI) {
    this.bs = bs
    this.blocks = bs.map( (b) => {
      const def = workspace.menu.getBlockById(b.definitionId)
      return new BlockInstanceUI(def, b, workspace)
    })
    this.containerId = workspace.containerId
  }

  abstract redrawBlocks(): void

  getBlockCount(id: number): number {
    try {
      if (this.blocks.length === 0) {
        return 0
      }
      return NumUtils.sum(this.blocks.map( (b) => b.getBlockCount(id) ))
    } catch (ex: any) {
      console.log(`here is the fail ${ex.toString()}`)
      throw ex
    }
  }

  getBlockInstance(definitionId: number, instanceId: number): BlockInstanceUI | null {
    for (var child of this.blocks) {
      const block = child.getBlockInstance(definitionId, instanceId)
      if (block !== null) { return block }
    }
    return null
  }

  // this is a little backwards... indeally we'd add to the backing data, then
  // update our "projection" and make the block components, but for now
  // we'll leave this here to keep the data up-to-date.  -Jeremy B April 2021
  resetBlockData(): void {
    this.bs.splice(0, this.bs.length, ...this.blocks.map( (b) => b.b ))
  }

  insertBlocks(blockIndex: number, newBlocks: BlockInstanceUI[]): void {
    this.blocks.splice(blockIndex, 0, ...newBlocks)
    this.resetBlockData()
    this.redrawBlocks()
  }

  removeBlocks(blockIndex: number): BlockInstanceUI[] {
    const removed = this.blocks.splice(blockIndex)
    this.resetBlockData()
    this.redrawBlocks()
    return removed
  }

  static appendBlock(div: HTMLDivElement, blockDiv: HTMLDivElement, newPosition: string): void {
    const appendDiv: HTMLDivElement = blockDiv;

    [
      "nt-block-first",
      "nt-block-last",
      "nt-block-standalone",
      "nt-block-middle",
      "nt-block-clause-first",
      "nt-block-clause-last",
      "nt-block-clause-standalone",
      "nt-block-clause-middle"
    ].forEach( (cl) => appendDiv.classList.remove(cl) )
    appendDiv.classList.add(newPosition)
    div.append(appendDiv)
  }

  static appendBlocks(div: HTMLDivElement, blocks: BlockInstanceUI[], classPrefix: string): void {
    if (blocks.length === 0) {
      return
    }

    if (blocks.length === 1) {
      BlockCollection.appendBlock(div, blocks[0].blockDiv, `${classPrefix}-standalone`)
    } else {
      BlockCollection.appendBlock(div, blocks[0].blockDiv, `${classPrefix}-first`)
      for (var i = 1; i < (blocks.length - 1); i++) {
        BlockCollection.appendBlock(div, blocks[i].blockDiv, `${classPrefix}-middle`)
      }
      BlockCollection.appendBlock(div, blocks[blocks.length - 1].blockDiv, `${classPrefix}-last`)
    }
  }

}

export { BlockCollection }
