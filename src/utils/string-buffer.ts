// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

class StringBuffer {

  private currentLine: string[]

  lines: string[][] = []

  constructor() {
    this.currentLine = []
    this.lines.push(this.currentLine)
  }

  get isEmpty(): boolean {
    return (this.lines.length === 1 && this.currentLine.length === 0)
  }

  write(chunk: string): void {
    this.currentLine.push(chunk)
  }

  writeln(chunk: string | null = null): void {
    if (chunk !== null) {
      this.write(chunk)
    }
    this.currentLine = []
    this.lines.push(this.currentLine)
  }

  toString(): string {
    return this.lines.map( (line) => line.join("") ).join("\n")
  }

}

export { StringBuffer }
