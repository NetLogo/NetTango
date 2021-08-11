// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import interact from "interactjs"

class DropSpot {

  static draw(text: string, dropEvent: () => void, enableDefinitionChanges: boolean, checker: (dropped: boolean) => boolean): HTMLDivElement {
    const spot = document.createElement("div")
    spot.innerText = text
    spot.classList.add("nt-drop-spot")

    if (enableDefinitionChanges) {
      const dropZone = interact(spot).dropzone({
        accept: ".nt-menu-slot"
      , checker: (_1, _2, dropped) => checker(dropped)
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
    }

    return spot
  }

}

export { DropSpot }
