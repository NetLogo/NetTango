// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { BlockInstanceMenuEvent } from "../events"

type Rect = { top: number, left: number }

class InfoDialog {

  readonly div: HTMLDivElement
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
    this.div.classList.add("nt-info-dialog")
  }

  hide() {
    this.div.classList.remove("show")
    this.isActive = false
  }

  show(event: BlockInstanceMenuEvent) {
    this.div.classList.add("show")
    this.isActive = true

    const hide = () => this.hide()
    document.body.addEventListener("click", hide)
    document.body.addEventListener("contextmenu", hide)
    window.addEventListener('keyup', ({ key }) => {
      if (key === 'Escape' && this.isActive) { hide() }
    })

    this.div.style.left = `${event.x}px`
    this.div.style.top  = `${event.y}px`
    this.div.innerHTML = `
      <h3 class="nt-info-dialog-header">NetLogo code for <em>${event.action}</em> block</h3>
      <pre class="nt-info-dialog-code">${event.codeTip}</pre>
    `

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
