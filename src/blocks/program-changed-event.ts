// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { BlockInstanceEvent } from "../events"
import { BlockInstanceUI } from "./block-instance"

function createBlockInstanceEvent(block: BlockInstanceUI): BlockInstanceEvent {
  return {
    type: "block-instance-changed"
  , containerId: block.containerId
  , blockId: block.b.definitionId
  , instanceId: block.b.instanceId
  }
}

export {
  createBlockInstanceEvent
}
