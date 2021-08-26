import { arrayInsert } from './util';
import { Event } from './Event';
import { EventPriority } from './EventPriority';
import { ClassConstructor } from './util';

export type EventHandlerData = {
  priority: EventPriority;
  ignoreCancelled: boolean;
  inheritance: boolean;
  functionName: string;
  listenerClass: ClassConstructor<any>;
};

/**
 * Container for event handler metadata
 */
export class EventHandlerDataContainer {
  // Stores data for event handlers (ordered by priority) by the event being listened to
  private container = new Map<ClassConstructor<Event>, EventHandlerData[]>();

  getEventClasses() {
    return [...this.container.keys()];
  }

  /**
   * Gets the list of handlers for some event
   */
  get<T extends Event>(eventClass: ClassConstructor<T>): EventHandlerData[] | undefined {
    return this.container.get(eventClass);
  }

  /**
   * Adds eventHandler data to the container, keeping in mind priority
   */
  add<T extends Event>(eventClass: ClassConstructor<T>, eventHandlerData: EventHandlerData): void {
    let handlers = this.get(eventClass);
    if (handlers === undefined) this.container.set(eventClass, (handlers = []));

    // Insert eventHandlerData based on priority
    let inserted = false;
    for (let i = 0; i < handlers.length; i++) {
      if (eventHandlerData.priority < handlers[i].priority) {
        arrayInsert(handlers, eventHandlerData, i);
        inserted = true;
        break;
      }
    }
    if (!inserted) handlers.push(eventHandlerData);
  }
}

export const container: EventHandlerDataContainer = new EventHandlerDataContainer();
