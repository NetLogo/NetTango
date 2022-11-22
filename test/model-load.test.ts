// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import fs from "fs"
import path from "path"
import { defaultOptions, FormatAttributeType, NetTango } from "../src/nettango"

const MODELS_PATH      = "./nt-models"
const RESULTS_PATH     = "./dist/test/results"
const CODE_CHECKS_PATH = "./test/code-checks"
const DATA_CHECKS_PATH = "./test/data-checks"

const formatAttributeAsValue: FormatAttributeType = (_1, _2, _3, _4, value, _5, _6) => {
  return value.toString()
}

function getFiles(dir: string, filter: (f: string, s: fs.Stats) => boolean): string[] {
  const files = fs.readdirSync(dir).map( (f) => path.join(dir, f) )

  const filtered: string[] = files.flatMap( (f) => {
    const stat = fs.statSync(f)
    if (stat.isDirectory() && path.basename(f) !== ".git") {
      return getFiles(f, filter)
    } else {
      return filter(f, stat) ? [f] : []
    }
  })

  return filtered
}

const modelFiles = getFiles(MODELS_PATH, (f, _) => path.extname(f) === ".ntjson" )

test.each(modelFiles)("%p", (modelFile) => {
  const modelName = path.basename(modelFile).slice(0, -7)
  testModel(modelFile, modelName)
})

function testModel(modelFile: string, modelName: string) {
  const modelText = fs.readFileSync(modelFile, { encoding: "utf-8", flag: "r" })
  const modelId   = modelName.replace(/\ /g, "-").toLowerCase()
  const modelJson = JSON.parse(modelText)

  const modelErrors = modelJson.spaces.flatMap( (workspaceDef: any): any[] => {
    const workspaceId: string = `${modelId}-${workspaceDef.id}`
    const workspace: any      = workspaceDef.defs

    document.body.innerHTML = `<div id="${workspaceId}"></div>`
    NetTango.restore("NetLogo", workspaceId, workspace, formatAttributeAsValue, defaultOptions)

    const code  = NetTango.exportCode(workspaceId, formatAttributeAsValue)
    const saved = NetTango.save(workspaceId)

    // if there are errors in the code we still want to generate both results files, but
    // we also want to report errors from the first if the second fails.  So just collect
    // them and report at the end.  -Jeremy B May 2021.
    const wsErrors = []
    try {
      checkNetLogoCode(workspaceId, code)
    } catch (error) {
      wsErrors.push(error)
    }
    try {
      checkNetTangoData(workspaceId, JSON.stringify(saved, null, "  "))
    } catch (error) {
      wsErrors.push(error)
    }

    return wsErrors
  })

  if (modelErrors.length > 0) {
    const messages = modelErrors.map( (e: any) => `${e.message}\n${e.stack}` ).join("\n")
    const message  = `There were errors checking against the previous model code and data.\n${messages}`
    throw new Error(message)
  }
}

const checkNetLogoCode  = makeFileChecker(CODE_CHECKS_PATH, path.join(RESULTS_PATH, "code-checks"), "nls")
const checkNetTangoData = makeFileChecker(DATA_CHECKS_PATH, path.join(RESULTS_PATH, "data-checks"), "ntjson")

function makeFileChecker(checkFolder: string, resultsFolder: string, extension: string) {
  return (modelId: string, text: string) => {
    const fileName = `${modelId}.${extension}`
    const writeResultsFile = () => {
      const resultsFile = path.join(resultsFolder, fileName)
      if (!fs.existsSync(resultsFile)) {
        fs.mkdirSync(resultsFolder, { recursive: true })
      }
      fs.writeFileSync(resultsFile, text, { encoding: "utf-8", flag: "w" })
    }

    const checkFile = path.join(checkFolder, fileName)
    if (!fs.existsSync(checkFile)) {
      writeResultsFile()
      const absFile = path.resolve(checkFile)
      throw new Error(`No existing check file '${absFile}' found.  Results written to '${resultsFolder}'`)
    }

    const checkText = fs.readFileSync(checkFile, { encoding: "utf-8", flag: "r" })

    try {
      expect(checkText).toStrictEqual(text)
    } catch (error: any) {
      writeResultsFile()
      const message = `The given text differed from the prior stored results in '${checkFile}'.  Results written to '${resultsFolder}'.\n${error.stack}`
      throw new Error(message)
    }
  }
}
