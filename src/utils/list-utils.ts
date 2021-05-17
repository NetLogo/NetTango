// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

class ListUtils {

  static containsAny<T>(allowed: T[], items: T[]): Boolean {
    for (const item of items) {
      if (allowed.includes(item)) {
        return true
      }
    }
    return false
  }

}

export { ListUtils }
