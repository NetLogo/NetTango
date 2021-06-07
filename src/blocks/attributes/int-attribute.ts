// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { IntAttribute, NumberValue } from "../../types/types"
import { BlockInstanceUI } from "../block-instance"
import { NumAttributeUI } from "./num-attribute"

class IntAttributeUI extends NumAttributeUI {

  constructor(id: number, def: IntAttribute, ia: NumberValue, block: BlockInstanceUI, isProperty: boolean) {
    super(id, def, ia, block, isProperty)
  }

}

export { IntAttributeUI }
