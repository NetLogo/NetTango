// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import {
  Attribute
, AttributeValue
, BlockInstance
, BlockDefinition
, Clause
, NumAttribute
, SelectAttribute
, ClauseInstance
} from "../types/types"

import { FormatAttributeType } from "../nettango"
import { StringBuffer } from "../utils/string-buffer"
import { StringUtils } from "../utils/string-utils"
import { ExpressionAttributeUI } from "./attributes/expression-attribute"
import { NumAttributeUI } from "./attributes/num-attribute"
import { SelectAttributeUI } from "./attributes/select-attribute"
import { BlockDefinitionUI } from "./block-definition"
import { BlockRules } from "./block-rules"
import { ChainUI } from "./chain"
import { CodeWorkspaceUI } from "./code-workspace"

// TODO: This is an over-simplification, but it works for our big use-case (NetLogo)
// If we want to look at custom per-language code formatters again, I think it makese
// more sense for them to be provided by the end users, as opposed to included in the
// NetTango runtime directly.  -Jeremy B July 2020
class FormatOptions {
  readonly chainOpen: string
  readonly chainClose: string
  readonly clauseOpen: string
  readonly clauseClose: string

  constructor(chainOpen: string, chainClose: string, clauseOpen: string, clauseClose: string) {
    this.chainOpen = chainOpen
    this.chainClose = chainClose
    this.clauseOpen = clauseOpen
    this.clauseClose = clauseClose
  }
}

type BlockData     = { def: BlockDefinition, b: BlockInstance }
type AttributeData = { def: Attribute, a: AttributeValue }
type ClauseData    = { def: Clause, c: ClauseInstance }

function compareChainsByAction(c1: ChainUI, c2: ChainUI) {
  if (c1.blocks.length === 0) {
    return -1
  }
  if (c2.blocks.length === 0) {
    return 1
  }
  return c1.blocks[0].def.action.localeCompare(c2.blocks[0].def.action)
}

class CodeFormatter  {

  indentString: string = "  "
  formatOptions: FormatOptions
  formatAttribute: FormatAttributeType
  readonly workspace: CodeWorkspaceUI

  constructor(workspace: CodeWorkspaceUI, language: string, formatAttribute: FormatAttributeType) {
    this.workspace = workspace
    this.formatAttribute = formatAttribute

    switch (language) {

      case "NetLogo":
        this.formatOptions = new FormatOptions("", "end", "[", "]")
        break

      default:
        this.formatOptions = new FormatOptions("", "", "", "")
        break

    }
  }

  formatCode(includeRequired: boolean, formatAttributeOverride: FormatAttributeType | null = null): string {
    const originalFormatAttribute = this.formatAttribute
    if (formatAttributeOverride !== null) {
      this.formatAttribute = formatAttributeOverride
    }

    const shouldIncludeInExtra = (def: BlockDefinition) =>
      includeRequired && def.isRequired && BlockRules.canBeStarter(def) && this.workspace.getBlockCount(def.id) === 0

    const extraChains = this.workspace.menu.blocks
      .filter(shouldIncludeInExtra)
      .map( (def) => [{ def: def, b: BlockDefinitionUI.makeInstance(def, this.workspace.getBlockCount(def.id)) }] )

    // TODO: What to do with required blocks that cannot be starters?

    const result = this.formatLanguageCode(extraChains)

    this.formatAttribute = originalFormatAttribute

    return result
  }

  formatLanguageCode(extraChains: BlockData[][]): string {
    const out = new StringBuffer()

    const chains = this.workspace.chains.slice(0)
    chains.sort(compareChainsByAction)
    for (var chain of chains) {
      const blocks = chain.blocks.map( (b) => { return { def: b.def, b: b.b }} )
      this.formatChainBlocks(out, blocks, this.workspace.ws.chainOpen, this.workspace.ws.chainClose)
    }

    for (var blocks of extraChains) {
      this.formatChainBlocks(out, blocks, this.workspace.ws.chainOpen, this.workspace.ws.chainClose)
    }

    return out.toString()
  }

  formatChainBlocks(out: StringBuffer, blocks: BlockData[], chainOpen: string | null, chainClose: string | null): void {
    if (blocks.length === 0) { return }

    var first = blocks[0]
    if (!BlockRules.canBeStarter(first.def)) { return }

    this.writeFormatOption(out, null, 0, this.formatOptions.chainOpen, chainOpen)
    this.formatBlock(out, 0, first)
    this.formatBlocks(out, 1, blocks.slice(1))
    const override = StringUtils.isNotNullOrEmpty(first.def.closeStarter) ? first.def.closeStarter : chainClose
    this.writeFormatOption(out, null, 0, this.formatOptions.chainClose, override)
    out.writeln()
  }

  formatBlocks(out: StringBuffer, indent: number, blocks: BlockData[]): void {
    if (blocks.length === 0) { return }

    for (var block of blocks) {
      this.formatBlock(out, indent, block)
    }
  }

  formatBlock(out: StringBuffer, indent: number, block: BlockData): void {
    var format = block.def.format
    if (format === null) {
      format = block.def.action
      for (var i = 0; i < block.def.params.length; i++) {
        format += ` {${i}}`
      }
      for (var i = 0; i < block.def.properties.length; i++) {
        format += ` {P${i}}`
      }
    }

    format = this.replaceParamsAndProps(format, block)

    this.writeIndentedLine(out, indent, format)

    block.b.clauses.forEach( (c, i) =>
      this.formatClause(out, block, { def: block.def.clauses[i], c: c }, indent)
    )

    if (StringUtils.isNotNullOrEmpty(block.def.closeClauses)) {
      const closeFormat = this.replaceParamsAndProps(block.def.closeClauses!, block)
      this.writeIndentedLine(out, indent, closeFormat)
    }
  }

  replaceParamsAndProps(format: string, block: BlockData): string {
    const params = block.b.params.map( (a, i) => { return { def: block.def.params[i], a: a }} )
    format = this.replaceAttributes(format, block, params, "", false)
    const properties = block.b.properties.map( (a, i) => { return { def: block.def.properties[i], a: a }} )
    format = this.replaceAttributes(format, block, properties, "P", true)
    return format
  }

  replaceAttributes(format: string, block: BlockData, attributes: AttributeData[], placeholder: string, areProperties: boolean): string {
    attributes.forEach( (a, i) => {
      format = this.replaceAttribute(format, `{${placeholder}${i}}`, block, i, a, areProperties)
    })
    return format
  }

  formatClause(out: StringBuffer, block: BlockData, clause: ClauseData, indent: number): void {
    this.writeFormatOption(out, block, indent, this.formatOptions.clauseOpen, clause.def.open)
    const clauseBlocks = clause.c.blocks.map( (b) => { return { def: this.workspace.menu.getBlockById(b.definitionId), b: b }} )
    this.formatBlocks(out, indent + 1, clauseBlocks)
    this.writeFormatOption(out, block, indent, this.formatOptions.clauseClose, clause.def.close)
  }

  replaceAttribute(code: string, placeholder: string, block: BlockData, id: number, a: AttributeData, isProperty: boolean): string {
    const formattedValue = CodeFormatter.formatAttributeValue(a)
    const replacement = this.formatAttribute(this.workspace.containerId, block.def.id, block.b.instanceId, id, formattedValue, a.def.type, isProperty)
    return StringUtils.replaceAll(code, placeholder, replacement)
  }

  writeIndentedLine(out: StringBuffer, indent: number, line: string): void {
    var fullIndent = ""
    for (var i = 0; i < indent; i++) { fullIndent = fullIndent + this.indentString }
    out.write(fullIndent)
    const indentedPost = StringUtils.replaceAll(line, "\n", "\n" + fullIndent)
    out.writeln(indentedPost)
  }

  writeFormatOption(out: StringBuffer, block: BlockData | null, indent: number, formatOption: string, override: string | null): void {
    const option = StringUtils.toStr(override, formatOption)
    if (StringUtils.isNotNullOrEmpty(option) && option.trim() !== "") {
      const optionFormat = block === null ? option : this.replaceParamsAndProps(option, block)
      this.writeIndentedLine(out, indent, optionFormat)
    }
  }

  static formatAttributeValue(a: AttributeData): string {
    const value = CodeFormatter.getAttributeValue(a)
    const quoteIt = CodeFormatter.shouldQuote(a)
    const formatValue = quoteIt ? `"${value}"` : value
    return formatValue
  }

  static getAttributeValue(a: AttributeData): string {
      switch (a.a.type) {
        case 'text':
        case 'select':
          return a.a.value

        case 'int':
        case 'range':
          return NumAttributeUI.numberValue(a.def as NumAttribute, a.a)

        case 'num':
        case 'bool':
          return ExpressionAttributeUI.expressionValue(a.a)
        }
    }

    // should the value for this attribute be quoted in code?
    static shouldQuote(a: AttributeData): boolean {
      switch (a.a.type) {
        case 'text':
          return true

        case 'int':
        case 'range':
          return false

        case 'select':
          return SelectAttributeUI.shouldQuote(a.def as SelectAttribute, a.a)

        case 'num':
        case 'bool':
          return false

      }
    }

}

export { CodeFormatter }
