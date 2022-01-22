import {
  Event,
  EventBus,
  EventHandler,
  EventPriority,
  container,
  spyOnAllEventHandlers,
  EventHandlerOptions,
  EventHandlerData,
} from '../index';
import { defaultOptions } from '../EventHandler';

class TestEvent extends Event {}

beforeEach(() => {
  container.clear();
});

it.concurrent('works with @EventHandler()', async () => {
  class TestListener {
    @EventHandler()
    handler(event: TestEvent) {
      //
    }
  }

  const bus = new EventBus();
  const listener = new TestListener();
  spyOnAllEventHandlers(listener);
  bus.register(listener);
  await bus.emit(new TestEvent());

  expect(listener.handler).toBeCalledTimes(1);
});

it.concurrent('works with @EventHandler', async () => {
  let handled = false;
  class TestListener {
    @EventHandler
    handler(event: TestEvent) {
      handled = true;
    }
  }

  const bus = new EventBus();
  bus.register(new TestListener());
  await bus.emit(new TestEvent());

  expect(handled).toBe(true);
});

it.concurrent('throws when listening for a non-event', () => {
  expect(() => {
    class TestListener {
      // @ts-expect-error The @EventHandler type already checks whether the first arg is a param
      @EventHandler
      handler(event: Map<string, string>) {
        //
      }
    }
  }).toThrow();
});

describe('options', () => {
  it.concurrent('uses default options', () => {
    class TestListener {
      @EventHandler
      handler(event: TestEvent) {
        //
      }
    }

    new EventBus().register(new TestListener());

    const expected: EventHandlerData = {
      ...defaultOptions,
      listenerClass: TestListener,
      functionName: 'handler',
      eventClass: TestEvent,
    };
    expect(container.getOwnEventHandlerDataByEventClass(TestEvent)).toContainEqual(expected);
  });

  it.concurrent('allows for overriding of default options', () => {
    const options: EventHandlerOptions = {
      priority: EventPriority.HIGH,
      ignoreCancelled: false,
      inheritance: true,
      override: true,
    };
    class TestListener {
      @EventHandler(options)
      handler(event: TestEvent) {
        //
      }
    }

    new EventBus().register(new TestListener());

    const expected: EventHandlerData = {
      ...options,
      listenerClass: TestListener,
      functionName: 'handler',
      eventClass: TestEvent,
    };
    expect(container.getOwnEventHandlerDataByEventClass(TestEvent)).toContainEqual(expected);
  });
});
