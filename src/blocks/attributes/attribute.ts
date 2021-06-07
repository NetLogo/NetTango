// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { Attribute, AttributeValue } from "../../types/types"
import { BlockInstanceUI } from "../block-instance"

type AttributeTypes = "bool" | "num" | "int" | "range" | "text" | "select"

abstract class AttributeUI {

  readonly id: number
  readonly def: Attribute
  readonly a: AttributeValue
  readonly block: BlockInstanceUI
  readonly isProperty: boolean

  get uniqueId(): string { return `${this.block.workspace.containerId}-${this.block.def.id}-${this.id}` }

  get displayUnit(): string { return this.def.unit === null ? "" : this.def.unit }
  getDisplayValue(): string { return `${this.a.value}${this.displayUnit}` }

  constructor(id: number, def: Attribute, a: AttributeValue, block: BlockInstanceUI, isProperty: boolean) {
    this.id = id
    this.def = def
    this.a = a
    this.block = block
    this.isProperty = isProperty
  }

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
