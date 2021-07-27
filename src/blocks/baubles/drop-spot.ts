// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import interact from "interactjs"

class DropSpot {

  static draw(dropEvent: () => void): HTMLDivElement {
    const spot = document.createElement("div")
    spot.innerText = "Drop Something Here"
    spot.classList.add("nt-drop-spot")

    const dropZone = interact(spot).dropzone({
      accept:  ".nt-menu-slot"
    //, checker: (_1, _2, dropped) => this.workspace.checker(dropped)
    })

    dropZone.on("dragenter", () => {
      spot.classList.add("nt-menu-drag-over")
    })
    dropZone.on("dragleave", () => {
      spot.classList.remove("nt-menu-drag-over")
    })
    dropZone.on("drop", dropEvent)

    return spot
  }

}

export { DropSpot }
