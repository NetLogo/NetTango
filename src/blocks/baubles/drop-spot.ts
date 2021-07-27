// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import interact from "interactjs"

class DropSpot {

  static draw(dropEvent: () => void): HTMLDivElement {
    const spot = document.createElement("div")
    spot.classList.add("nt-drop-spot")

    const dropZone = interact(spot).dropzone({
      accept: ".nt-menu-slot"
    })
    dropZone.on("dragenter", () => {
      spot.classList.add("nt-menu-slot-over")
    })
    dropZone.on("dragleave", () => {
      spot.classList.remove("nt-menu-slot-over")
    })
    dropZone.on("drop", () => {
      spot.classList.remove("nt-menu-slot-over")
      dropEvent()
    })

    return spot
  }

}

export { DropSpot }
