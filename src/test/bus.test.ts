import { Event, EventBus, EventHandler } from '../index';

class TestEvent extends Event {}
class TestEvent2 extends Event {}

it('returns whether an event was handled when emitting', () => {
  class TestListener {
    @EventHandler
    handler1(event: TestEvent) {
      //
    }
  }

  const bus = new EventBus();
  bus.register(new TestListener());

  expect(bus.emit(new TestEvent())).resolves.toBe(true);
  expect(bus.emit(new TestEvent2())).resolves.toBe(false);
});
