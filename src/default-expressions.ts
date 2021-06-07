// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { ExpressionDefinition } from "./types/types"

const netLogoDefaults: ExpressionDefinition[] = [
  { name: "true",   type: "bool", arguments: [],                 format: null },
  { name: "false",  type: "bool", arguments: [],                 format: null },
  { name: "and",    type: "bool", arguments: [ "bool", "bool"],  format: "({0} and {1})" },
  { name: "or",     type: "bool", arguments: [ "bool", "bool" ], format: "({0} or {1})" },
  { name: "not",    type: "bool", arguments: [ "bool"],          format: "(not {0})" },
  { name: ">",      type: "bool", arguments: [ "num", "num" ],   format: null },
  { name: ">=",     type: "bool", arguments: [ "num", "num" ],   format: null },
  { name: "<",      type: "bool", arguments: [ "num", "num" ],   format: null },
  { name: "<=",     type: "bool", arguments: [ "num", "num" ],   format: null },
  { name: "!=",     type: "bool", arguments: [ "num", "num" ],   format: null },
  { name: "=",      type: "bool", arguments: [ "num", "num" ],   format: null },
  { name: "+",      type: "num",  arguments: [ "num", "num"],    format: null },
  { name: "-",      type: "num",  arguments: [ "num", "num"],    format: null },
  { name: "×",      type: "num",  arguments: [ "num", "num"],    format: "({0} * {1})" },
  { name: "/",      type: "num",  arguments: [ "num", "num"],    format: null },
  { name: "random", type: "num",  arguments: [ "num" ],          format: "random-float {0}" }
]

const defaultExpressions: Map<string, ExpressionDefinition[]> = new Map()
defaultExpressions.set("NetLogo", netLogoDefaults)

export { defaultExpressions }
