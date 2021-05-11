// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetTango/NetTango

import { Attribute, AttributeValue } from "../../types/types"
import { BlockInstanceUI } from "../block-instance"

type AttributeTypes = "bool" | "num" | "int" | "range" | "text" | "select"

/// Represents the paramter or property options for a block
abstract class AttributeUI {

  readonly def: Attribute
  readonly a: AttributeValue
  readonly block: BlockInstanceUI

  get uniqueId(): string { return `${this.block.workspace.containerId}-${this.block.def.id}-${this.def.id}` }

  getDisplayValue(): string { return `${this.a.value}${this.def.unit}` }

  constructor(def: Attribute, a: AttributeValue, block: BlockInstanceUI) {
    this.def = def
    this.a = a
    this.block = block
  }

  // parameters are meant to display inline with just a value
  drawParameter(): HTMLDivElement {
    const paramDiv = document.createElement("div")
    const updateValue = () => { paramDiv.innerText = this.getDisplayValue(); }
    updateValue()
    paramDiv.classList.add("nt-attribute-value")
    paramDiv.classList.add(`${this.block.getStyleClass()}-attribute`)
    if (this.block.def.blockColor !== null) { paramDiv.style.color = this.block.def.blockColor; }
    if (this.block.def.textColor !== null) { paramDiv.style.backgroundColor = this.block.def.textColor; }

    paramDiv.addEventListener("click", (event) => {
      const target = (event.target as HTMLDivElement)
      const parent = (target.offsetParent as HTMLDivElement)
      const left = parent.offsetLeft + target.offsetLeft + event.offsetX
      const top  = parent.offsetTop  + target.offsetTop  + event.offsetY
      this.showParameterDialog(Math.floor(left), Math.floor(top), updateValue)
    })
    return paramDiv
  }

  // properties display stand-alone with an identifier
  drawProperty(): HTMLDivElement {
    const propDiv = document.createElement("div")
    propDiv.classList.add("nt-property")
    const propName = document.createElement("div")
    propName.classList.add("nt-property-name")
    propName.innerText = `\u2022 ${this.def.name}`
    propDiv.append(propName)
    propDiv.append(this.drawParameter())
    return propDiv
  }

  abstract showParameterDialog(x: number, y: number, acceptCallback: () => void): void
}

export { AttributeUI, AttributeTypes }
