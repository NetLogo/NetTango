// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { BlockInstanceMenuEvent, MenuItemEvent } from "../events"
import { NetTango } from "../nettango"
import { StringUtils } from "../utils/string-utils"

type Rect = { top: number, left: number }

class InfoDialog {

  readonly div: HTMLDivElement
  readonly header: HTMLHeadingElement
  readonly note: HTMLParagraphElement
  readonly code: HTMLDivElement
  private isActive = false

  constructor(containerId: string) {
    const id = `${containerId}-info-dialog`
    const maybeDiv = document.getElementById(id)
    if (maybeDiv !== null) {
      this.div = maybeDiv as HTMLDivElement
    } else {
      this.div = document.createElement("div")
      this.div.id = id
      document.body.append(this.div)
    }
    this.div.innerHTML = ""
    this.header = document.createElement("h3")
    this.header.classList.add("nt-info-dialog-header")
    this.note   = document.createElement("p")
    this.note.classList.add("nt-info-dialog-note")
    this.code  = document.createElement("div")
    this.code.id = "nettango-info-dialog-code"
    this.code.classList.add("nt-info-dialog-code")
    this.div.appendChild(this.header)
    this.div.appendChild(this.note)
    this.div.appendChild(this.code)
    this.div.classList.add("nt-info-dialog")
  }

  hide() {
    this.div.classList.remove("show")
    this.isActive = false
  }

  show(event: BlockInstanceMenuEvent | MenuItemEvent) {
    this.div.classList.add("show")
    this.isActive = true

    const hide = () => this.hide()
    document.body.addEventListener("click", hide)
    document.body.addEventListener("contextmenu", hide)
    window.addEventListener('keyup', ({ key }) => {
      if (key === 'Escape' && this.isActive) { hide() }
    })

    if (event.note !== null && StringUtils.isNotNullOrEmpty(event.note.trimStart())) {
      this.note.innerHTML = event.note.trimStart()
    }

    this.div.style.left = `${event.x}px`
    this.div.style.top  = `${event.y}px`
    if (NetTango.highlighter != null) {
      this.header.innerHTML = `NetLogo code for <em>${event.action}</em> block`
      NetTango.highlighter("nettango-info-dialog-code", event.codeTip)
    } else {
      this.header.innerHTML = `NetLogo code for <em>${event.action}</em> block`
      this.code.innerHTML   = StringUtils.escapeHtml(event.codeTip)
    }

    this.div.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      return false;
    })
  }

  static getRelativeBoundingBox(element: HTMLElement): Rect {
    if (element.parentElement === null) {
      return { top: 0, left: 0 }
    }
    const style = window.getComputedStyle(element)
    if (["relative", "absolute"].includes(style.position)) {
      return element.parentElement.getBoundingClientRect()
    }
    return this.getRelativeBoundingBox(element.parentElement)
  }

}

export default InfoDialog
