import {
  BlockDefinition
, BlockInstance
, Clause
, ClauseInstance
, CodeWorkspace
, UnrestrictedTags
, codeWorkspaceSchema
, blockDefinitionSchema
, blockInstanceSchema
, intAttributeSchema
, numValueSchema
, selectAttributeSchema
, stringValueSchema
, expressionAttributeSchema
, expressionSchema
, expressionValueSchema
, clauseSchema
, clauseInstanceSchema
, AttributeValue
, textAttributeSchema
, rangeAttributeSchema
, Attribute
} from "../types/types"

import { BlockStyleUI } from "../blocks/block-style"
import { ObjectUtils } from "../utils/object-utils"
import { AttributeTypes } from "../attribute-types"

const UNRESTRICTED_TAGS: UnrestrictedTags = Object.freeze({ type: "unrestricted" })

function newUnrestrictedTags() {
  return UNRESTRICTED_TAGS
}

const DEFAULT_BLOCK_STYLES = {
  commandBlockStyle: BlockStyleUI.DEFAULT_COMMAND_STYLE
, containerBlockStyle: BlockStyleUI.DEFAULT_CONTAINER_STYLE
, starterBlockStyle: BlockStyleUI.DEFAULT_STARTER_STYLE
}

function newBlockStyles() {
  return ObjectUtils.clone(DEFAULT_BLOCK_STYLES)
}

const EMPTY_WORKSPACE: CodeWorkspace = codeWorkspaceSchema.parse({
  version: 6
})

function newWorkspace() {
  return ObjectUtils.clone(EMPTY_WORKSPACE)
}

const EMPTY_BLOCK: BlockDefinition = blockDefinitionSchema.parse({
  id: -1
, action: ""
})

function newBlockDefinition() {
  return ObjectUtils.clone(EMPTY_BLOCK)
}

const EMPTY_BLOCK_INSTANCE: BlockInstance = blockInstanceSchema.parse({
  definitionId: -1
, instanceId: -1
})

function newBlockInstance() {
  return ObjectUtils.clone(EMPTY_BLOCK_INSTANCE)
}

function newAttribute(type: AttributeTypes): Attribute {
  switch (type) {
    case "text":
      return textAttributeSchema.parse({ type: type })

    case "select":
      return selectAttributeSchema.parse({ type: "select" })

    case "int":
      return intAttributeSchema.parse({ type: type })

    case "range":
      return rangeAttributeSchema.parse({ type: type })

    case "num":
    case "bool":
      return expressionAttributeSchema.parse({ type: type })

  }
}

function newExpression(type: "num" | "bool") {
  return expressionSchema.parse({ name: type === "num" ? "0" : "false" })
}

function newAttributeValue(type: AttributeTypes): AttributeValue {
  switch (type) {
    case "text":
    case "select":
      return stringValueSchema.parse({ type: type })

    case "int":
    case "range":
      return numValueSchema.parse({ type: type })

    case "num":
    case "bool":
      const value = newExpression(type)
      return expressionValueSchema.parse({ type: type, value: value })

  }
}

const EMPTY_CLAUSE: Clause = clauseSchema.parse({})

function newClauseDefinition() {
  return ObjectUtils.clone(EMPTY_CLAUSE)
}

const EMPTY_CLAUSE_INSTANCE: ClauseInstance = clauseInstanceSchema.parse({})

function newClauseInstance() {
  return ObjectUtils.clone(EMPTY_CLAUSE_INSTANCE)
}

export {
  newAttribute
, newAttributeValue
, newBlockDefinition
, newBlockInstance
, newBlockStyles
, newClauseDefinition
, newClauseInstance
, newExpression
, newUnrestrictedTags
, newWorkspace
}
