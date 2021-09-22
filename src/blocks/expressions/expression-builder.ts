// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { Expression, Variable } from "../../types/types"
import { StringBuffer } from "../../utils/string-buffer"
import { CodeWorkspaceUI } from "../code-workspace"
import { ExpressionUI } from "./expression"

class ExpressionBuilder {

  workspace: CodeWorkspaceUI
  parent?: Element
  root: ExpressionUI

  get variables(): Variable[] {
    return this.workspace.ws.variables
  }

  constructor(workspace: CodeWorkspaceUI, ea: Expression) {
    this.workspace = workspace
    this.root = new ExpressionUI(this, ea)
  }

  toString(): string {
    const out = new StringBuffer()
    this.root.displayString(out)
    return out.toString()
  }

  open(parentSelector: string): void {
    const p = document.querySelector(parentSelector)
    if (p === null) {
      throw new Error("Count not find a parent HTML element for the expression builder.")
    }
    this.parent = p
    this.renderHtml()
  }

  renderHtml(): void {
    if (this.parent !== undefined) {
      while (this.parent.lastChild !== null) {
        this.parent.removeChild(this.parent.lastChild)
      }
      this.root.renderHtml(this.parent)
    }
  }

}

export { ExpressionBuilder }
