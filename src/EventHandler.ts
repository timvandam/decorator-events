import { Event } from './Event';
import { EventPriority } from './EventPriority';
import { container, EventHandlerData } from './EventHandlerDataContainer';
import { ClassConstructor } from './util'

export type EventHandlerOptions = {
  priority: EventPriority;
  ignoreCancelled: boolean;
  inheritance: boolean;
};

const defaultOptions: EventHandlerOptions = {
  priority: EventPriority.NORMAL,
  ignoreCancelled: true,
  inheritance: false,
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
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<EventHandlerFunction<E>>,
) => void;

export function EventHandler(
  ...args:
    | [options?: Partial<EventHandlerOptions>]
    | [
        target: object,
        propertyKey: string,
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
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<EventHandlerFunction<E>>,
  ) {
    const eventHandlerData: EventHandlerData = {
      listenerClass: target.constructor as ClassConstructor<any>,
      functionName: propertyKey,
      priority: options.priority ?? defaultOptions.priority,
      ignoreCancelled: options.ignoreCancelled ?? defaultOptions.ignoreCancelled,
      inheritance: options.inheritance ?? defaultOptions.inheritance,
    };

    container.add(getEventHandlerEventClass(target, propertyKey), eventHandlerData);
  }
}

function getEventHandlerEventClass(target: object, propertyKey: string): ClassConstructor<Event> {
  const [eventType] = Reflect.getMetadata('design:paramtypes', target, propertyKey);

  if (!eventType || !(eventType.prototype instanceof Event)) {
    throw new Error(
      `The first parameter of method '${propertyKey}' on ${target.constructor.name} is not an Event type.`,
    );
  }

  return eventType;
}
