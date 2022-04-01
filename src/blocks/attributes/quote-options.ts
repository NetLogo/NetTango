// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { QuoteOptions } from "../../types/types"

type QuoteOptionTypes = "smart-quote" | "always-quote" | "never-quote"

class QuoteOptionValues {
  static readonly SMART_QUOTE  = "smart-quote"
  static readonly ALWAYS_QUOTE = "always-quote"
  static readonly NEVER_QUOTE  = "never-quote"
}

function shouldQuote(quoteValues: QuoteOptions, value: string): boolean {
  switch (quoteValues) {

    case "always-quote":
      return true

    case "never-quote":
      return false

    case "smart-quote":
    default:
      const maybeNum = Number.parseFloat(value)
      return Number.isNaN(maybeNum) && !["true", "false"].includes(value)

  }
}

function maybeAddQuotes(quoteValues: QuoteOptions, value: string): string {
  return shouldQuote(quoteValues, value) ? `"${value}"` : value
}

export { QuoteOptionValues, QuoteOptionTypes, maybeAddQuotes, shouldQuote }
