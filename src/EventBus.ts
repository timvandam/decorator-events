import { Event } from './Event';
import { container, EventHandlerData } from './EventHandlerDataContainer';
import * as mustache from 'mustache';
import { EventPriority } from './EventPriority';
import { Context, ContextVariable } from './Context';
import { UncaughtErrorEvent } from './UncaughtErrorEvent';
import { ClassType } from './types';
import * as map from './map-utils';

type JitEventHandler = <T extends Event>(event: T) => Promise<boolean>;

export class EventBus<L extends object = object> {
  protected listenersByClass: Map<ClassType<L>, L[]> = new Map();
  protected eventHandler: JitEventHandler = () => Promise.resolve(false);

  protected registerListener(listener: L): void {
    const clazz = listener.constructor as ClassType<L>;
    map.getOrSetDefault(this.listenersByClass, clazz, []).push(listener);
  }

  register(...listeners: L[]): void {
    listeners.forEach((listener) => this.registerListener(listener));
    this.buildEventHandler();
  }

  emit<T extends Event>(event: T): Promise<boolean> {
    return this.eventHandler(event);
  }

  protected getEventHandlerDataMap(): Map<
    ClassType<Event>,
    (EventHandlerData & { listeners: L[] })[]
  > {
    const result = new Map<ClassType<Event>, (EventHandlerData & { listeners: L[] })[]>();

    for (const [listenerClass, listeners] of this.listenersByClass) {
      for (const eventHandlerData of container.getEventHandlerDataForListenerClass(listenerClass)) {
        map
          .getOrSetDefault(result, eventHandlerData.eventClass, [])
          .push({ ...eventHandlerData, listeners });
      }
    }

    return result;
  }

  /**
   * Dynamically builds a function that will handle all emitted events.
   * Built functions are much faster than looping through all registered listeners for each emit.
   * Though, this is not ideal if event listeners are often registered.
   */
  protected buildEventHandler(): void {
    const context = new Context();
    const template = `
      return async function (event) {
        let handled = false; // whether this event has been handled by a handler
        {{#eventClasses}}

          // event: {{{eventClassName}}}
          if (event instanceof {{{eventClass}}}) {
            {{#handlers}}

              // listener : {{{listenerName}}}
              // handler  : {{{functionName}}}
              // priority : {{{priority}}}
              if (true
                {{#ignoreCancelled}}
                  /* ignore cancelled */  && !event.isCancelled()
                {{/ignoreCancelled}}
                {{^inheritance}}
                  /* no inheritance */    && event.constructor === {{{eventClass}}}
                {{/inheritance}}
              ) {
                  try {
                      handled = true;
                      await {{{listenerClass}}}.prototype[{{{functionName}}}].call({{{listener}}}, event);
                  } catch (error) {
                      const errorHandled = await eventBus.emit(new UncaughtErrorEvent(error));
                      if (errorHandled === false) {
                          throw error;
                      }
                  }
              } 
            {{/handlers}}
          }
        {{/eventClasses}}
        
        return handled;
      }
    `;

    // Globals
    context.value(this, 'eventBus');
    context.value(UncaughtErrorEvent, 'UncaughtErrorEvent');

    type TemplateInput = {
      eventClasses: {
        eventClass: ContextVariable<ClassType<Event>>;
        eventClassName: string;
        handlers: {
          functionName: ContextVariable<string | symbol>;
          inheritance: boolean;
          ignoreCancelled: boolean;
          listener: ContextVariable<L>;
          listenerClass: ContextVariable<ClassType<L>>;
          listenerName: string;
          priorityName: string;
        }[];
      }[];
    };

    const eventHandlerDataMap = this.getEventHandlerDataMap();
    const templateInput: TemplateInput = {
      eventClasses: [...eventHandlerDataMap.entries()].map(([eventClass, eventHandlerDatas]) => ({
        eventClass: context.value(eventClass),
        eventClassName: eventClass.name,
        handlers: eventHandlerDatas.flatMap(
          ({ inheritance, listenerClass, functionName, ignoreCancelled, priority, listeners }) =>
            listeners.map((listener) => ({
              listener: context.value(listener),
              listenerClass: context.value(listenerClass as ClassType<L>),
              listenerName: listenerClass.name,
              priorityName: EventPriority[priority],
              inheritance,
              ignoreCancelled,
              functionName: context.value(functionName),
            })),
        ),
      })),
    };

    const rendered = mustache.render(template, templateInput);
    this.eventHandler = context.evaluate(rendered) as JitEventHandler;
  }
}
