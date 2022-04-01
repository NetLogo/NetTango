// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import {
  Attribute
, AttributeValue
, ExpressionAttribute
, Expression, ExpressionValue
, IntAttribute
, NumberValue
, RangeAttribute
, SelectAttribute
, StringValue
, TextAttribute
} from "../../types/types"

import { BlockInstanceUI } from "../block-instance"
import { AttributeUI } from "./attribute"
import { ExpressionAttributeUI } from "./expression-attribute"
import { IntAttributeUI } from "./int-attribute"
import { RangeAttributeUI } from "./range-attribute"
import { SelectAttributeUI } from "./select-attribute"
import { TextAttributeUI } from "./text-attribute"

function createAttribute(id: number, def: Attribute, a: AttributeValue, block: BlockInstanceUI, isProperty: boolean): AttributeUI {
  switch (a.type) {
    case 'text':
      return new TextAttributeUI(id, def as TextAttribute, a, block, isProperty)

    case 'int':
      return new IntAttributeUI(id, def as IntAttribute, a, block, isProperty)

    case 'range':
      return new RangeAttributeUI(id, def as RangeAttribute, a, block, isProperty)

    case 'select':
      return new SelectAttributeUI(id, def as SelectAttribute, a, block, isProperty)

    case 'num':
    case 'bool':
      return new ExpressionAttributeUI(id, def as ExpressionAttribute, a, block, isProperty)
  }
}

function makeAttributeDefault(attribute: Attribute): AttributeValue {
  switch (attribute.type) {
    case "text":
    case "select":
      return makeStringDefault(attribute.type, attribute.default)

    case "int":
    case "range":
      return makeNumberDefault(attribute.type, attribute.default)

    case "num":
    case "bool":
      return makeExpressionDefault(attribute)
  }
}

function makeStringDefault(type: "text" | "select", def: string): StringValue {
  return {
    type: type
  , value: def
  }
}

function makeNumberDefault(type: "int" | "range", def: number): NumberValue {
  return {
    type: type
  , value: def
  }
}

function makeExpressionDefault(attribute: ExpressionAttribute): ExpressionValue {
  return {
    type: attribute.type
  , value: makeExpressionValue(attribute.type, attribute.default)
  , expressionValue: attribute.default
  }
}

function makeExpressionValue(type: "num" | "bool", name: string): Expression {
  return {
    name: name
  , type: type
  , format: null
  , children: []
  }
}

export {
  createAttribute
, makeAttributeDefault
, makeStringDefault
, makeNumberDefault
, makeExpressionDefault
, makeExpressionValue
}
