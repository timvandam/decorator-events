import { Event } from './Event';
import { container, EventHandlerData } from './EventHandlerDataContainer';
import mustache from 'mustache';
import { EventPriority } from './EventPriority';
import { Environment } from './Environment';
import { UncaughtErrorEvent } from './UncaughtErrorEvent';
import { ClassConstructor } from './util';

type JitEventHandler = <T extends Event>(event: T) => Promise<boolean>;

export class EventBus {
  protected listenersByClass: Map<ClassConstructor<any>, object[]> = new Map();
  protected jit: JitEventHandler = () => Promise.resolve(false);

  protected registerListener(listener: object) {
    const clazz = listener.constructor as ClassConstructor<any>;
    if (this.listenersByClass.has(clazz)) {
      this.listenersByClass.get(clazz)!.push(listener);
    } else {
      this.listenersByClass.set(clazz, [listener]);
    }
  }

  register(...listeners: object[]): void {
    listeners.forEach((listener) => this.registerListener(listener));
    this.buildJit();
  }

  emit(event: Event) {
    return this.jit(event);
  }

  protected getEventClasses() {
    return container
      .getEventClasses()
      .filter((eventClass) => this.getEventHandlerDataForEventClass(eventClass).length);
  }

  protected getEventHandlerDataForEventClass<T extends Event>(
    eventClass: ClassConstructor<T>,
  ): EventHandlerData[] {
    const eventHandlerData = container.get(eventClass);
    if (eventHandlerData === undefined) {
      return [];
    } else {
      return eventHandlerData.filter((eventHandlerData) =>
        this.listenersByClass.has(eventHandlerData.listenerClass),
      );
    }
  }

  protected buildJit() {
    const env = new Environment();
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
                      await {{{listener}}}.{{{functionName}}}(event);
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
    env.value(this, 'eventBus');
    env.value(UncaughtErrorEvent, 'UncaughtErrorEvent');

    type EnvironmentVariable<T> = string;
    type TemplateInput = {
      eventClasses: {
        eventClass: EnvironmentVariable<Event>;
        eventClassName: string;
        handlers: {
          functionName: string;
          inheritance: boolean;
          ignoreCancelled: boolean;
          listener: EnvironmentVariable<object>;
          listenerName: string;
          priority: string;
        }[];
      }[];
    };

    const templateInput: TemplateInput = {
      eventClasses: this.getEventClasses().map((eventClass) => ({
        eventClass: env.value(eventClass),
        eventClassName: eventClass.name,
        handlers: this.getEventHandlerDataForEventClass(eventClass).flatMap(
          ({ inheritance, listenerClass, functionName, ignoreCancelled, priority }) =>
            this.listenersByClass.get(listenerClass)!.map((listener) => ({
              listener: env.value(listener),
              listenerName: listenerClass.name,
              priority: EventPriority[priority],
              inheritance,
              ignoreCancelled,
              functionName,
            })),
        ),
      })),
    };

    const rendered = mustache.render(template, templateInput);
    this.jit = env.buildFunction(rendered);
  }
}
