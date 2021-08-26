import { Event, EventBus, EventHandler } from '../index';
import {} from 'jest'

class TestEvent extends Event {}

it('works when using EventHandler as a decorator factory', () => {
  let handled = false;
  class TestListener {
    @EventHandler()
    handler(event: TestEvent) {
      handled = true;
    }
  }

  const bus = new EventBus();
  bus.register(new TestListener());
  bus.emit(new TestEvent());

  expect(handled).toBe(true);
});

it('works when using EventHandler as a decorator', () => {
  let handled = false;
  class TestListener {
    @EventHandler
    handler(event: TestEvent) {
      handled = true;
    }
  }

  const bus = new EventBus();
  bus.register(new TestListener());
  bus.emit(new TestEvent());

  expect(handled).toBe(true);
});
