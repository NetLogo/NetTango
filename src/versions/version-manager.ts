// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import {
  Attribute
, AttributeValue
, BlockDefinition
, BlockInstance
, CodeWorkspace
} from "../types/types"

import {
  makeAttributeDefault
, makeStringDefault
, makeNumberDefault
, makeExpressionDefault
} from "../blocks/attributes/attribute-factory"

import { Version1 } from "./version-1"
import { Version2 } from "./version-2"
import { Version3 } from "./version-3"
import { Version4 } from "./version-4"
import { Version5 } from "./version-5"
import { Version6 } from "./version-6"
import { ArrayUtils } from "../utils/array-utils"
import { ObjectUtils } from "../utils/object-utils"

class VersionManager {
  static readonly VERSION = 6

  static updateWorkspace(definition: any): CodeWorkspace {
    const version: number = definition.hasOwnProperty("version") ? definition.version : 0

    if (version > VersionManager.VERSION) {
      throw new Error(`Somehow the given model version (${version}) is greater than the supported NetTango version (${VersionManager.VERSION}).`)
    }

    const unvalidatedVersions = [Version1, Version2, Version3, Version4, Version5]
    unvalidatedVersions.slice(version).forEach( (v) => v.update(definition) )

    VersionManager.setBlockDefinitionIds(definition)

    if (version < 6) {
      definition.version = 5
      definition = Version5.validate(definition)
      definition = Version6.update(definition)
    }
    definition.version = VersionManager.VERSION

    const validated = Version6.validate(definition)

    VersionManager.fixupUntypedIssues(validated)

    return validated
  }

  static setBlockDefinitionIds(model: any): void {
    ObjectUtils.setIfUndefined(model, "blocks", [])

    if (model.blocks.length === 0) {
      return
    }

    // get the largest ID number among all block defs to get our next ID
    const ids = model.blocks.map( (b: any) => b.hasOwnProperty("id") && b.id !== null ? b.id : -1 )
    var nextId = Math.max(...ids) + 1

    // missing IDs, probably new blocks
    model.blocks.filter( (b: any) => !b.hasOwnProperty("id") || b.id === null || b.id === -1 ).forEach( (b: any) => {
      b.id = nextId
      nextId = nextId + 1
    })

    // duplicate IDs
    model.blocks.forEach( (b: any) => {
      const collisions = model.blocks.filter( (ob: any) => ob !== b && ob.id === b.id )
      collisions.forEach( (ob: any) => {
        ob.id = nextId
        nextId = nextId + 1
      })
    })

    model.blocks.forEach( (b: any) => ArrayUtils.maybeForEach(b, "params", (a: any, i: number) => {
      a.default = VersionManager.getAttributeDefaultValue(a)
      a.value = a.default
    }, (b: any) => b.params = []))

    model.blocks.forEach( (b: any) => ArrayUtils.maybeForEach(b, "properties", (a: any, i: number) => {
      a.default = VersionManager.getAttributeDefaultValue(a)
      a.value = a.default
    }, (b: any) => b.properties = []))

  }

  static getAttributeDefaultValue(a: any): string | number | null {
    if (a.hasOwnProperty("default")) {
      return a.default
    }

    switch (a.type) {
      case "int":
      case "range":
        return 10

      case "text":
      case "select":
        return ""

      case "num":
      case "bool":
        return "0"

      default:
        return null
    }
  }

  // Even though the data types are validated, the clauses and attributes also need to correspond
  // between definitions and instances, so we reset them here to be sure they are correct.
  // TODO: See if Zod can handle this validation as well.
  // -Jeremy B May 2021.
  static fixupUntypedIssues(model: CodeWorkspace) {
    const getDefById = (id: number): BlockDefinition | undefined =>
      model.blocks.filter( (b) => b.id === id )[0]

    const processInstance = (instance: BlockInstance) => {
      const definition = getDefById(instance.definitionId)
      VersionManager.resetBlockInstance(definition!, instance)
      instance.clauses.forEach( (clause) => {
        clause.blocks = clause.blocks.filter( (b) => getDefById(b.definitionId) !== undefined )
        clause.blocks.forEach(processInstance)
      })
    }

    model.program.chains.forEach( (chain) => {
      chain.blocks = chain.blocks.filter( (b) => getDefById(b.definitionId) !== undefined )
      chain.blocks.forEach(processInstance)
    })
  }

  static resetBlockInstance(definition: BlockDefinition, instance: BlockInstance) {
    instance.clauses = definition.clauses.map( (_, i) => {
      return instance.clauses.length > i ? instance.clauses[i] : { blocks: [] }
    })

    instance.params = definition.params.map( (a, i) => {
      return i < instance.params.length ? VersionManager.resetAttribute(a, instance.params[i]) : makeAttributeDefault(a)
    })

    instance.properties = definition.properties.map( (a, i) => {
      return i < instance.properties.length ? VersionManager.resetAttribute(a, instance.properties[i]) : makeAttributeDefault(a)
    })
  }

  static resetAttribute(attribute: Attribute, value: AttributeValue): AttributeValue {
    switch (attribute.type) {

      case "text":
      case "select":
        if (["text", "select"].includes(value.type)) {
          value.type = attribute.type
        } else {
          value = makeStringDefault(attribute)
        }
        break

      case "int":
      case "range":
        if (["int", "range"].includes(value.type)) {
          value.type = attribute.type
        } else {
          value = makeNumberDefault(attribute)
        }
        break

      case "num":
        value = (value.type === "num") ? value : makeExpressionDefault(attribute)
        break

      case "bool":
        value = (value.type === "bool") ? value : makeExpressionDefault(attribute)
        break

    }

    return value
  }

}

export { VersionManager }
