// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { z } from "zod"
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from "../nettango-defaults"

export type BlockStyle  = z.infer<typeof blockStyleSchema>

export type InheritTags = z.infer<typeof inheritTagsSchema>
export type UnrestrictedTags = z.infer<typeof unrestrictedTagsSchema>
export type AnyOfTags = z.infer<typeof anyOfTagsSchema>
export type NoneOfTags = z.infer<typeof noneOfTagsSchema>
export type ConcreteTags = z.infer<typeof concreteTagsSchema>
export type AllowedTags = z.infer<typeof allowedTagsSchema>

export type SelectOption = z.infer<typeof selectOptionSchema>
export type QuoteOptions = z.infer<typeof quoteOptionsSchema>

export type TextAttribute = z.infer<typeof textAttributeSchema>
export type SelectAttribute = z.infer<typeof selectAttributeSchema>
export type NumAttribute = z.infer<typeof numAttributeSchema>
export type IntAttribute = z.infer<typeof intAttributeSchema>
export type RangeAttribute = z.infer<typeof rangeAttributeSchema>
export type ExpressionAttribute = z.infer<typeof expressionAttributeSchema>
export type Attribute = z.infer<typeof attributeSchema>

export type BlockDefinition = z.infer<typeof blockDefinitionSchema>
export type MenuConfig = z.infer<typeof menuConfigSchema>
export type Clause = z.infer<typeof clauseSchema>
export type Grouping = z.infer<typeof groupingSchema>
export type TagGrouping = z.infer<typeof tagGroupingSchema>

export type Chain = z.infer<typeof chainSchema>
export type BlockInstance = z.infer<typeof blockInstanceSchema>
export type StringValue = z.infer<typeof stringValueSchema>
export type NumberValue = z.infer<typeof numValueSchema>
export type ExpressionValue = z.infer<typeof expressionValueSchema>
export type AttributeValue = z.infer<typeof attributeValueSchema>
export type ExpressionDefinition = z.infer<typeof expressionDefinitionSchema>
export type CodeWorkspace = z.infer<typeof codeWorkspaceSchema>

export type Variable = z.infer<typeof variableSchema>

export type ExpressionTypes = z.infer<typeof expressionTypeSchema>

export type Expression = {
  name: string
  type: ExpressionTypes
  format: string | null
  children: Array<Expression>
}

export type ClauseInstance = {
  blocks: Array<BlockInstance>
}

const blockStyleSchema = z.object({
  blockColor: z.string()
, textColor: z.string()
, borderColor: z.string()
, fontWeight: z.string()
, fontSize: z.string()
, fontFace: z.string()
}).passthrough()

const inheritTagsSchema = z.object({
  type: z.literal("inherit")
}).passthrough()

const unrestrictedTagsSchema = z.object({
  type: z.literal("unrestricted")
}).passthrough()

const anyOfTagsSchema = z.object({
  type: z.literal("any-of")
, tags: z.array(z.string()).default([])
}).passthrough()

const noneOfTagsSchema = z.object({
  type: z.literal("none-of")
, tags: z.array(z.string()).default([])
}).passthrough()

const concreteTagsSchema = z.union([
  unrestrictedTagsSchema
, anyOfTagsSchema
, noneOfTagsSchema
])

const allowedTagsSchema = z.union([
  inheritTagsSchema
, concreteTagsSchema
])

export const clauseSchema = z.object({
  action: z.string().nullable().default(null)
, open: z.string().nullable().default(null)
, close: z.string().nullable().default(null)
, allowedTags: allowedTagsSchema.default({ type: "unrestricted" })
}).passthrough()

export const clauseInstanceSchema: z.ZodSchema<ClauseInstance, any, any> = z.lazy(() =>
  z.object({
    blocks: z.array(blockInstanceSchema).default([])
  }).passthrough()
)

const attributeBaseSchema = z.object({
  name: z.string().nullable().default(null)
, unit: z.string().nullable().default(null)
})

export const textAttributeSchema = attributeBaseSchema.extend({
  type: z.literal("text")
, default: z.string().default("")
}).passthrough()

const selectOptionSchema = z.object({
  actual: z.string()
, display: z.string().nullable().default(null)
}).passthrough()

export const quoteOptionsSchema = z.union([
  z.literal("smart-quote")
, z.literal("always-quote")
, z.literal("never-quote")
])

export const selectAttributeSchema = attributeBaseSchema.extend({
  type: z.literal("select")
, default: z.string().default("")
, quoteValues: quoteOptionsSchema.default("smart-quote")
, values: z.array(selectOptionSchema).default([])
}).passthrough()

const numAttributeSchema = attributeBaseSchema.extend({
  step: z.number().default(1)
, random: z.boolean().default(false)
, default: z.number().default(10)
}).passthrough()

export const intAttributeSchema = numAttributeSchema.extend({
  type: z.literal("int")
}).passthrough()

export const rangeAttributeSchema = numAttributeSchema.extend({
  type: z.literal("range")
, min: z.number().default(0)
, max: z.number().default(100)
}).passthrough()

const expressionTypeSchema = z.union([z.literal("num"), z.literal("bool")])

export const expressionSchema: z.ZodSchema<Expression, any, any> = z.lazy(() =>
  z.object({
    name: z.string()
  , type: expressionTypeSchema.default("num")
  , format: z.string().nullable().default(null)
  , children: z.array(expressionSchema).default([])
  }).passthrough()
)

export const expressionAttributeSchema = attributeBaseSchema.extend({
  type: expressionTypeSchema
, default: z.string().default("0")
}).passthrough()

const attributeSchema = z.union([
  textAttributeSchema
, selectAttributeSchema
, intAttributeSchema
, rangeAttributeSchema
, expressionAttributeSchema
])

export const stringValueSchema = z.object({
  type: z.union([z.literal("text"), z.literal("select")])
, value: z.string().default("")
}).passthrough()

export const numValueSchema = z.object({
  type: z.union([z.literal("int"), z.literal("range")])
, value: z.number().default(0)
}).passthrough()

export const expressionValueSchema = z.object({
  type: z.union([z.literal("num"), z.literal("bool")])
, value: expressionSchema
, expressionValue: z.string().nullable().default("0")
}).passthrough()

const attributeValueSchema = z.union([
  stringValueSchema
, numValueSchema
, expressionValueSchema
])

export const blockDefinitionSchema = z.object({
  id: z.number()
, action: z.string()
, isRequired: z.boolean().default(false)
, placement: z.union([
    z.literal("starter")
  , z.literal("child")
  , z.literal("anywhere")
  ]).default("child")
, type: z.string().nullable().default(null)
, format: z.string().nullable().default(null)
, isTerminal: z.boolean().default(false)
, closeClauses: z.string().nullable().default(null)
, closeStarter: z.string().nullable().default(null)
, limit: z.number().default(0)
, note: z.string().nullable().default(null)
, blockColor: z.string().nullable().default(null)
, textColor: z.string().nullable().default(null)
, borderColor: z.string().nullable().default(null)
, font: z.string().nullable().default(null)
, allowedTags: concreteTagsSchema.default({ type: "unrestricted" })
, tags: z.array(z.string()).default([])
, clauses: z.array(clauseSchema).default([])
, params: z.array(attributeSchema).default([])
, properties: z.array(attributeSchema).default([])
}).passthrough()

export const blockInstanceSchema = z.object({
  definitionId: z.number()
, instanceId: z.number()
, clauses: z.array(clauseInstanceSchema).default([])
, params: z.array(attributeValueSchema).default([])
, properties: z.array(attributeValueSchema).default([])
, propertiesDisplay: z.union([z.literal("shown"), z.literal("hidden")]).default("shown")
}).passthrough()

const chainSchema = z.object({
  x: z.number().default(0)
, y: z.number().default(0)
, blocks: z.array(blockInstanceSchema).default([])
}).passthrough()

const expressionDefinitionSchema = z.object({
  name: z.string()
, type: expressionTypeSchema
, arguments: z.array(expressionTypeSchema).default([])
, format: z.string().nullable().default(null)
}).passthrough()

const groupingSchema = z.object({
  header: z.string().optional()
, isCollapsed: z.boolean().default(false)
, order: z.array(z.number()).default([])
})

const tagGroupingSchema = groupingSchema.extend({
  tags: z.array(z.string())
})

const menuConfigSchema = z.object({
  mainGroup: groupingSchema.default({ isCollapsed: false, order: [] })
, tagGroups: z.array(tagGroupingSchema).default([])
})

const variableSchema = z.object({
  name: z.string()
, tags: z.array(z.string()).default([])
})

export const codeWorkspaceSchema = z.object({
  version: z.literal(7)
, height: z.number().default(DEFAULT_HEIGHT)
, width: z.number().default(DEFAULT_WIDTH)
, blocks: z.array(blockDefinitionSchema).default([])
, menuConfig: menuConfigSchema.default({})
, program: z.object({ chains: z.array(chainSchema) }).default({ chains: [] })
, chainOpen: z.string().nullable().default(null)
, chainClose: z.string().nullable().default(null)
, blockStyles: z.object({
    starterBlockStyle: blockStyleSchema
  , containerBlockStyle: blockStyleSchema
  , commandBlockStyle: blockStyleSchema
  }).nullable().default(null)
, variables: z.array(variableSchema).default([])
, expressions: z.array(expressionDefinitionSchema).default([])
}).passthrough()
