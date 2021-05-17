// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { NumberValue, RangeAttribute } from "../../types/types"
import { BlockInstanceUI } from "../block-instance"
import { CodeFormatter } from "../code-formatter"
import { AttributeChangedEvent } from "../program-changed-event"
import { NumAttributeUI } from "./num-attribute"

//-------------------------------------------------------------------------
/// Represents a range of numbers
//-------------------------------------------------------------------------
class RangeAttributeUI extends NumAttributeUI {

  readonly rangeDef: RangeAttribute
  readonly ra: NumberValue

  constructor(id: number, rangeDef: RangeAttribute, ra: NumberValue, block: BlockInstanceUI, isProperty: boolean) {
    super(id, rangeDef, ra, block, isProperty)
    this.rangeDef = rangeDef
    this.ra = ra
  }

  showParameterDialog(x: number, y: number, acceptCallback: () => void): void {
    const backdrop = this.block.workspace.backdrop
    backdrop.classList.add("show")
    const dialog = this.block.workspace.dialog
    dialog.style.top = `${y}px`
    dialog.classList.remove("small")
    dialog.innerHTML = ""

    const table = document.createElement("div")
    table.className = "nt-param-table"
    dialog.append(table)

    table.insertAdjacentHTML("beforeend",
      `
        <div class="nt-param-row">
          <div class="nt-param-label">
            ${this.def.name}:
            <label id="nt-param-label-${this.uniqueId}" for="nt-param-${this.uniqueId}">${this.ra.value}</label>
            <span class="nt-param-unit">${this.displayUnit}</span>
          </div>
        </div>
        <div class="nt-param-row">
          <div class="nt-param-value">
            <input class="nt-param-input" id="nt-param-${this.uniqueId}" type="range" value="${this.ra.value}" min="${this.rangeDef.min}" max="${this.rangeDef.max}" step="${this.rangeDef.step}">
          </div>
        </div>
      `)

    const label = document.querySelector(`#nt-param-label-${this.uniqueId}`) as Element
    const input = document.querySelector(`#nt-param-${this.uniqueId}`) as HTMLInputElement
    if (input !== null && label !== null) {
      input.addEventListener("change", (e) => {
        this.setValue(input.value)
        backdrop.classList.remove("show")
        acceptCallback()
        const formattedValue = NumAttributeUI.numberValue(this.numDef, this.na)
        this.block.workspace.programChanged(new AttributeChangedEvent(this.block.def.id, this.block.b.instanceId, this.id, this.ra.type, this.isProperty, this.ra.value, formattedValue))
        e.stopPropagation()
      })
      input.addEventListener("input", (e) => { label.innerHTML = input.value; })
    }
  }
}

export { RangeAttributeUI }
