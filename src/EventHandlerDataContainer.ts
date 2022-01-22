import { Event } from './Event';
import { EventPriority } from './EventPriority';
import * as map from './map-utils';
import * as array from './array-utils';
import { ClassType } from './types';

export type EventHandlerData = {
  priority: EventPriority;
  ignoreCancelled: boolean;
  inheritance: boolean;
  functionName: string | symbol;
  listenerClass: ClassType;
  override: boolean;
  eventClass: ClassType<Event>;
};

/**
 * Container for event handler metadata
 */
export class EventHandlerDataContainer {
  // Stores data for event handlers (ordered by priority) by the event being listened to
  private eventHandlerDataByEventClass = new Map<ClassType<Event>, EventHandlerData[]>();
  private eventHandlerDataByListenerClass = new Map<ClassType, EventHandlerData[]>();

  /**
   * Returns event classes in this container (only the actual event classes, not their super classes)
   */
  getEventClasses(): ClassType<Event>[] {
    return [...this.eventHandlerDataByEventClass.keys()];
  }

  getOwnEventHandlerDataByEventClass<E extends Event>(
    eventClass: ClassType<E>,
  ): EventHandlerData[] {
    return map.getOrDefault(this.eventHandlerDataByEventClass, eventClass, []);
  }

  getOwnEventHandlerDataByListenerClass(listenerClass: ClassType): EventHandlerData[] {
    return map.getOrDefault(this.eventHandlerDataByListenerClass, listenerClass, []);
  }

  getEventHandlerDataForListenerClass(listenerClass: ClassType): EventHandlerData[] {
    const result: EventHandlerData[] = [];
    const handlerNames = new Set<string | symbol>();

    while (listenerClass !== Object) {
      const handlers = this.getOwnEventHandlerDataByListenerClass(listenerClass);
      for (const handler of handlers) {
        if (handlerNames.has(handler.functionName)) {
          continue;
        }

        array.merge(result, [handler], (eventHandlerData) => eventHandlerData.priority);

        if (handler.override) {
          handlerNames.add(handler.functionName);
        }
      }

      const superClass =
        listenerClass.prototype &&
        (Reflect.getPrototypeOf(listenerClass.prototype)?.constructor as ClassType | undefined);

      if (superClass === undefined) break;

      listenerClass = superClass;
    }

    return result;
  }

  /**
   * Adds eventHandler data to the container, keeping in mind priority
   */
  add(eventHandlerData: EventHandlerData): void {
    const handlers = map.getOrSetDefault(
      this.eventHandlerDataByEventClass,
      eventHandlerData.eventClass,
      [],
    );

    array.merge(handlers, [eventHandlerData], (eventHandlerData) => eventHandlerData.priority);
    map
      .getOrSetDefault(this.eventHandlerDataByListenerClass, eventHandlerData.listenerClass, [])
      .push(eventHandlerData);
  }

  clear(): void {
    this.eventHandlerDataByEventClass = new Map();
    this.eventHandlerDataByListenerClass = new Map();
  }
}

export const container = new EventHandlerDataContainer();
