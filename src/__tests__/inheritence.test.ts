import 'reflect-metadata';
import { spyOnAllEventHandlers, Event, EventBus, EventHandler, EventPriority } from '../';

class TestEvent extends Event {}

it.concurrent('calls handlers in superclass', async () => {
  class SuperListener {
    @EventHandler
    handler(event: TestEvent) {}
  }

  class Listener extends SuperListener {}

  const bus = new EventBus();
  const listener = new Listener();
  spyOnAllEventHandlers(listener);

  bus.register(listener);
  await bus.emit(new TestEvent());
  expect(listener.handler).toHaveBeenCalled();
});

it.concurrent('does not call overridden handlers in superclass', async () => {
  let superHandlerCalled = false;
  let handlerCalled = false;
  class SuperListener {
    @EventHandler
    handler(event: TestEvent) {
      superHandlerCalled = true;
    }
  }

  class Listener extends SuperListener {
    @EventHandler
    handler(event: TestEvent) {
      handlerCalled = true;
    }
  }

  const bus = new EventBus();
  const listener = new Listener();

  bus.register(listener);
  await bus.emit(new TestEvent());
  expect(superHandlerCalled).toBe(false);
  expect(handlerCalled).toBe(true);
});

it.concurrent('calls same-name non-overridden handlers in superclass', async () => {
  let superHandlerCalled = false;
  let handlerCalled = false;
  class SuperListener {
    @EventHandler
    handler(event: TestEvent) {
      superHandlerCalled = true;
    }
  }

  class Listener extends SuperListener {
    @EventHandler({ override: false })
    handler(event: TestEvent) {
      handlerCalled = true;
    }
  }

  const bus = new EventBus();
  const listener = new Listener();

  bus.register(listener);
  await bus.emit(new TestEvent());
  expect(superHandlerCalled).toBe(true);
  expect(handlerCalled).toBe(true);
});

it.concurrent('calls handlers in the correct order', async () => {
  const order: string[] = [];
  class SuperListener {
    @EventHandler({ priority: EventPriority.LOWEST })
    handler1(event: TestEvent) {
      order.push('handler1');
    }

    @EventHandler({ priority: EventPriority.HIGHEST })
    handler2(event: TestEvent) {
      order.push('handler2');
    }
  }

  class Listener extends SuperListener {
    @EventHandler({ priority: EventPriority.LOWEST })
    handler3(event: TestEvent) {
      order.push('handler3');
    }

    @EventHandler({ priority: EventPriority.HIGHEST })
    handler4(event: TestEvent) {
      order.push('handler4');
    }
  }

  const bus = new EventBus();
  bus.register(new Listener());
  await bus.emit(new TestEvent());
  expect(order).toStrictEqual(['handler3', 'handler1', 'handler4', 'handler2']);
});
