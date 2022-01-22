import 'reflect-metadata';
import { Event, EventBus, UncaughtErrorEvent, EventHandler, spyOnAllEventHandlers } from '../index';

class TestEvent extends Event {}

it.concurrent('throws uncaught errors when they are not listened for', async () => {
  class TestListener {
    @EventHandler
    handler(event: TestEvent) {
      throw new Error('something went wrong');
    }
  }

  const bus = new EventBus();
  bus.register(new TestListener());

  await expect(bus.emit(new TestEvent())).rejects.toThrow('something went wrong');
});

it.concurrent('emits uncaught errors when they are listened for', async () => {
  class TestListener {
    @EventHandler
    handler(event: TestEvent) {
      throw new Error('something went wrong');
    }

    @EventHandler
    handler2(event: UncaughtErrorEvent) {}
  }

  const bus = new EventBus();
  const listener = new TestListener();
  spyOnAllEventHandlers(listener);
  bus.register(listener);

  await expect(bus.emit(new TestEvent())).resolves.not.toThrow();
  expect(listener.handler2).toBeCalledTimes(1);
});
