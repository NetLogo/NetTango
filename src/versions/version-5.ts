// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetTango/NetTango

class Version5 {

  static update(json: any): void {
    VersionUtils.updateBlocks(json, Version5.moveChildrenToClauses, Version5.moveChildrenToClauses)
    VersionUtils.updateBlocks(json, Version5.addBlockPlacements, Version5.addBlockPlacements)
    VersionUtils.updateBlocks(json, Version5.updateNetLogoColorsAttributes, Version5.updateNetLogoColorsAttributes)
  }

  // NetTango is meant to be language-agnostic, and because this is NetLogo-specific,
  // it shouldn't really live here. But I can't come up with a better place without
  // reinventing all the version update code we already have, and NetLogo is the only
  // actual use-case, so here it goes.  If we give users the ability to provide language-
  // specific code formatters, that'd be a good time to also allow language-specific
  // updaters to be provided as well.  -Jeremy B August 2020
  static updateNetLogoColorsAttributes(b: any): void {
    VersionUtils.maybeForEach(b, "params", (param) => {
      if (param["type"] === "select") { Version5.updateNetLogoColorsAttribute(param) }
    })
    VersionUtils.maybeForEach(b, "properties", (prop) => {
      if (prop["type"] === "select") { Version5.updateNetLogoColorsAttribute(prop) }
    })
  }

  static updateNetLogoColorsAttribute(a: any): void {
    if (!a.hasOwnProperty("values")) {
      return
    }
    if (!Array.isArray(a["values"])) {
      return
    }

    const values = a["values"]
    const areUnquoted = values.map( (v) =>
      v.hasOwnProperty("actual") &&
      typeof(v["actual"]) === "string" &&
      Version5.NETLOGO_COLORS.includes(v["actual"].trim().toLowerCase())
    )

    const needsUpdate = BoolUtils.allAreTrue(areUnquoted)
    if (!needsUpdate) {
      return
    }

    a["quoteValues"] = "never-quote"
  }

  static readonly NETLOGO_COLORS = [
    "gray",
    "red",
    "orange",
    "brown",
    "yellow",
    "green",
    "lime",
    "turquoise",
    "cyan",
    "sky",
    "blue",
    "violet",
    "magenta",
    "pink"
  ]

  static addBlockPlacements(b: any): void {
    if (b.hasOwnProperty("required") && typeof(b["required"]) === "boolean" && b["required"] === true) {
      // prior to version 5, `required` also indicated a starter block
      b["placement"] = BlockPlacement.STARTER
    } else {
      b["placement"] = BlockPlacement.CHILD
    }
  }

  static moveChildrenToClauses(b: any): void {
    if (b.hasOwnProperty("children")) {
      const blocks = b["children"]
      b.deleteProperty("children")
      const firstClause: any = {}
      firstClause["children"] = blocks
      if (b.hasOwnProperty("clauses")) {
        if (Array.isArray(b["clauses"])) {
          b["clauses"].unshift(firstClause)
        } else {
          // uhhh... some messed up data?
          console.log(`Found a block with clauses that was not an array?  Block ID: ${b["id"]}.  Replacing value.`)
          b["clauses"] = [firstClause]
        }
      } else {
        // no `clauses` property
        b["clauses"] = [firstClause]
      }
    } else {
      // no `children` field, but if a `clauses` array exists, that means there is a phantom clause needed
      if (b.hasOwnProperty("clauses") && Array.isArray(b["clauses"])) {
        const firstClause = { "children": [] }
        b["clauses"].unshift(firstClause)
      }
    }
  }
}
