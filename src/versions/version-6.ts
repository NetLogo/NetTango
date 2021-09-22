// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { makeAttributeDefault, makeExpressionValue } from "../blocks/attributes/attribute-factory"
import { Attribute, AttributeValue, BlockDefinition, BlockInstance, Chain, Clause, ClauseInstance, CodeWorkspace, codeWorkspaceSchema } from "../types/types-6"
import { AttributeInput, BlockInput, ChainInput, ClauseInput, CodeWorkspaceInput } from "../types/types-5"
import { ObjectUtils } from "../utils/object-utils"
import { newBlockDefinition, newBlockInstance, newClauseInstance, newWorkspace } from "./empty-objects-6"
import { VersionUtils } from "./version-utils"

type GetBlockDefType = (id: number| undefined) => BlockDefinition | undefined

const blockInstanceProps = [
  "instanceId", "clauses", "params", "properties", "propertiesDisplay"
]

const allBlockProps = [
  "id", "action", "isRequired", "placement", "instanceId", "type", "format", "isTerminal"
, "closeClauses", "closeStarter", "limit", "note", "blockColor", "textColor", "borderColor"
, "font", "allowedTags", "tags", "clauses", "params", "properties", "propertiesDisplay"
]

class Version6 {

  static update(ws: CodeWorkspaceInput): CodeWorkspace {
    const blocks = ws.blocks.map(Version6.makeBlockDefinition)

    const getBlockDef = (id: number | undefined): BlockDefinition | undefined => {
      if (id === undefined) {
        return undefined
      }

      const matches = blocks.filter( (b) => b.id == id )
      if (matches.length === 0) {
        return undefined
      } else {
        return matches[0]
      }
    }

    const chains = ws.program.chains.map(Version6.makeChain(getBlockDef))

    const workspace: CodeWorkspace = newWorkspace()
    Object.assign(workspace, ws, {
      blocks: blocks
    , program: { chains: chains }
    })
    VersionUtils.updateBlocks(workspace, () => {}, Version6.setBlockInstanceIds())
    VersionUtils.updateBlocks(workspace, () => {}, Version6.updateBlockExpressionStringValues)
    return workspace
  }

  static makeChain(getBlockDef: GetBlockDefType) {
    return (c: ChainInput): Chain => {
      const blocks = c.blocks.map( (b) => Version6.makeBlockInstance(getBlockDef, b) )
      const chain: Chain = { x: 0, y: 0 , blocks: [] }
      Object.assign(chain, c, { blocks: blocks })
      return chain
    }
  }

  static makeBlockDefinition(b: BlockInput): BlockDefinition {
    const clauses = b.clauses.map( (c) => Version6.makeClauseDefinition(c) )
    const params = b.params.map( (a) => Version6.makeAttributeDefinition(a) )
    const properties = b.properties.map( (a) => Version6.makeAttributeDefinition(a) )
    const block: BlockDefinition = newBlockDefinition()
    Object.assign(block, b, {
      isRequired: b.required ?? false
    , clauses: clauses
    , params: params
    , properties: properties
    })
    ObjectUtils.deleteProperties(block, "instanceId", "propertiesDisplay", "required")
    return block
  }

  static makeClauseDefinition(c: ClauseInput): Clause {
    const clause: Clause = {
      action: c.action
    , allowedTags: c.allowedTags
    , open: c.open
    , close: c.close
    }
    Object.assign(clause, c)
    ObjectUtils.deleteProperties(clause, "children")
    return clause
  }

  static makeAttributeDefinition(a: AttributeInput): Attribute {
    var attribute: Attribute | null = null
    switch (a.type) {
      case "text":
        attribute = {
          type: a.type
        , name: a.name
        , unit: a.unit
        , default: a.default
        }
        break

      case "select":
        attribute = {
          type: a.type
        , name: a.name
        , unit: a.unit
        , default: a.default
        , values: a.values
        , quoteValues: a.quoteValues
        }
        break

      case "int":
        attribute = {
          type: a.type
        , name: a.name
        , unit: a.unit
        , default: a.default
        , random: a.random
        , step: a.step
        }
        break

      case "range":
        attribute = {
          type: a.type
        , name: a.name
        , unit: a.unit
        , default: a.default
        , random: a.random
        , step: a.step
        , min: a.min
        , max: a.max
        }
        break

      case "num":
      case "bool":
        attribute =  {
          type: a.type
        , name: a.name
        , unit: a.unit
        , default: a.default
        }
        break

    }
    Object.assign(attribute, a)
    ObjectUtils.deleteProperties(attribute, "expressionValue", "value", "id")
    return attribute
  }

  static makeBlockInstance(getBlockDef: GetBlockDefType, b: BlockInput): BlockInstance {
    const def = getBlockDef(b.id)
    if (def === undefined || b.id === undefined) {
      return ObjectUtils.clone(newBlockInstance(), { definitionId: -1 })
    }

    const clauses = def.clauses.map( (_, i) => Version6.makeClauseInstance(getBlockDef, b.clauses[i]) )
    const params = def.params.map( (a, i) => Version6.makeAttributeValue(a, b.params[i]) )
    const properties = def.properties.map( (a, i) => Version6.makeAttributeValue(a, b.properties[i]) )
    const block: BlockInstance = newBlockInstance()
    Object.assign(block, b, {
      definitionId: b.id
    , clauses: clauses
    , params: params
    , properties: properties
    })
    const extraProps = allBlockProps.filter( (p) => !blockInstanceProps.includes(p) )
    ObjectUtils.deleteProperties(block, "required", ...extraProps)
    return block
  }

  static makeClauseInstance(getBlockDef: GetBlockDefType, c: ClauseInput | undefined): ClauseInstance {
    if (c === undefined) {
      return newClauseInstance()
    }

    const blocks = (c.children ?? []).map( (b) => Version6.makeBlockInstance(getBlockDef, b) )

    const clause: ClauseInstance = {
      blocks: blocks
    }
    Object.assign(clause, c)
    ObjectUtils.deleteProperties(clause, "children", "action", "open", "close", "allowedTags")
    return clause
  }

  static makeAttributeValue(def: Attribute, a: AttributeInput | undefined): AttributeValue {
    if (a === undefined) {
      return makeAttributeDefault(def)
    }

    var value: AttributeValue | null = null
    switch (a.type) {
      case "text":
        value = (def.type !== "text") ?
          makeAttributeDefault(def) :
          {
            type: a.type
          , value: a.value ?? def.default
          }
          break

      case "select":
        value = (def.type !== "select") ?
          makeAttributeDefault(def) :
          {
            type: "select"
          , value: a.value ?? def.default
          }
          break

      case "range":
      case "int":
        value = (def.type !== "range" && def.type !== "int") ?
          makeAttributeDefault(def) :
          {
            type: a.type
          , value: a.value ?? def.default
          }
          break

      case "num":
      case "bool":
        value = (def.type !== "num" && def.type !== "bool" || a.value === undefined) ?
          makeAttributeDefault(def) :
          {
            type: a.type
          , value: (typeof a.value === "string") ? makeExpressionValue(def.type, a.value) : a.value
          , expressionValue: a.expressionValue
          }
          break

      default:
        throw new Error(`Unknown attribute type: ${a}`)

    }

    Object.assign(value, a)
    ObjectUtils.deleteProperties(value, "quoteValues", "values", "min", "max", "step", "random", "id", "name", "unit", "default")
    return value
  }

  static setBlockInstanceIds() {
    const definitionIdToNextInstanceId: Map<number, number> = new Map()
    return (b: any) => {
      if (!definitionIdToNextInstanceId.has(b.definitionId)) {
        definitionIdToNextInstanceId.set(b.definitionId, 0)
      }
      b.instanceId = definitionIdToNextInstanceId.get(b.definitionId)!
      definitionIdToNextInstanceId.set(b.definitionId, b.instanceId + 1)
    }
  }

  static updateBlockExpressionStringValues(b: BlockInstance): void {
    b.params.forEach(Version6.updateExpressionStringValues)
    b.properties.forEach(Version6.updateExpressionStringValues)
  }

  static updateExpressionStringValues(a: AttributeValue): void {
    if (!["num", "bool"].includes(a.type)) {
      return
    }
    if (typeof a.value !== "string") {
      return
    }
    a.value = {
      name: a.value
    , format: null
    , type: (a.type as "num" | "bool")
    , children: []
    }
  }

  static validate(workspaceEnc: any): CodeWorkspace {
    const result = codeWorkspaceSchema.safeParse(workspaceEnc)
    if (result.success) {
      return result.data
    }
    console.log("Workspace data:", workspaceEnc)
    console.log("Zod parsing errors: ", result.error)
    throw new Error(`The NetTango project data was invalid.  See the developer console for the full error.`)
  }
}

export { Version6 }
