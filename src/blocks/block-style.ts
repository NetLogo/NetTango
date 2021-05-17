// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { BlockStyle } from "../types/types"
import { ObjectUtils } from "../utils/object-utils"

class BlockStyleUI {

  static readonly DEFAULT_STARTER_COLOR   = "#bb5555"
  static readonly DEFAULT_CONTAINER_COLOR = "#8899aa"
  static readonly DEFAULT_COMMAND_COLOR   = "#9977aa"
  static readonly DEFAULT_TEXT_COLOR      = "#ffffff"
  static readonly DEFAULT_BORDER_COLOR    = "#ffffff"
  static readonly DEFAULT_FONT_FAMILY     = "Poppins, sans-serif"

  static readonly DEFAULT_COMMAND_STYLE: BlockStyle = {
    blockColor:  BlockStyleUI.DEFAULT_COMMAND_COLOR
  , textColor:   BlockStyleUI.DEFAULT_TEXT_COLOR
  , borderColor: BlockStyleUI.DEFAULT_BORDER_COLOR
  , fontWeight:  ""
  , fontSize:    ""
  , fontFace:    ""
  }
  static readonly DEFAULT_CONTAINER_STYLE = ObjectUtils.clone(BlockStyleUI.DEFAULT_COMMAND_STYLE, { blockColor: BlockStyleUI.DEFAULT_CONTAINER_COLOR })
  static readonly DEFAULT_STARTER_STYLE   = ObjectUtils.clone(BlockStyleUI.DEFAULT_COMMAND_STYLE, { blockColor: BlockStyleUI.DEFAULT_STARTER_COLOR })

  readonly bs: BlockStyle

  constructor(bs: BlockStyle) {
    this.bs = bs
  }

  get font() {
    const weight = this.bs.fontWeight === "" ? "" : `font-weight: ${this.bs.fontWeight};`
    const size   = this.bs.fontSize   === "" ? "" : `font-size: ${this.bs.fontSize};`
    const face = `font-family: ${ this.bs.fontFace === "" ? BlockStyleUI.DEFAULT_FONT_FAMILY : this.bs.fontFace };`
    return `${weight} ${size} ${face}`.trim()
  }

  get cssRule() {
    return `color: ${this.bs.textColor}; border-color: ${this.bs.borderColor}; ${this.font}`.trim()
  }

  appendToSheet(sheet: CSSStyleSheet, blockClass: string) {
    sheet.insertRule(`.${blockClass}-color { background-color: ${this.bs.blockColor}; }`, 0)
    sheet.insertRule(`.${blockClass}-attribute { color: ${this.bs.blockColor}; background-color: ${this.bs.textColor}; }`, 0)
    sheet.insertRule(`.${blockClass} { ${this.cssRule} }`, 0)
  }

}

export { BlockStyleUI }
