// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { AttributeTypes } from "../src/blocks/attributes/attribute"
import { BlockPlacement } from "../src/blocks/block-placement"
import { NetTango } from "../src/nettango"
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from "../src/nettango-defaults"
import { ObjectUtils } from "../src/utils/object-utils"
import { VersionManager } from "../src/versions/version-manager"

beforeEach( () => document.body.innerHTML = `<div id="nt-canvas"></div>` )

const NETLOGO_MODEL_1 = {
  "version": 1,
  "blocks": [
    {
      "id": 23,
      "action": "wolf actions",
      "type": "nlogo:procedure",
      "limit": 1,
      "format": "to wolf-actions",
      "blockColor": "#bb5555",
      "required": true
    },
    {
      "id": 24,
      "action": "forward",
      "format": "forward ({0} + {P0})",
      "type": "nlogo:command",
      "params": [
        {
          "id": 3,
          "type": "range",
          "name": "steps",
          "unit": "",
          "value": 1,
          "default": 1,
          "random": false,
          "step": 0.1,
          "min": 0,
          "max": 3
        }
      ],
      "properties": [
        {
          "id": 4,
          "type": "int",
          "step": 2,
          "name": "",
          "unit": "",
          "value": 2,
        }
      ]
    },
    {
      "id": 25,
      "action": "sheep actions",
      "type": "nlogo:procedure",
      "limit": 1,
      "format": "to sheep-actions",
      "blockColor": "#bb5555",
      "required": true
    }
  ],
  "program": {
    "chains": [
      [
        {
          "id": 23,
          "instanceId": 3,
          "action": "wolf actions",
          "type": "nlogo:procedure",
          "format": "to wolf-actions",
          "required": true,
          "x": 4,
          "y": 8
        },
        {
          "id": 24,
          "instanceId": 4,
          "action": "forward",
          "type": "nlogo:command",
          "format": "forward ({0} + {P0})",
          "required": false,
          "x": 4,
          "y": 11.4,
          "params": [
            {
              "id": 3,
              "type": "range",
              "name": "steps",
              "unit": "",
              "value": 1,
              "default": 1,
              "random": false,
              "step": 0.1,
              "min": 0,
              "max": 3
            }
          ],
          "properties": [
            {
              "id": 4,
              "type": "int",
              "step": 2,
              "name": "",
              "unit": "",
              "value": 2
            }
          ]
        }
      ],
      [
        {
          "id": 25,
          "instanceId": 5,
          "action": "sheep actions",
          "type": "nlogo:procedure",
          "format": "to sheep-actions",
          "required": true,
          "x": 7.5607421875,
          "y": 20
        },
        {
          "id": 24,
          "instanceId": 6,
          "action": "forward",
          "type": "nlogo:command",
          "format": "forward ({0} + {P0})",
          "required": false,
          "x": 7.5607421875,
          "y": 23.4,
          "params": [
            {
              "id": 3,
              "type": "range",
              "name": "steps",
              "unit": "",
              "value": 2,
              "default": 1,
              "random": false,
              "step": 0.1,
              "min": 0,
              "max": 3
            }
          ],
          "properties": [
            {
              "id": 4,
              "type": "int",
              "name": "",
              "unit": "",
              "value": 3,
              "step": 2
            }
          ]
        }
      ]
    ]
  }
}

function copyJson(json: any) { return ObjectUtils.clone<any>(json) }

function formatAttributeForNetTangoExtension(containerId: string, blockId: number, instanceId: number, attributeId: number, value: any, attributeType: AttributeTypes, isProperty: boolean) {
  const prefix = isProperty ? "P" : ""
  return `__${containerId}_${blockId}_${instanceId}_${prefix}${attributeId}`
}

function formatAttributeAsValue(containerId: string, blockId: number, instanceId: number, attributeId: number, value: any, attributeType: AttributeTypes): string {
  return value.toString()
}

test("Smoke test of NetTango restore and save", () => {
  NetTango.restore("NetLogo", "nt-canvas", {}, formatAttributeForNetTangoExtension)
  const result = NetTango.save("nt-canvas")
  const expected = VersionManager.updateWorkspace({
    "version": 5,
    "height": DEFAULT_HEIGHT, "width": DEFAULT_WIDTH,
    "blocks": [],
    "program": { "chains": [] }
  })
  expect(result).toStrictEqual(expected)
})

test("Remove a parameter from a block that is in a chain", () => {
  const json = {
    "version": 1,
    "blocks": [
      {
        "id": 23,
        "action": "wolf actions",
        "type": "nlogo:procedure",
        "limit": 1,
        "format": "to wolf-actions",
        "blockColor": "#bb5555",
        "required": true
      },
      {
        "id": 24,
        "action": "forward",
        "format": "forward 10",
        "type": "nlogo:command",
        "params": [],
        "properties": []
      }
    ],
    "expressions": [],
    "program": {
      "chains": [
        [
          {
            "id": 23,
            "action": "wolf actions",
            "type": "nlogo:procedure",
            "format": "to wolf-actions",
            "required": true,
            "x": 4,
            "y": 8
          },
          {
            "id": 24,
            "action": "forward",
            "type": "nlogo:command",
            "format": "forward {0}",
            "required": false,
            "x": 4,
            "y": 11.4,
            "params": [
              {
                "id": 3,
                "type": "range",
                "name": "steps",
                "unit": "",
                "value": 1,
                "default": 1,
                "random": false,
                "step": 0.1,
                "min": 0,
                "max": 3
              }
            ]
          }
        ]
      ]
    }
  }
  var expected = copyJson(json)
  expected.height = DEFAULT_HEIGHT
  expected.width  = DEFAULT_WIDTH
  expected.blocks[1].required = false
  expected.program.chains[0][0].instanceId = 0
  expected.program.chains[0][0].limit = 1
  expected.program.chains[0][0].blockColor = '#bb5555'
  expected.program.chains[0][1].instanceId = 1
  expected.program.chains[0][1].format = "forward 10"
  delete expected.blocks[1].params
  delete expected.blocks[1].properties
  delete expected.expressions
  delete expected.program.chains[0][1].params
  expected = VersionManager.updateWorkspace(expected)
  NetTango.restore("NetLogo", "nt-canvas", json, formatAttributeForNetTangoExtension)
  var result = NetTango.save("nt-canvas")
  expect(result).toStrictEqual(expected)
  var codeResult = NetTango.exportCode("nt-canvas", null)
  expect(codeResult).toStrictEqual("to wolf-actions\n  forward 10\nend\n\n")
})

test("NetLogo code exports in proper order with params", () => {
  const testCanavsID = "nt-canvas"
  var expected = copyJson(NETLOGO_MODEL_1)
  expected.height = DEFAULT_HEIGHT
  expected.width  = DEFAULT_WIDTH
  expected.blocks[1].propertiesDisplay = 'shown'
  expected.blocks[1].required = false
  expected.program.chains[0][0].blockColor = '#bb5555'
  expected.program.chains[0][0].instanceId = 0
  expected.program.chains[0][1].instanceId = 1
  expected.program.chains[0][1].propertiesDisplay = 'shown'
  expected.program.chains[1][0].blockColor = '#bb5555'
  expected.program.chains[1][0].instanceId = 2
  expected.program.chains[1][1].instanceId = 3
  expected.program.chains[1][1].propertiesDisplay = 'shown'
  delete expected.blocks[1].params[0].value
  delete expected.blocks[1].properties[0].value
  expected = VersionManager.updateWorkspace(expected)

  NetTango.restore("NetLogo", testCanavsID, copyJson(NETLOGO_MODEL_1), formatAttributeForNetTangoExtension)

  const result = NetTango.save(testCanavsID)
  expect(result).toStrictEqual(expected)

  const codeResult = NetTango.exportCode(testCanavsID, null)
  expect(codeResult).toStrictEqual("to sheep-actions\n  forward (__nt-canvas_24_1_0 + __nt-canvas_24_1_P0)\nend\n\nto wolf-actions\n  forward (__nt-canvas_24_0_0 + __nt-canvas_24_0_P0)\nend\n\n")
})

test("Model with ifelse properly imports and generates code", () => {
  const testCanavsID = "nt-canvas"

  const proc: any    = { "id": 4, "action": "wolf actions", "format": "to wolf", "type": "nlogo:procedure", "required": true }
  const forward: any = { "id": 1, "action": "forward", "format": "forward 1", "required": false }
  const wiggle: any  = { "id": 2, "action": "wiggle", "format": "left random 360", "required": false }
  const chance: any  = { "id": 0, "action": "chance", "format": "ifelse random 100 < 20", "type": "nlogo:ifelse", "required": false, "clauses": [ { "children": [] } ] }
  const forwardInst = copyJson(forward)
  forwardInst["instanceId"] = 2
  const wiggleInst = copyJson(wiggle)
  wiggleInst["instanceId"] = 3
  const chanceInst = copyJson(chance)
  chanceInst["instanceId"] = 1
  chanceInst["children"] = [ forwardInst ]
  chanceInst["clauses"] = [ { "children": [ wiggleInst ] }, { "action": "end-chance"} ]
  const procInst = copyJson(proc)
  procInst["instanceId"] = 0
  const model = {
    "version": 2,
    "blocks": [ proc, chance, forward, wiggle ],
    "program": { "chains": [ [ procInst, chanceInst ] ] }
  }

  var expected = copyJson(model)
  expected.height = DEFAULT_HEIGHT
  expected.width  = DEFAULT_WIDTH
  expected.program.chains[0][1].clauses = [{ "children": [copyJson(wiggleInst)]}]
  expected = VersionManager.updateWorkspace(expected)

  NetTango.restore("NetLogo", "nt-canvas", model, formatAttributeForNetTangoExtension)
  var result = NetTango.save("nt-canvas")
  expect(result).toStrictEqual(expected)

  var codeResult = NetTango.exportCode(testCanavsID, null)

  expect(codeResult).toStrictEqual("to wolf\n  ifelse random 100 < 20\n  [\n    forward 1\n  ]\n  [\n    left random 360\n  ]\nend\n\n")
})

test("Unversioned model gets IDs added for version 1", () => {
  const action = {
    "action": "sheep actions",
    "required": false,
    "params": [ { "type": "int", "default": 10, "step": 1 } ],
    "properties": [ { "type": "int", "default": 9, "step": 1 } ]
  }
  const block = {
    "action": "sheep actions",
    "required": false,
    "params": [ { "type": "int", "default": 5 } ],
    "properties": [ { "type": "int", "default": 4 } ]
  }
  const model = {
    "blocks": [ action ],
    "program": { "chains": [ [ block ] ] }
  }

  var expected = copyJson(model)
  expected.height = DEFAULT_HEIGHT
  expected.width  = DEFAULT_WIDTH
  expected.blocks[0].propertiesDisplay = 'shown'
  expected.program.chains[0][0].instanceId = 0
  expected.program.chains[0][0].propertiesDisplay = 'shown'
  expected.program.chains[0][0].params[0].default = 10
  expected.program.chains[0][0].params[0].step = 1
  expected.program.chains[0][0].params[0].value = 10
  expected.program.chains[0][0].properties[0].default = 9
  expected.program.chains[0][0].properties[0].step = 1
  expected.program.chains[0][0].properties[0].value = 9
  expected = VersionManager.updateWorkspace(expected)

  NetTango.restore("NetLogo", "nt-canvas", model, formatAttributeForNetTangoExtension)
  const result = NetTango.save("nt-canvas")

  expect(result).toStrictEqual(expected)
})

test("Duplicate menu block IDs get reset automatically", () => {

  const model: any = {
    "version": 5, "width": 300, "height": 300,
    "blocks": [ {
        "id": 0,
        "action": "sheep actions", "required": true, "placement": BlockPlacement.STARTER,
        "params": [ { "id": 0, "type": "int", "default": 10, "step": 2 } ],
        "properties": [ { "id": 1, "type": "int", "default": 9, "step": 1 } ],
        "propertiesDisplay": "shown"
      },
      {
        "id": 0,
        "action": "wolf actions", "required": true, "placement": BlockPlacement.STARTER,
        "params": [ { "id": 0, "type": "int", "default": 10, "step": 2 } ],
        "properties": [ { "id": 1, "type": "int", "default": 9, "step": 1 } ],
        "propertiesDisplay": "shown"
      }
    ],
    "program": { "chains": [] }
  }

  var expected = copyJson(model)
  expected.blocks[1].id = 1
  expected = VersionManager.updateWorkspace(expected)

  NetTango.restore("NetLogo", "nt-canvas", model, formatAttributeForNetTangoExtension)
  const result = NetTango.save("nt-canvas")

  expect(result).toStrictEqual(expected)

})

test("Version 1 gets IDs added for new block", () => {
  const action: any = {
    "action": "sheep actions", "required": true,
    "params": [ { "type": "int", "default": 10, "step": 1 } ],
    "properties": [ { "type": "int", "default": 9, "step": 1 } ]
  }
  const model: any = {
    "blocks": [ action ],
    "program": { "chains": [] },
    "version": 1
  }

  var expected = copyJson(model)
  expected.height = DEFAULT_HEIGHT
  expected.width  = DEFAULT_WIDTH
  expected.blocks[0].id = 0
  expected.blocks[0].propertiesDisplay = 'shown'
  expected.blocks[0].params[0].id = 0
  expected.blocks[0].properties[0].id = 1
  expected = VersionManager.updateWorkspace(expected)

  NetTango.restore("NetLogo", "nt-canvas", model, formatAttributeForNetTangoExtension)
  const result = NetTango.save("nt-canvas")

  expect(result).toStrictEqual(expected)
})

test("Version 3 model with select and expression attributes saves correctly", () => {
  const model =
    {
      "version": 3,
      "height": 500,
      "width": 430,
      "blocks": [
        {
          "action": "procede", "format": "to procede show ({0} + {P0})", "required": true, "limit": 1, "id": 0, "type": "nlogo:procedure",
          "params": [
            {
              "name": "SelectMe", "type": "select", "default": "10",
              "values": [ { "actual": "10", "display": "mars" }, { "actual": "20", "display": "venus" }, { "actual": "30", "display": "mercury" } ],
              "id": 0
            }
          ],
          "properties": [ { "name": "ExpressMe", "type": "num", "default": "5", "id": 1 } ]
        },
        {
          "action": "show", "format": "show ({P0})", "required": false, "id": 1, "type": "nlogo:command",
          "properties": [ { "name": "ExpressMe", "type": "num", "default": "1", "id": 0 } ]
        }
      ],
      "expressions": [
        { "name": "true", "type": "bool" },
        { "name": "false", "type": "bool" },
        { "name": "AND", "type": "bool", "arguments": [ "bool", "bool" ], "format": "({0} and {1})" },
        { "name": "NOT", "type": "bool", "arguments": [ "bool" ], "format": "(not {0})" },
        { "name": ">", "type": "bool", "arguments": [ "num", "num" ] },
        { "name": "random", "type": "num", "arguments": [ "num" ], "format": "random-float {0}" }
      ],
      "program": {
        "chains": [
          [
            {
              "id": 0, "instanceId": 2, "action": "procede", "type": "nlogo:procedure", "format": "to procede show ({0} + {P0})", "required": true, "x": 46, "y": 11,
              "params": [
                {
                  "id": 0, "type": "select", "name": "SelectMe", "value": "20", "default": "10",
                  "values": [ { "actual": "10", "display": "mars" }, { "actual": "20", "display": "venus" }, { "actual": "30", "display": "mercury" } ]
                }
              ],
              "properties": [
                {
                  "id": 1, "type": "num", "name": "ExpressMe",
                  "value": { "name": "+", "type": "num",
                    "children": [
                      { "name": "5", "type": "num" },
                      { "name": "/", "type": "num",
                        "children": [
                          { "name": "7", "type": "num" },
                          { "name": "2", "type": "num" }
                        ]
                      }
                    ]
                  },
                  "default": "5",
                  "expressionValue": "(5 + (7 / 2))"
                }
              ],
              "propertiesDisplay": "hidden"
            },
            {
              "id": 1, "instanceId": 6, "action": "show", "type": "nlogo:command", "format": "show ({P0})", "required": false,
              "properties": [ { "id": 0, "type": "num", "name": "ExpressMe", "value": "3", "default": "1" } ],
              "propertiesDisplay": "hidden"
            }
          ]
        ]
      }
    }

  var expected = copyJson(model)
  expected.blocks[0].propertiesDisplay = 'shown'
  expected.blocks[1].propertiesDisplay = 'shown'
  expected.program.chains[0][0].instanceId = 0
  expected.program.chains[0][1].instanceId = 1
  expected = VersionManager.updateWorkspace(expected)

  NetTango.restore("NetLogo", "nt-canvas", model, formatAttributeAsValue)

  const code = NetTango.exportCode("nt-canvas", null)
  expect(code).toStrictEqual("to procede show (20 + (5 + (7 / 2)))\n  show (3)\nend\n\n")

  const result = NetTango.save("nt-canvas")
  expect(result).toStrictEqual(expected)
})

test("Model uses custom clause open and close formats correctly", () => {
  const model = {
    "version": 5, "height": 600, "width": 450,
    "blocks": [{
      "id": 0,
      "action": "to sheep-actions",
      "required": true,
      "placement": BlockPlacement.STARTER
    },{
      "id": 1,
      "action": "ifelses",
      "required": false,
      "format": "(ifelse", "closeClauses": ") ; {0}",
      "placement": BlockPlacement.CHILD,
      "clauses": [
        { "children": [], "open": "random {0} > 10 [" },
        { "children": [], "open": "random {0} > 20 [", "close": "] ; {0}" },
        { "children": [] }
      ],
      "params": [ { "id": 0, "type": "int", "name": "sample", "step": 1, "default": 10 } ]
    },
    { "id": 2, "action": "show \"hello!\"", "required": false, "placement": BlockPlacement.CHILD }
    ],
    "program": {
      "chains": [{
        "x": 10, "y": 10,
        "blocks": [{
          "id": 0,
          "instanceId": 0,
          "action": "to sheep-actions",
          "required": true,
          "placement": BlockPlacement.STARTER
        }, {
          "id": 1,
          "instanceId": 1,
          "action": "ifelses",
          "required": false,
          "format": "(ifelse", "closeClauses": ") ; {0}",
          "placement": BlockPlacement.CHILD,
          "clauses": [
            { "open": "random {0} > 10 [", "children": [{ "id": 2, "instanceId": 2, "action": "show \"hello!\"", "required": false, "placement": BlockPlacement.CHILD }]},
            { "open": "random {0} > 20 [", "close": "] ; {0}", "children": [{ "id": 2, "instanceId": 3, "action": "show \"hello!\"", "required": false, "placement": BlockPlacement.CHILD} ] },
            { "children": [{ "id": 2, "instanceId": 4, "action": "show \"hello!\"", "required": false, "placement": BlockPlacement.CHILD }] }
          ],
          "params": [ { "id": 0, "type": "int", "name": "sample", "step": 1, "default": 10, "value": 15 } ]
        }]
      }]
    }
  }

  var expected = copyJson(model)
  expected = VersionManager.updateWorkspace(expected)

  const containerId = "nt-canvas"
  NetTango.restore("NetLogo", containerId, copyJson(model), formatAttributeAsValue)
  const result = NetTango.save(containerId)

  expect(result).toStrictEqual(expected)

  const codeResult = NetTango.exportCode(containerId, null)
  const expectedCode =
`to sheep-actions
  (ifelse
  random 15 > 10 [
    show "hello!"
  ]
  random 15 > 20 [
    show "hello!"
  ] ; 15
  [
    show "hello!"
  ]
  ) ; 15
end

`
  expect(codeResult).toStrictEqual(expectedCode)
})
