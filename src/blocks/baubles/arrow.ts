// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

class Arrow {

  static draw(): HTMLDivElement {
    const arrow = document.createElement("div")
    arrow.innerText = "➔"
    arrow.classList.add("nt-arrow")
    return arrow
  }

}

export { Arrow }
