// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { ConcreteTags } from "../../types/types"
import { BlockInstanceUI } from "../block-instance"
import { ClauseUI } from "../clause"
import { ChainDragData } from "../drag-drop/drag-data/chain-drag-data"
import { ClauseDragData } from "../drag-drop/drag-data/clause-drag-data"
import { NewDragData } from "../drag-drop/drag-data/new-drag-data"
import { checkConcreteTags } from "./concrete-tags"

function getConcreteTags(clause: ClauseUI): ConcreteTags | null {
  if (clause.owner.dragData === null) {
    throw new Error("No drag data to use for tags")
  }

  const data = clause.owner.dragData
  if (data instanceof ChainDragData) {
    const first = clause.owner.workspace.chains[data.chainIndex].blocks[0]
    return first.canBeStarter ? (first.def.allowedTags as ConcreteTags) : null
  }

  if (data instanceof ClauseDragData) {
    const ownerClause = clause.owner.workspace.getBlockInstance(data.parentDefinitionId, data.parentInstanceId).clauses[data.clauseIndex]
    if (ownerClause.def.allowedTags.type === 'inherit') {
      return getConcreteTags(ownerClause)
    }
    return (ownerClause.def.allowedTags as ConcreteTags)
  }

  // I guess a new block is a fragment?  But we shouldn't be calling this, really.
  if (data instanceof NewDragData) {
    return null
  }

  throw new Error(`Unknown block drag data type: ${clause.owner.dragData}`)
}

function checkInheritTags(clause: ClauseUI, blocks: BlockInstanceUI[]): boolean {
  const parent = getConcreteTags(clause)
  if (parent === null) {
    // no restrictions at the moment
    return true
  }
  return checkConcreteTags(parent, blocks)
}

export { checkInheritTags }
