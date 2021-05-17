// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { ExpressionAttribute, Expression, ExpressionValue } from "../../types/types"
import { StringUtils } from "../../utils/string-utils"
import { BlockInstanceUI } from "../block-instance"
import { CodeFormatter } from "../code-formatter"
import { ExpressionUI } from "../expressions/expression"
import { ExpressionBuilder } from "../expressions/expression-builder"
import { AttributeChangedEvent } from "../program-changed-event"
import { AttributeUI } from "./attribute"

//-------------------------------------------------------------------------
/// Represents an expression (boolean or number)
//-------------------------------------------------------------------------
class ExpressionAttributeUI extends AttributeUI {

  readonly expDef: ExpressionAttribute
  readonly ea: ExpressionValue
  builder: ExpressionBuilder

  constructor(id: number, expDef: ExpressionAttribute, ea: ExpressionValue, block: BlockInstanceUI, isProperty: boolean) {
    super(id, expDef, ea, block, isProperty)
    this.expDef = expDef
    this.ea = ea
    this.builder = new ExpressionBuilder(this.block.workspace, this.ea.value)
  }

  showParameterDialog(x: number, y: number, acceptCallback: () => void): void {
    const backdrop = this.block.workspace.backdrop
    backdrop.classList.add("show")
    const dialog = this.block.workspace.dialog
    dialog.style.top = `${y}px`
    dialog.classList.remove("small")
    dialog.innerHTML = ""

    dialog.insertAdjacentHTML("beforeend", `
      <div class="nt-param-table">
        <div class="nt-param-row">
          <div class="nt-param-label">${this.def.name}:</div>
        </div>
        <div class="nt-param-row">
          <div id="nt-expression-${this.uniqueId}" class="nt-expression-root"></div>
        </div>
      </div>
      <button class="nt-param-confirm" type="button">OK</button>
      <button class="nt-param-cancel" type="button">Cancel</button>
    `)

    const dialogClicked = (e: MouseEvent) => {
      document.querySelectorAll(".nt-pulldown-menu").forEach((el) => el.remove())
    }
    dialog.addEventListener("click", dialogClicked)

    document.querySelectorAll(".nt-param-confirm").forEach( (el) =>
      el.addEventListener("click", (e) => {
        var empties = document.querySelectorAll(".nt-expression.empty")
        if (empties.length > 0) return false
        dialog.removeEventListener("click", dialogClicked)
        backdrop.classList.remove("show")
        acceptCallback()
        const value = ExpressionAttributeUI.expressionValue(this.ea)
        this.block.workspace.programChanged(new AttributeChangedEvent(this.block.def.id, this.block.b.instanceId, this.id, this.ea.type, this.isProperty, value, value))
        return false
      })
    )

    document.querySelectorAll(".nt-param-confirm").forEach( (conf) => conf.addEventListener("mousedown", (e) => {
      document.querySelectorAll(".nt-expression.empty").forEach((el) => el.classList.add("warn"))
    }))
    document.querySelectorAll(".nt-param-confirm").forEach( (conf) => conf.addEventListener("mouseup", (e) => {
      document.querySelectorAll(".nt-expression.empty").forEach((el) => el.classList.remove("warn"))
    }))
    document.querySelectorAll(".nt-param-cancel").forEach( (cancel) => cancel.addEventListener("click", (e) => {
      dialog.removeEventListener("click", dialogClicked)
      backdrop.classList.remove("show")
    }))

    this.builder.open(`#nt-expression-${this.uniqueId}`)
  }

  getDisplayValue(): string { return `${ExpressionAttributeUI.expressionValue(this.ea)}${this.displayUnit}` }

  static expressionValue(ea: ExpressionValue): string {
    return typeof ea.value === 'string' ? ea.value : ExpressionAttributeUI.formatExpression(ea.value)
  }

  static formatExpression(expression: Expression): string {
    if (expression.format !== null) {
      var format = expression.format
      for (var i = 0; i < expression.children.length; i++) {
        format = StringUtils.replaceAll(format, `{${i}}`, ExpressionAttributeUI.formatExpression(expression.children[i]))
      }
      return format
    }
    else if (expression.children.length === 1) {
      return `(${expression.name} ${ExpressionAttributeUI.formatExpression(expression.children[0])})`
    }
    else if (expression.children.length === 2) {
      return `(${ExpressionAttributeUI.formatExpression(expression.children[0])} ${expression.name} ${ExpressionAttributeUI.formatExpression(expression.children[1])})`
    }
    else {
      return expression.name
    }
  }

}

export { ExpressionAttributeUI }
