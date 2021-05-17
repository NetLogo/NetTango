// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

class ArrayUtils {

  static maybeForEach(o: any, prop: string, func: (item: any, i: number) => void, elseFunc: (o: any) => void = () => {}): void {
    if (o.hasOwnProperty(prop) && Array.isArray(o[prop])) {
      o[prop].forEach(func)
    } else {
      elseFunc(o)
    }
  }

  static maybeMap<T>(o: any, prop: string, func: (item: any, i: number) => T): T[] {
    if (o.hasOwnProperty(prop) && Array.isArray(o[prop])) {
      return o[prop].map(func)
    }
    return []
  }

  static ifNotNullOrEmpty<T, U>(a: T[] | null, process: (a: T[]) => U, defaultVal: U) {
    if (a === null || a.length === 0) {
      return defaultVal
    }
    return process(a)
  }

}

export { ArrayUtils }
