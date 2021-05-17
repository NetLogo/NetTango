// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import {
  Clause
, ClauseInstance
, ExpressionAttribute
, Expression
, ExpressionValue
, IntAttribute
, NumberValue
, SelectAttribute
, StringValue
} from "../src/types/types"

import { ObjectUtils } from "../src/utils/object-utils"
import { VersionManager } from "../src/versions/version-manager"

import { newAttribute, newAttributeValue, newBlockDefinition, newBlockInstance, newClauseDefinition, newClauseInstance, newExpression, newWorkspace } from "../src/versions/empty-objects"

test("Version1 - blank workspace gets version added", () => {
  const model = {}
  const expected = newWorkspace()
  const result = VersionManager.updateWorkspace(model)
  expect(result).toStrictEqual(expected)
})

test("Version1 - block gets id added", () => {
  const action = { "action": "wolf actions" }
  const model = {
    "blocks": [ action ]
  }

  const expected = newWorkspace()
  const blockDef = ObjectUtils.clone(newBlockDefinition(), { id: 0, action: "wolf actions" })
  expected.blocks.push(blockDef)

  const result = VersionManager.updateWorkspace(model)

  expect(result).toStrictEqual(expected)
})

test("Version1 - chain block gets id added", () => {
  const action = { "action": "wolf actions" }
  const chain = { "action": "wolf actions" }
  const model = {
    "blocks": [ action ],
    "program": { "chains": [ [ chain ] ] }
  }

  const expected = newWorkspace()
  const blockDef = ObjectUtils.clone(newBlockDefinition(), { id: 0, action: "wolf actions" })
  expected.blocks.push(blockDef)
  const blockInst = ObjectUtils.clone(newBlockInstance(), { definitionId: 0, instanceId: 0 })
  expected.program.chains.push({
    x: 0, y: 0, blocks: [blockInst]
  })

  const result = VersionManager.updateWorkspace(model)
  expect(result).toStrictEqual(expected)
})

test("Version1 - chain block with children gets id added", () => {
  const wolf = { "action": "wolf actions", "children": [] }
  const forward = { "action": "forward 10" }
  const chain = { "action": "wolf actions", "children": [ forward ] }
  const model = {
    "blocks": [ wolf, forward ],
    "program": { "chains": [ [ chain ] ] }
  }

  const expected = newWorkspace()
  const blockDef1 = ObjectUtils.clone(newBlockDefinition(), { id: 0, action: "wolf actions" })
  const clause1: Clause = ObjectUtils.clone(newClauseDefinition())
  blockDef1.clauses.push(clause1)
  expected.blocks.push(blockDef1)
  const blockDef2 = ObjectUtils.clone(newBlockDefinition(), { id: 1, action: "forward 10" })
  expected.blocks.push(blockDef2)
  const blockInst1 = ObjectUtils.clone(newBlockInstance(), { definitionId: 0, instanceId: 0 })
  const clauseInst1: ClauseInstance = ObjectUtils.clone(newClauseInstance())
  blockInst1.clauses.push(clauseInst1)
  const blockInst2 = ObjectUtils.clone(newBlockInstance(), { definitionId: 1, instanceId: 0 })
  blockInst1.clauses[0].blocks.push(blockInst2)
  expected.program.chains.push({
    x: 0, y: 0, blocks: [blockInst1]
  })

  const result = VersionManager.updateWorkspace(model)
  expect(result).toStrictEqual(expected)
})

test("Version1 - chain block with clauses gets id added", () => {
  const wolf = { "action": "wolf actions", "clauses": [ {} ] }
  const forward = { "action": "forward 10" }
  const chain = { "action": "wolf actions", "clauses": [ { "children": [ forward ] } ] }
  const model = {
    "blocks": [ wolf, forward ],
    "program": { "chains": [ [ chain ] ] }
  }

  const expected = newWorkspace()
  const blockDef1 = ObjectUtils.clone(newBlockDefinition(), { id: 0, action: "wolf actions" })
  const clause1: Clause = ObjectUtils.clone(newClauseDefinition())
  blockDef1.clauses.push(clause1)
  const clause2: Clause = newClauseDefinition()
  blockDef1.clauses.push(clause2)
  expected.blocks.push(blockDef1)
  const blockDef2 = ObjectUtils.clone(newBlockDefinition(), { id: 1, action: "forward 10" })
  expected.blocks.push(blockDef2)
  const blockInst1 = ObjectUtils.clone(newBlockInstance(), { definitionId: 0, instanceId: 0 })
  const clauseInst1: ClauseInstance = newClauseInstance()
  blockInst1.clauses.push(clauseInst1)
  const clauseInst2: ClauseInstance = newClauseInstance()
  blockInst1.clauses.push(clauseInst2)
  const blockInst2 = ObjectUtils.clone(newBlockInstance(), { definitionId: 1, instanceId: 0 })
  blockInst1.clauses[1].blocks.push(blockInst2)
  expected.program.chains.push({
    x: 0, y: 0, blocks: [blockInst1]
  })

  const result = VersionManager.updateWorkspace(model)
  expect(result).toStrictEqual(expected)
})

test("Version1 - block, parameter, and property get ids added", () => {
  const action = {
    "action": "wolf actions",
    "params": [ { "type": "int", "default": 10 } ],
    "properties": [ { "type": "int", "default": 9 } ]
  }
  const model = {
    "blocks": [ action ]
  }

  const expected = newWorkspace()
  const blockDef1 = ObjectUtils.clone(newBlockDefinition(), { id: 0, action: "wolf actions" })
  const param1: IntAttribute = ObjectUtils.clone(newAttribute("int") as IntAttribute, { default: 10 })
  blockDef1.params.push(param1)
  const prop1: IntAttribute = ObjectUtils.clone(newAttribute("int") as IntAttribute, { default: 9 })
  blockDef1.properties.push(prop1)
  expected.blocks.push(blockDef1)

  const result = VersionManager.updateWorkspace(model)
  expect(result).toStrictEqual(expected)
})

test("Version1 - chain block, parameter, and property get ids added", () => {
  const action = {
    "action": "wolf actions",
    "params": [ { "type": "int", "default": 10 } ],
    "properties": [ { "type": "int", "default": 9 } ]
  }
  const chain = {
    "action": "wolf actions",
    "params": [ { "type": "int", "default": 5 } ],
    "properties": [ { "type": "int", "default": 4 } ]
  }
  const model = {
    "blocks": [ action ],
    "program": { "chains": [ [ chain ] ] }
  }

  const expected = newWorkspace()
  const blockDef1 = ObjectUtils.clone(newBlockDefinition(), { id: 0, action: "wolf actions" })
  const param1: IntAttribute = ObjectUtils.clone(newAttribute("int") as IntAttribute, { default: 10 })
  blockDef1.params.push(param1)
  const prop1: IntAttribute = ObjectUtils.clone(newAttribute("int") as IntAttribute, { default: 9 })
  blockDef1.properties.push(prop1)
  expected.blocks.push(blockDef1)
  const blockInst1 = ObjectUtils.clone(newBlockInstance(), { definitionId: 0, instanceId: 0 })
  const paramVal1: NumberValue = ObjectUtils.clone(newAttributeValue("int") as NumberValue, { value: 10 })
  blockInst1.params.push(paramVal1)
  const propVal1: NumberValue = ObjectUtils.clone(newAttributeValue("int") as NumberValue, { value: 9 })
  blockInst1.properties.push(propVal1)
  expected.program.chains.push({
    x: 0, y: 0, blocks: [blockInst1]
  })

  const result = VersionManager.updateWorkspace(model)
  expect(result).toStrictEqual(expected)
})

test("Version2 - select parameter converts to objects", () => {
  const action = {
    "id": 0,
    "action": "wolf actions",
    "params": [ { "type": "select", "default": "apples", "values": [ "apples", "oranges" ] } ]
  }
  const chain = {
    "id": 0,
    "action": "wolf actions",
    "params": [ { "type": "select", "default": "apples", "values": [ "apples", "oranges" ] } ]
  }
  const model = {
    "version": 1,
    "blocks": [ action ],
    "program": { "chains": [ [ chain ] ] }
  }

  const expected = newWorkspace()
  const blockDef1 = ObjectUtils.clone(newBlockDefinition(), { id: 0, action: "wolf actions" })
  const param1: SelectAttribute = ObjectUtils.clone(newAttribute("select") as SelectAttribute, {
    default: "apples"
  , values: [{ actual: "apples", display: null }, { actual: "oranges", display: null }]
  })
  blockDef1.params.push(param1)
  expected.blocks.push(blockDef1)
  const blockInst1 = ObjectUtils.clone(newBlockInstance(), { definitionId: 0, instanceId: 0 })
  const paramInst1: StringValue = ObjectUtils.clone(newAttributeValue("select") as StringValue, { value: "apples" })
  blockInst1.params.push(paramInst1)
  expected.program.chains.push({
    x: 0, y: 0, blocks: [blockInst1]
  })

  const result = VersionManager.updateWorkspace(model)
  expect(result).toStrictEqual(expected)
})

test("Version4 - chain gets x and y coordinates from first block", () => {
  const model = {
    "version": 3,
    "blocks": [ { "id": 0, "action": "act1" } ],
    "program": {
      "chains": [ [ { "id": 0, "action": "act1", "x": 10, "y": 7 }, { "id": 0, "action": "act1", "x": 5, "y": 3 } ] ]
    }
  }

  const expected = newWorkspace()
  const blockDef1 = ObjectUtils.clone(newBlockDefinition(), { id: 0, action: "act1" })
  expected.blocks.push(blockDef1)
  const blockInst1 = ObjectUtils.clone(newBlockInstance(), { definitionId: 0, instanceId: 0 })
  const blockInst2 = ObjectUtils.clone(newBlockInstance(), { definitionId: 0, instanceId: 1 })
  expected.program.chains.push({
    x: 10, y: 7, blocks: [blockInst1, blockInst2]
  })

  const result = VersionManager.updateWorkspace(model)
  expect(result).toStrictEqual(expected)
})

test("Version5 - select with unquoted values gets `never-quote` set", () => {
  const model = {
    "version": 4,
    "blocks": [ { "id": 0, "action": "act1", "params": [ {
      "id": 0,
      "type": "select",
      "name": "color",
      "default": "red",
      "values": [ { "actual": "red", "display": null }, { "actual": "blue", "display": null }, { "actual": "green", "display": null } ]
    } ] } ]
  }

  const expected = newWorkspace()
  const blockDef1 = ObjectUtils.clone(newBlockDefinition(), { id: 0, action: "act1" })
  const param1: SelectAttribute = ObjectUtils.clone(newAttribute("select") as SelectAttribute, {
    default: "red"
  , name: "color"
  , quoteValues: "never-quote"
  , values: [{ actual: "red", display: null }, { actual: "blue", display: null }, { actual: "green", display: null }]
  })
  blockDef1.params.push(param1)
  expected.blocks.push(blockDef1)

  const result = VersionManager.updateWorkspace(model)
  expect(result).toStrictEqual(expected)
})

test("Version6 - expression attributes get proper values reset", () => {

  const model = {
    version: 4
  , blocks: [{
      id: 0
    , action: "act1"
    , params: [{
        id: 0
      , type: "num"
      , name: "expr-me"
      , default: "0"
    }]
  }]
  , program: { chains: [{
      x: 0, y: 0
    , blocks: [
      {
        id: 0
      , instanceId: 0
      , action: "act1"
      , params: [{ id: 0, type: "num", value: "10" }]
      }
    , {
        id: 0
      , instanceId: 1
      , action: "act1"
      , params: [{
        id: 0
      , type: "num"
      , value: {
          name: "+"
        , type: "num"
        , children: [
            { name: "5", type: "num" }
          , { name: "/", type: "num",
              children: [
                { name: "7", type: "num" }
              , { name: "2", type: "num" }
              ]
            }
          ]
        }
      }]
    }]}]}
  }

  const expected = newWorkspace()
  const blockDef1 = ObjectUtils.clone(newBlockDefinition(), { id: 0, action: "act1" })
  const param1: ExpressionAttribute = ObjectUtils.clone(newAttribute("num") as ExpressionAttribute, {
    default: "0"
  , name: "expr-me"
  })
  blockDef1.params.push(param1)
  expected.blocks.push(blockDef1)
  const blockInst1 = ObjectUtils.clone(newBlockInstance(), { definitionId: 0, instanceId: 0 })
  const expr1: Expression = ObjectUtils.clone(newExpression("num"), { name: "10" })
  const paramInst1: ExpressionValue = ObjectUtils.clone(newAttributeValue("num") as ExpressionValue, { value: expr1 })
  blockInst1.params.push(paramInst1)
  const blockInst2 = ObjectUtils.clone(newBlockInstance(), { definitionId: 0, instanceId: 1 })
  const paramInstValue2: Expression = {
    name: "+"
  , type: "num"
  , format: null
  , children: [
      { name: "5", type: "num", format: null, children: [] }
    , { name: "/", type: "num", format: null, children: [
        { name: "7", type: "num", format: null, children: [] }
      , { name: "2", type: "num", format: null, children: [] }
      ]}
    ]
  }
  const paramInst2: ExpressionValue = ObjectUtils.clone(newAttributeValue("num") as ExpressionValue, { value: paramInstValue2 })
  blockInst2.params.push(paramInst2)
  expected.program.chains.push({ x: 0, y: 0, blocks: [blockInst1, blockInst2] })

  const result = VersionManager.updateWorkspace(model)
  expect(result).toStrictEqual(expected)

})
