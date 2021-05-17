// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { BlockPlacement } from "../src/blocks/block-placement"
import { CodeFormatter } from "../src/blocks/code-formatter"
import { FormatAttributeType, encodeWorkspace, restoreWorkspace } from "../src/nettango"
import { VersionManager } from "../src/versions/version-manager"

test("Unknown properties are maintained in external storage", () => {
  document.body.innerHTML = `<div id="test-space-id"></div>`

  const model = VersionManager.updateWorkspace({
    "version": 5,
    "extraString": "extra information",
    "height": 600, "width": 450,
    "blocks": [{
      "id": 0,
      "action": "sheep actions",
      "extraArray": [ "extra", "values", "to-store" ],
      "required": false,
      "placement": BlockPlacement.STARTER,
      "clauses": [ { "children": [], "open": "[", "close": "]", "extraBool": false } ],
      "params": [ { "id": 0, "type": "int", "extraObject": { "hello": 10 }, "default": 10, "step": 1 } ],
      "properties": [ { "id": 1, "type": "int", "extraNumber": 10, "default": 9, "step": 1 } ],
      "propertiesDisplay": "shown"
    }],
    "program": {
      "chains": [{
        "x": 10, "y": 10,
        "extraString": "more extra information",
        "blocks": [{
          "id": 0,
          "instanceId": 0,
          "action": "sheep actions",
          "extraArray": [ "extra", "values", "to-store" ],
          "required": false,
          "placement": BlockPlacement.STARTER,
          "clauses": [ { "children": [], "open": "[", "close": "]", "extraBool": false } ],
          "params": [ { "id": 0, "type": "int", "extraObject": { "hello": 10 }, "default": 10, "value": 5, "step": 1 } ],
          "properties": [ { "id": 1, "type": "int", "extraNumber": 10, "default": 9, "step": 1 } ],
          "propertiesDisplay": "shown"
        }]
      }]
    }
  })

  const containerId = "test-space-id"
  const workspace   = restoreWorkspace(containerId, model, "NetLogo", formatAttribute)
  const prop1       = workspace.chains[0].blocks[0].properties[0]!
  expect(CodeFormatter.getAttributeValue({ def: prop1.def, a: prop1.a })).toBe("9")

  const result: any = encodeWorkspace(workspace)
  model.program.chains[0].blocks[0].properties[0].value = 9
  expect(result).toStrictEqual(model)

  expect(result.extraString).toStrictEqual("extra information")
  expect(result.blocks[0].extraArray).toStrictEqual(["extra", "values", "to-store"])
  expect(result.blocks[0].clauses[0].extraBool).toStrictEqual(false)
  expect(result.blocks[0].params[0].extraObject).toStrictEqual({ "hello": 10 })
  expect(result.blocks[0].properties[0].extraNumber).toStrictEqual(10)
  expect(result.program.chains[0].extraString).toStrictEqual("more extra information")
})

const formatAttribute: FormatAttributeType = (containerId, blockId, instanceId, attributeId, value, attributeType) =>
  value.toString()
