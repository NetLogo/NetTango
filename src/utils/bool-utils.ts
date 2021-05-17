// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

class BoolUtils {

  static toBool(b: any, defaultValue: boolean = false): boolean {
    const maybeBool = BoolUtils.toBoolOrNull(b)
    return (maybeBool === null) ? defaultValue : b
  }

  static toBoolOrNull(b: any): boolean | null {
    if (b === null) {
      return null
    }
    switch (typeof(b)) {

      case "boolean":
        return b

      case "string":
        const lower = b.toLowerCase()
        if (["t", "true"].includes(lower)) {
          return true
        }
        if (["f", "false"].includes(lower)) {
          return false
        }
        return null

      default:
        return null

    }
  }

  static allAreTrue(values: boolean[]) {
    return values.reduce( (a, b) => a && b )
  }

}

export { BoolUtils }
