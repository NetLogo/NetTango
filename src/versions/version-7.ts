// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { CodeWorkspace as CodeWorkspaceInput } from "../types/types-6"
import { CodeWorkspace, codeWorkspaceSchema } from "../types/types"

import { newWorkspace } from "./empty-objects"
import { StringUtils } from "../utils/string-utils"

class Version7 {

  static update(ws: CodeWorkspaceInput): CodeWorkspace {
    const workspace: CodeWorkspace = newWorkspace()
    const variables = ws.variables.map( (name) => { return {
      name: name
    , tags: []
    }})
    Object.assign(workspace, ws, {
      variables: variables
    })

    Version7.fillNetLogoCodeFormatDefaults(workspace)

    return workspace
  }

  // We had NetLogo defaults for these values in the formatter, but they
  // have been removed in favor of asking the user to provide them.  But
  // we update old versions since NetLogo was the only supported language
  // previously.  -Jeremy B September 2021
  static fillNetLogoCodeFormatDefaults(workspace: CodeWorkspace): void {
    workspace.chainClose = StringUtils.toStrNotEmpty(workspace.chainClose, "end")
    workspace.blocks.forEach( (b) => {
      b.clauses.forEach( (c) => {
        c.open  = StringUtils.toStrNotEmpty(c.open,  "[")
        c.close = StringUtils.toStrNotEmpty(c.close, "]")
      })
    })
  }

  static validate(workspaceEnc: any): CodeWorkspace {
    const result = codeWorkspaceSchema.safeParse(workspaceEnc)
    if (result.success) {
      return result.data
    }
    console.log("Workspace data:", workspaceEnc)
    console.log("Zod parsing errors: ", result.error)
    throw new Error(`The NetTango project data was invalid.  See the developer console for the full error.`)
  }
}

export { Version7 }
