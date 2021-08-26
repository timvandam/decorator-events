import { EventHandlerDataContainer } from '../EventHandlerDataContainer';
import { Event, EventPriority } from '../index';

class TestEvent extends Event {}

it('adds event handlers in ascending EventPriority order', () => {
  const container = new EventHandlerDataContainer();
  class TestListener {}
  const namedEventHandlerData = (functionName: string, priority: EventPriority) => ({
    functionName,
    priority,
    ignoreCancelled: true,
    inheritance: false,
    listenerClass: TestListener,
  });
  const a = namedEventHandlerData('a', EventPriority.LOW);
  const b = namedEventHandlerData('b', EventPriority.HIGH);
  const c = namedEventHandlerData('c', EventPriority.NORMAL);
  const d = namedEventHandlerData('d', EventPriority.HIGHEST);
  const e = namedEventHandlerData('e', EventPriority.MONITOR);
  const f = namedEventHandlerData('f', EventPriority.HIGHEST);
  const g = namedEventHandlerData('g', EventPriority.NORMAL);
  const h = namedEventHandlerData('h', EventPriority.HIGH);
  const i = namedEventHandlerData('i', EventPriority.LOWEST);
  container.add(TestEvent, a);
  container.add(TestEvent, b);
  container.add(TestEvent, c);
  container.add(TestEvent, d);
  container.add(TestEvent, e);
  container.add(TestEvent, f);
  container.add(TestEvent, g);
  container.add(TestEvent, h);
  container.add(TestEvent, i);
  expect(container.get(TestEvent)).toEqual([i, a, c, g, b, h, d, f, e]);
});
