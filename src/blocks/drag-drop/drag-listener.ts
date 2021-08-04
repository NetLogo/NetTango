// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import interact from "interactjs"
import type { InteractEvent } from '@interactjs/core/InteractEvent'

import type { DraggableOptions, Point } from '@interactjs/types/index'

class DragListener {

  static readonly ORIGIN: Point = Object.freeze({ x: 0, y: 0 })

  readonly dragImage: HTMLDivElement
  readonly sourceElement: HTMLElement
  readonly draggingClass: string | null
  readonly cancelClass: string | null

  start = (e: InteractEvent) => { }
  end   = (e: InteractEvent) => { }

  private position: Point

  constructor(dragImage: HTMLDivElement, sourceElement: HTMLElement, draggingClass: string | null = null, cancelClass: string | null = null) {
    this.dragImage     = dragImage
    this.sourceElement = sourceElement
    this.draggingClass = draggingClass
    this.cancelClass   = cancelClass
    interact(sourceElement).draggable(this.makeOptions())
    this.position = DragListener.ORIGIN
  }

  private startEx(e: InteractEvent): void {
    const offset = this.sourceElement.getBoundingClientRect()

    this.dragImage.style.left = "0px"
    this.dragImage.style.top  = "0px"
    const zeroTopLeft = this.dragImage.getBoundingClientRect()

    this.dragImage.style.left = `${offset.left - zeroTopLeft.left}px`
    this.dragImage.style.top  = `${offset.top  - zeroTopLeft.top }px`
    this.dragImage.style.visibility = "visible"

    if (this.draggingClass !== null) {
      this.sourceElement.classList.add(this.draggingClass)
    }

    this.position = DragListener.ORIGIN

    this.start(e)
  }

  private moveEx(e: InteractEvent): void {
    this.position = { x: this.position.x + e.dx, y: this.position.y + e.dy }
    this.dragImage.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`
  }

  private endEx(e: InteractEvent): void {
    (["left", "top", "transform", "visibility"]).forEach( (property) =>
      this.dragImage.style.removeProperty(property)
    )
    this.end(e)
  }

  private makeOptions(): DraggableOptions {
    const options: DraggableOptions = {
      listeners: {
        "start": (e) => this.startEx(e)
      , "move":  (e) => this.moveEx(e)
      , "end":   (e) => this.endEx(e)
      }
    }
    if (this.cancelClass !== null) { options.ignoreFrom = `.${this.cancelClass}` }
    return options
  }

  static getOffset(element: HTMLElement) {
    const rect = element.getBoundingClientRect()
    return {
      x: (window.scrollX + rect.left)
    , y: (window.scrollY + rect.top)
    }
  }

}

export { DragListener }
