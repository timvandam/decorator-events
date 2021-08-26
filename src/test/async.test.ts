import { Event, EventBus, EventHandler } from '../index';

class TestEvent extends Event {
  prop = 1;
}

it('waits for asynchronous event handlers before resolving emit', async () => {
  class TestListener {
    @EventHandler
    async handler(event: TestEvent) {
      await new Promise((r) => setTimeout(r, 1000));
      event.prop = 2;
    }
  }

  const bus = new EventBus();
  bus.register(new TestListener());

  const testEvent = new TestEvent();
  await bus.emit(testEvent);

  expect(testEvent.prop).toBe(2);
});
