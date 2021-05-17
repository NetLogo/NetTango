// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

class NumUtils {

  static toInt(d: any, defaultValue: number = 0): number {
    return Math.floor(NumUtils.toNum(d, defaultValue))
  }

  static toNum(d: any, defaultValue: number = 0): number {
    const maybeNum = NumUtils.toNumOrNull(d)
    return (maybeNum === null) ? defaultValue : maybeNum
  }

  static toNumOrNull(d: any) {
    if (d === null) {
      return null
    }
    switch (typeof(d)) {

      case "number":
        return d

      case "string":
        const result = Number.parseFloat(d)
        if (Number.isNaN(result)) {
          return null
        }
        return result

      default:
        return null

    }
  }

  static sum(values: number[]): number {
    return values.reduce( (a, b) => a + b )
  }

}

export { NumUtils }
