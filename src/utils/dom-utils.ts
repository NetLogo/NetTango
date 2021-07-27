// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

class DomUtils {

  static swapChildren(node: Element, from: number, to: number): void {
    const item = node.childNodes.item(from)
    if (to === node.childNodes.length) {
      node.removeChild(item)
      node.append(item)
    } else {
      const beforeMe = node.children.item(to)
      node.insertBefore(item, beforeMe)
    }

  }

}

export { DomUtils }
