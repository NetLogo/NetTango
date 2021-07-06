// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { NumberValue, RangeAttribute } from "../../types/types"
import { BlockInstanceUI } from "../block-instance"
import { AttributeChangedEvent } from "../program-changed-event"
import { NumAttributeUI } from "./num-attribute"

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
          <div class="nt-param-value nt-range-value">
            <input class="nt-param-input nt-range-input" id="nt-param-${this.uniqueId}" type="range" value="${this.na.value}" min="${this.rangeDef.min}" max="${this.rangeDef.max}" step="${this.rangeDef.step}">
            <input class="nt-param-input nt-range-number" id="nt-param-${this.uniqueId}-direct" type="number" value="${this.na.value}" min="${this.rangeDef.min}" max="${this.rangeDef.max}" step="${this.rangeDef.step}">
          </div>
        </div>
      `)

    const label       = document.querySelector(`#nt-param-label-${this.uniqueId}`) as Element
    const rangeInput  = document.querySelector(`#nt-param-${this.uniqueId}`) as HTMLInputElement
    const directInput = document.querySelector(`#nt-param-${this.uniqueId}-direct`) as HTMLInputElement

    const changeListener = (input: HTMLInputElement) => (e: Event) => {
      rangeInput.value  = input.value
      directInput.value = rangeInput.value
      this.setValue(rangeInput.value)
      backdrop.classList.remove("show")
      acceptCallback()
      const formattedValue = NumAttributeUI.numberValue(this.numDef, this.na)
      this.block.workspace.programChanged(new AttributeChangedEvent(this.block.def.id, this.block.b.instanceId, this.id, this.ra.type, this.isProperty, this.ra.value, formattedValue))
      e.stopPropagation()
    }

    rangeInput.addEventListener("change", changeListener(rangeInput))
    rangeInput.addEventListener("input", (_) => { label.innerHTML = rangeInput.value; })

    directInput.addEventListener("change", changeListener(directInput))
  }
}

export { RangeAttributeUI }
