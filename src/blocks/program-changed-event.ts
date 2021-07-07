// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { AttributeTypes } from "./attributes/attribute"
import { BlockInstanceUI } from "./block-instance"

abstract class ProgramChangedEvent {
}

class BlockChangedEvent extends ProgramChangedEvent {
  readonly type = "block-changed"
  readonly blockId: number
  readonly instanceId: number | null

  constructor(block: BlockInstanceUI) {
    super()
    this.blockId = block.b.definitionId
    this.instanceId = block.b.instanceId
  }

}

class AttributeChangedEvent extends ProgramChangedEvent {
  readonly type = "attribute-changed"
  readonly blockId: number
  readonly instanceId: number
  readonly attributeId: number
  readonly attributeType: AttributeTypes
  readonly isProperty: boolean
  readonly value: any
  readonly formattedValue: string

  constructor(blockId: number, instanceId: number, attributeId: number, attributeType: AttributeTypes, isProperty: boolean, value: any, formattedValue: string) {
    super()
    this.blockId = blockId
    this.instanceId = instanceId
    this.attributeId = attributeId
    this.attributeType = attributeType
    this.isProperty = isProperty
    this.value = value
    this.formattedValue = formattedValue
  }

}

class MenuItemEvent extends ProgramChangedEvent {
  readonly type: "menu-item-clicked" | "menu-item-context-menu"
  readonly blockId: number
  readonly x: number
  readonly y: number

  constructor(type: "menu-item-clicked" | "menu-item-context-menu", blockId: number, x: number, y: number) {
    super()
    this.type = type
    this.blockId = blockId
    this.x = x
    this.y = y
  }

}

export { ProgramChangedEvent, MenuItemEvent, AttributeChangedEvent, BlockChangedEvent }
