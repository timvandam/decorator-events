import { container } from '../EventHandlerDataContainer';

/**
 * Note: does not work with inheritance
 */
export function spyOnAllEventHandlers<T extends object>(listener: T): T {
  const clazz = listener.constructor as new (...args: unknown[]) => T;
  for (const eventHandlerData of container.getEventHandlerDataForListenerClass(clazz)) {
    jest.spyOn(eventHandlerData.listenerClass.prototype, eventHandlerData.functionName as any);
  }
  return listener;
}
