// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { ConcreteTags } from "../../types/types";
import { BlockInstanceUI } from "../block-instance";
import { BoolUtils } from "../../utils/bool-utils"
import { ListUtils } from "../../utils/list-utils"

function checkConcreteTags(tags: ConcreteTags, blocks: BlockInstanceUI[]): boolean {
  switch (tags.type) {
    case "unrestricted":
      return true

    case "any-of":
      return checkAnyOfTags(tags.tags, blocks)

    case "none-of":
      return checkNoneOfTags(tags.tags, blocks)
  }
}

function checkAnyOfTags(tags: string[], blocks: BlockInstanceUI[]): boolean {
  const areBlocksAllowed = blocks.map( (b) => doesBlockHaveAny(tags, b) )
  return BoolUtils.allAreTrue(areBlocksAllowed)
}

function checkNoneOfTags(tags: string[], blocks: BlockInstanceUI[]): boolean {
  const areBlocksAllowed = blocks.map( (b) => !doesBlockHaveAny(tags, b) )
  return BoolUtils.allAreTrue(areBlocksAllowed)
}

function doesBlockHaveAny(tags: string[], block: BlockInstanceUI): boolean {
  if (!ListUtils.containsAny(tags, block.def.tags)) {
    return false
  }
  if (block.clauses.length === 0) {
    return true
  }
  const areClausesAllowed = block.clauses.map( (clause) => {
    if (clause.def.allowedTags.type !== "inherit" || clause.blocks.length === 0) {
      return true
    }
    return checkAnyOfTags(tags, clause.blocks)
  })
  return BoolUtils.allAreTrue(areClausesAllowed)
}


export { checkConcreteTags, checkAnyOfTags, checkNoneOfTags }
