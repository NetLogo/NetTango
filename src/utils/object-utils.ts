// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

class ObjectUtils {

  static isObjectValue(o: any): boolean {
    return typeof(o) === "object" && o !== null
  }

  static clone<T>(o: T, extra: Partial<T> = {}): T {
    const newO = JSON.parse(JSON.stringify(o))
    Object.assign(newO, extra)
    return newO
  }

  static copyProperty<T extends {}>(source: T, destination: T, prop: (keyof T)) {
    destination[prop] = source[prop]
  }

  static setIfUndefined(o: any, prop: string, value: any | null = null): void {
    if (!o.hasOwnProperty(prop)) {
      o[prop] = value
    }
  }

  static deleteProperties(o: any, ...props: string[]): void {
    props.forEach( (p) => delete o[p] )
  }
}

export { ObjectUtils }
