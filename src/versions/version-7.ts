// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { CodeWorkspace as CodeWorkspaceInput } from "../types/types-6"
import { CodeWorkspace, codeWorkspaceSchema } from "../types/types"

import { newWorkspace } from "./empty-objects"

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
    return workspace
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
