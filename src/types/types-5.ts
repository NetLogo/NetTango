// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { z } from "zod"
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from "../nettango-defaults"

const unrestrictedTags: UnrestrictedTags = Object.freeze({ type: "unrestricted" })

export type BlockStyleInput  = z.infer<typeof blockStyleInputSchema>
export type InheritTags = z.infer<typeof inheritTagsInputSchema>
export type UnrestrictedTags = z.infer<typeof unrestrictedTagsInputSchema>
export type AnyOfTags = z.infer<typeof anyOfTagsInputSchema>
export type ConcreteTags = z.infer<typeof concreteTagsInputSchema>
export type AllowedTags = z.infer<typeof allowedTagsInputSchema>
export type SelectOptionInput = z.infer<typeof selectOptionInputSchema>
export type TextAttributeInput = z.infer<typeof textAttributeInputSchema>
export type SelectAttributeInput = z.infer<typeof selectAttributeInputSchema>
export type NumAttributeInput = z.infer<typeof numAttributeInputSchema>
export type IntAttributeInput = z.infer<typeof intAttributeInputSchema>
export type RangeAttributeInput = z.infer<typeof rangeAttributeInputSchema>
export type ExpressionAttributeInput = z.infer<typeof expressionAttributeInputSchema>
export type AttributeInput = z.infer<typeof attributeInputSchema>
export type BlockInput = z.infer<typeof blockInputSchema>
export type ChainInput = z.infer<typeof chainInputSchema>
export type ExpressionDefinition = z.infer<typeof expressionDefinitionInputSchema>
export type CodeWorkspaceInput = z.infer<typeof codeWorkspaceInputSchema>

export type ExpressionInput = {
  name: string
  type: "num" | "bool"
  format: string | null
  children: Array<ExpressionInput>
}

export type ClauseInput = {
  children?: Array<BlockInput>
  action: string | null
  open: string | null
  close: string | null
  allowedTags: AllowedTags
}

const blockStyleInputSchema = z.object({
  blockColor: z.string()
, textColor: z.string()
, borderColor: z.string()
, fontWeight: z.string()
, fontSize: z.string()
, fontFace: z.string()
}).passthrough()

const inheritTagsInputSchema = z.object({
  type: z.literal("inherit")
}).passthrough()

const unrestrictedTagsInputSchema = z.object({
  type: z.literal("unrestricted")
}).passthrough()

const anyOfTagsInputSchema = z.object({
  type: z.literal("any-of")
, tags: z.array(z.string())
}).passthrough()

const concreteTagsInputSchema = z.union([
  unrestrictedTagsInputSchema
, anyOfTagsInputSchema
])

const allowedTagsInputSchema = z.union([
  inheritTagsInputSchema
, concreteTagsInputSchema
])

const clauseInputSchema: z.ZodSchema<ClauseInput, any, any> = z.lazy(() =>
  z.object({
    children: z.array(blockInputSchema).optional()
  , action: z.string().nullable().default(null)
  , open: z.string().nullable().default(null)
  , close: z.string().nullable().default(null)
  , allowedTags: allowedTagsInputSchema.default(unrestrictedTags)
  }).passthrough()
)

const attributeBaseSchema = z.object({
  id: z.number().optional()
, name: z.string().nullable().default(null)
, unit: z.string().nullable().default(null)
})

const textAttributeInputSchema = attributeBaseSchema.extend({
  type: z.literal("text")
, value: z.string().optional()
, default: z.string().default("")
}).passthrough()

const selectOptionInputSchema = z.object({
  actual: z.string()
, display: z.string().nullable().default(null)
}).passthrough()

const selectAttributeInputSchema = attributeBaseSchema.extend({
  type: z.literal("select")
, value: z.string().optional()
, default: z.string().default("")
, quoteValues: z.union([
    z.literal("smart-quote")
  , z.literal("always-quote")
  , z.literal("never-quote")
  ]).default("smart-quote")
, values: z.array(selectOptionInputSchema).default([])
}).passthrough()

function numOrDefault(def: number) {
  return (p: number | string | undefined) => {
    if (typeof p === "number" || typeof p === "undefined") {
      return p
    }
    const maybeP = Number.parseFloat(p)
    return (Number.isFinite(maybeP)) ? maybeP : def
  }
}

const numAttributeInputSchema = attributeBaseSchema.extend({
  step: z.number().default(1)
, random: z.boolean().default(false)
, value: z.union([z.string(), z.number()]).optional().transform(numOrDefault(10))
, default: z.union([z.string(), z.number()]).transform(numOrDefault(10)).default(10)
}).passthrough()

const intAttributeInputSchema = numAttributeInputSchema.extend({
  type: z.literal("int")
}).passthrough()

export const rangeAttributeInputSchema = numAttributeInputSchema.extend({
  type: z.literal("range")
, min: z.number().default(0)
, max: z.number().default(100)
}).passthrough()

const expressionTypes = z.union([z.literal("num"), z.literal("bool")])

const expressionInputSchema: z.ZodSchema<ExpressionInput, any, any> = z.lazy(() =>
  z.object({
    name: z.string()
  , type: expressionTypes
  , format: z.string().nullable().default(null)
  , children: z.array(expressionInputSchema).default([])
  }).passthrough()
)

const expressionAttributeInputSchema = attributeBaseSchema.extend({
  type: expressionTypes.default("num")
, default: z.string().default("0")
, value: z.union([z.string(), expressionInputSchema]).default("0")
, expressionValue: z.string().nullable().default("0")
}).passthrough()

const attributeInputSchema = z.union([
  textAttributeInputSchema
, selectAttributeInputSchema
, intAttributeInputSchema
, rangeAttributeInputSchema
, expressionAttributeInputSchema
])

const blockInputSchema = z.object({
  id: z.number().optional()
, action: z.string()
, required: z.boolean().default(false)
, placement: z.union([
    z.literal("starter")
  , z.literal("child")
  , z.literal("anywhere")
  ]).default("child")
, instanceId: z.number().nullable().default(null)
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
, allowedTags: concreteTagsInputSchema.default(unrestrictedTags)
, tags: z.array(z.string()).default([])
, clauses: z.array(clauseInputSchema).nullable().transform((arr) => arr ?? [] ).default([])
, params: z.array(attributeInputSchema).default([])
, properties: z.array(attributeInputSchema).default([])
, propertiesDisplay: z.union([z.literal("shown"), z.literal("hidden")]).default("shown")
}).passthrough()

const chainInputSchema = z.object({
  x: z.number().default(0)
, y: z.number().default(0)
, blocks: z.array(blockInputSchema).default([])
}).passthrough()

const expressionTypeSchema = z.union([z.literal("num"), z.literal("bool")])

const expressionDefinitionInputSchema = z.object({
  name: z.string()
, type: expressionTypeSchema
, arguments: z.array(expressionTypeSchema).default([])
, format: z.string().nullable().default(null)
}).passthrough()

export const codeWorkspaceInputSchema = z.object({
  version: z.literal(5)
, height: z.number().default(DEFAULT_HEIGHT)
, width: z.number().default(DEFAULT_WIDTH)
, blocks: z.array(blockInputSchema).default([])
, program: z.object({ chains: z.array(chainInputSchema).default([]) }).default({ chains: [] })
, chainOpen: z.string().nullable().default(null)
, chainClose: z.string().nullable().default(null)
, blockStyles: z.object({
    starterBlockStyle: blockStyleInputSchema
  , containerBlockStyle: blockStyleInputSchema
  , commandBlockStyle: blockStyleInputSchema
  }).nullable().default(null)
, variables: z.array(z.string()).default([])
, expressions: z.array(expressionDefinitionInputSchema).default([])
}).passthrough()
