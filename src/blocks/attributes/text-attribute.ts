// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { StringValue, TextAttribute } from "../../types/types"
import { StringUtils } from "../../utils/string-utils"
import { BlockInstanceUI } from "../block-instance"
import { EventRouter } from "../../event-router"
import { AttributeChangedEvent } from "../../events"
import { AttributeUI } from "./attribute"
import { maybeAddQuotes } from "./quote-options"

class TextAttributeUI extends AttributeUI {

  readonly textDef: TextAttribute
  readonly ta: StringValue

  constructor(id: number, def: TextAttribute, ta: StringValue, block: BlockInstanceUI, isProperty: boolean) {
    super(id, def, ta, block, isProperty)
    this.textDef = def
    this.ta = ta
  }

  showParameterDialog(x: number, y: number, acceptCallback: () => void): void {
    const backdrop = this.block.workspace.backdrop
    backdrop.classList.add("show")
    const dialog = this.block.workspace.dialog
    dialog.style.top = `${y}px`
    dialog.classList.remove("small")
    dialog.innerHTML = ""

    const inputCode = this.buildHTMLInput()

    dialog.insertAdjacentHTML("beforeend", `
      <div class="nt-param-table">
        <div class="nt-param-row">${inputCode}</div>
      </div>
      <button class="nt-param-confirm" type="button">OK</button>
      <button class="nt-param-cancel" type="button">Cancel</button>
    `)

    const label = document.querySelector(`#nt-param-label-${this.uniqueId}`) as Element
    const input = document.querySelector(`#nt-param-${this.uniqueId}`) as HTMLInputElement

    document.querySelectorAll(".nt-param-confirm").forEach( (el) =>
      el.addEventListener("click", (e) => {
        if (input !== null) {
          this.ta.value = input.value
        }
        backdrop.classList.remove("show")
        acceptCallback()
        const formattedValue = maybeAddQuotes(this.textDef.quoteValues, this.ta.value)
        const event: AttributeChangedEvent = {
          type: "attribute-changed"
        , containerId: this.block.containerId
        , blockId: this.block.def.id
        , instanceId: this.block.b.instanceId
        , attributeId: this.id
        , attributeType: this.ta.type
        , isProperty: this.isProperty
        , value: this.ta.value
        , formattedValue: formattedValue
        }
        EventRouter.fireEvent(event)
      })
    )

    document.querySelectorAll(".nt-param-cancel").forEach( (el) => el.addEventListener("click", (e) => backdrop.classList.remove("show") ) )

    if (input !== null) {
      input.focus()
      if (label !== null) {
        input.addEventListener("change", (e) => { label.innerHTML = input.value })
        input.addEventListener("input", (e) => { label.innerHTML = input.value })
      }
    }
  }

  buildHTMLInput(): string {
    const htmlValue = StringUtils.escapeHtml(this.ta.value)
    return `
      <input class="nt-param-input" id="nt-param-${this.uniqueId}" type="text" value="${htmlValue}" dir="auto">
      <span class="nt-param-unit">${this.displayUnit}</span>
    `
  }

}

export { TextAttributeUI }
