import { Event, EventBus, EventHandler, spyOnAllEventHandlers } from '../index';

class TestEvent extends Event {}
class TestEvent2 extends Event {}

it.concurrent('returns whether an event was handled when emitting', async () => {
  class TestListener {
    @EventHandler
    handler1(event: TestEvent) {
      event.cancel();
    }
  }

  const bus = new EventBus();
  bus.register(new TestListener());

  await expect(bus.emit(new TestEvent())).resolves.toBe(true);
  await expect(bus.emit(new TestEvent2())).resolves.toBe(false);
});

it.concurrent('ignored cancelled events if not configured to not ignore', async () => {
  class TestListener {
    @EventHandler
    handler1(event: TestEvent) {
      event.cancel();
    }

    @EventHandler
    handler2(event: TestEvent) {
      //
    }

    @EventHandler({ ignoreCancelled: false })
    handler3(event: TestEvent) {
      event.restore();
    }

    @EventHandler
    handler4(event: TestEvent) {
      //
    }
  }

  const listener = new TestListener();
  spyOnAllEventHandlers(listener);

  const bus = new EventBus();
  bus.register(listener);
  await bus.emit(new TestEvent());

  expect(listener.handler1).toBeCalledTimes(1);
  expect(listener.handler2).toBeCalledTimes(0);
  expect(listener.handler3).toBeCalledTimes(1);
  expect(listener.handler4).toBeCalledTimes(1);
});

it.concurrent('works when not registering anything', async () => {
  await expect(new EventBus().emit(new TestEvent())).resolves.toBe(false);
});
