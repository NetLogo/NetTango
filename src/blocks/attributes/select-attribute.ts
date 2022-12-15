// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { SelectAttribute, SelectOption, StringValue } from "../../types/types"
import { BlockInstanceUI } from "../block-instance"
import { EventRouter } from "../../event-router"
import { AttributeChangedEvent } from "../../events"
import { AttributeUI } from "./attribute"
import { maybeAddQuotes } from "./quote-options"

function selectOptionDisplay(o: SelectOption): string {
  return (o.display === null || o.display === "") ? o.actual : o.display
}

class SelectAttributeUI extends AttributeUI {

  readonly selectDef: SelectAttribute
  readonly sa: StringValue

  getDisplayValue(): string { return `${this.selectedDisplay}${this.displayUnit} \u25BE` }

  /// list of possible values for select type
  get selectedDisplay(): string {
    const valueOptions = this.selectDef.values.filter( (o) => o.actual === this.sa.value && o.display !== null && o.display !== "")
    if (valueOptions.length === 1) {
      return selectOptionDisplay(valueOptions[0])
    } else {
      return this.sa.value
    }
  }

  constructor(id: number, selectDef: SelectAttribute, sa: StringValue, block: BlockInstanceUI, isProperty: boolean) {
    super(id, selectDef, sa, block, isProperty)
    this.selectDef = selectDef
    this.sa = sa
  }

  showParameterDialog(x: number, y: number, acceptCallback: () => void): void {
    const backdrop = this.block.workspace.backdrop
    backdrop.classList.add("show")
    const dialog = this.block.workspace.dialog
    dialog.style.top = `${y}px`
    dialog.classList.add("small")
    dialog.innerHTML = ""

    const table = document.createElement("div")
    table.className = "nt-param-table"
    dialog.append(table)

    const makeClickListener = (v: SelectOption): ((e: MouseEvent) => void) => {
      return (e) => {
        this.sa.value = v.actual
        backdrop.classList.remove("show")
        acceptCallback()
        const formattedValue = maybeAddQuotes(this.selectDef.quoteValues, this.sa.value)
        const event: AttributeChangedEvent = {
          type: "attribute-changed"
        , containerId: this.block.containerId
        , blockId: this.block.def.id
        , instanceId: this.block.b.instanceId
        , attributeId: this.id
        , attributeType: this.sa.type
        , isProperty: this.isProperty
        , value: this.sa.value
        , formattedValue: formattedValue
        }
        EventRouter.fireEvent(event)
        e.stopPropagation()
      }
    }

    for (var v of this.selectDef.values) {
      const row = document.createElement("div")
      row.className = "nt-param-row"
      const opt = document.createElement("div")
      opt.dir = "auto"
      opt.className = "nt-select-option"
      opt.innerHTML = selectOptionDisplay(v)
      if (v.actual === this.sa.value) { opt.classList.add("selected") }
      opt.addEventListener("click", makeClickListener(v))
      row.append(opt)
      table.append(row)
    }
  }

}

export { SelectAttributeUI }
