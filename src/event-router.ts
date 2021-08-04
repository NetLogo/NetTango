// NetTango Copyright (C) Michael S. Horn, Uri Wilensky, and Corey Brady. https://github.com/NetLogo/NetTango

import { ProgramChangedEvent } from "./events"

type ListenerFunction = (e: ProgramChangedEvent) => void
type ListenerStruct = {
  id: string
, containerId: string
, eventTypes: ProgramChangedEvent['type'][]
, listen: ListenerFunction
}

class EventRouter {

  private listeners: Map<string, ListenerStruct> = new Map()

  addListener(id: string, containerId: string, eventTypes: ProgramChangedEvent['type'][], listen: ListenerFunction): void {
    const key = `__${id}:${containerId}`
    this.listeners.set(key, { id, containerId, eventTypes, listen })
  }

  fireEvent(e: ProgramChangedEvent): void {
    const allListeners = Array.from(this.listeners.values())
    const listeners = allListeners.filter( (listener) => listener.containerId === e.containerId && listener.eventTypes.includes(e.type) )
    listeners.forEach( (listener) => listener.listen(e) )
  }

}

const router = new EventRouter()

export { router as EventRouter }
