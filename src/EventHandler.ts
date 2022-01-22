import { Event } from './Event';
import { EventPriority } from './EventPriority';
import { container, EventHandlerData } from './EventHandlerDataContainer';
import { ClassType } from './types';

export type EventHandlerOptions = {
  priority: EventPriority;
  ignoreCancelled: boolean;
  inheritance: boolean;
  override: boolean;
};

export const defaultOptions: EventHandlerOptions = {
  priority: EventPriority.NORMAL,
  ignoreCancelled: true,
  inheritance: false,
  override: true,
};

export type EventHandlerFunction<E extends Event = Event> = (event: E) => any;

/**
 * EventHandler decorator
 */
export function EventHandler<E extends Event>(
  target: object,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<EventHandlerFunction<E>>,
): void;

/**
 * EventHandler decorator factory
 */
export function EventHandler(
  options?: Partial<EventHandlerOptions>,
): <E extends Event>(
  target: object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<EventHandlerFunction<E>>,
) => void;

export function EventHandler(
  ...args:
    | [options?: Partial<EventHandlerOptions>]
    | [
        target: object,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<EventHandlerFunction>,
      ]
): void | typeof decorator {
  let options: EventHandlerOptions;
  if (args.length === 3) {
    options = defaultOptions;
    decorator(...args);
  } else {
    options = { ...defaultOptions, ...args[0] };
    return decorator;
  }

  function decorator<E extends Event>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<EventHandlerFunction<E>>, // do not remove! the <E> ensures correct type checking
  ): void {
    const eventClass = getEventHandlerEventClass(target, propertyKey);

    const eventHandlerData: EventHandlerData = {
      listenerClass: target.constructor as ClassType,
      functionName: propertyKey,
      priority: options.priority,
      ignoreCancelled: options.ignoreCancelled,
      inheritance: options.inheritance,
      override: options.override,
      eventClass,
    };

    container.add(eventHandlerData);
  }
}

/**
 * Get event class for some event handler
 */
function getEventHandlerEventClass<T extends Event>(
  target: object,
  propertyKey: string | symbol,
): ClassType<T> {
  const [eventType] = Reflect.getMetadata('design:paramtypes', target, propertyKey);

  if (!eventType || !(eventType.prototype instanceof Event)) {
    throw new Error(
      `The first parameter of method '${propertyKey.toString()}' on ${
        target.constructor.name
      } is not an Event type.`,
    );
  }

  return eventType;
}
