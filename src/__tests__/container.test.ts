import {
  Event,
  EventHandler,
  EventPriority,
  container,
  EventHandlerData,
  EventHandlerDataContainer,
  defaultOptions,
} from '../index';
import { ClassType } from '../types';

class TestEvent extends Event {}

it.concurrent('adds event handlers in ascending EventPriority order', () => {
  const container = new EventHandlerDataContainer();
  class TestListener {}
  const namedEventHandlerData = (
    functionName: string,
    priority: EventPriority,
  ): EventHandlerData => ({
    ...defaultOptions,
    listenerClass: TestListener,
    eventClass: TestEvent,
    functionName,
    priority,
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
  container.add(a);
  container.add(b);
  container.add(c);
  container.add(d);
  container.add(e);
  container.add(f);
  container.add(g);
  container.add(h);
  container.add(i);
  expect(container.getOwnEventHandlerDataByEventClass(TestEvent)).toEqual([
    i,
    a,
    c,
    g,
    b,
    h,
    d,
    f,
    e,
  ]);
});

describe('getByListenerClass', () => {
  it('retrieves inherited event handlers', () => {
    class SuperListener {
      @EventHandler
      handler1(event: TestEvent): void {}
    }

    class Listener extends SuperListener {
      @EventHandler
      handler2(event: TestEvent): void {}
    }

    const expected: (EventHandlerData & { eventClass: ClassType<Event> })[] = [
      {
        eventClass: TestEvent,
        listenerClass: Listener,
        functionName: 'handler2',
        ...defaultOptions,
      },
      {
        eventClass: TestEvent,
        listenerClass: SuperListener,
        functionName: 'handler1',
        ...defaultOptions,
      },
    ];
    expect(container.getEventHandlerDataForListenerClass(Listener)).toEqual(expected);
  });

  describe('override=true', () => {
    it('does not retrieve overridden inherited event handlers', () => {
      class SuperListener {
        @EventHandler
        handler(event: TestEvent): void {}
      }

      class Listener extends SuperListener {
        @EventHandler
        handler(event: TestEvent): void {}
      }

      const expected: (EventHandlerData & { eventClass: ClassType<Event> })[] = [
        {
          eventClass: TestEvent,
          listenerClass: Listener,
          functionName: 'handler',
          ...defaultOptions,
        },
      ];
      expect(container.getEventHandlerDataForListenerClass(Listener)).toEqual(expected);
    });
  });

  describe('override=false', () => {
    it('retrieves overridden inherited event handlers', () => {
      class SuperListener {
        @EventHandler
        handler(event: TestEvent): void {}
      }

      class Listener extends SuperListener {
        @EventHandler({ override: false })
        handler(event: TestEvent): void {}
      }

      const expected: (EventHandlerData & { eventClass: ClassType<Event> })[] = [
        {
          ...defaultOptions,
          eventClass: TestEvent,
          listenerClass: Listener,
          functionName: 'handler',
          override: false,
        },
        {
          ...defaultOptions,
          eventClass: TestEvent,
          listenerClass: SuperListener,
          functionName: 'handler',
        },
      ];
      expect(container.getEventHandlerDataForListenerClass(Listener)).toEqual(expected);
    });
  });
});

it.concurrent('returns inherited listener EventHandlers in the correct order', async () => {
  class Super {}
  class Sub extends Super {}

  const container = new EventHandlerDataContainer();
  const eventHandlerDatas = [
    {
      ...defaultOptions,
      eventClass: TestEvent,
      listenerClass: Sub,
      functionName: 'subLowest',
      priority: EventPriority.LOWEST,
    },
    {
      ...defaultOptions,
      eventClass: TestEvent,
      listenerClass: Sub,
      functionName: 'subHighest',
      priority: EventPriority.HIGHEST,
    },
    {
      ...defaultOptions,
      eventClass: TestEvent,
      listenerClass: Super,
      functionName: 'superLowest',
      priority: EventPriority.LOWEST,
    },
    {
      ...defaultOptions,
      eventClass: TestEvent,
      listenerClass: Super,
      functionName: 'superHighest',
      priority: EventPriority.HIGHEST,
    },
  ];
  eventHandlerDatas.forEach((eventHandlerData) => container.add(eventHandlerData));

  const expected = [
    eventHandlerDatas[0],
    eventHandlerDatas[2],
    eventHandlerDatas[1],
    eventHandlerDatas[3],
  ];
  expect(container.getOwnEventHandlerDataByEventClass(TestEvent)).toStrictEqual(expected);
  expect(container.getEventHandlerDataForListenerClass(Sub)).toStrictEqual(expected);
});

it.concurrent('returns events being listened for (no superclasses)', async () => {
  class SuperEvent extends Event {}
  class A extends SuperEvent {}
  class B extends SuperEvent {}
  class C extends SuperEvent {}

  class Listener {
    @EventHandler
    a(a: A): void {}

    @EventHandler
    b(b: B): void {}

    @EventHandler
    c(c: C): void {}
  }

  const eventClasses = container.getEventClasses();
  expect(eventClasses.includes(A)).toBe(true);
  expect(eventClasses.includes(B)).toBe(true);
  expect(eventClasses.includes(C)).toBe(true);
  expect(eventClasses.includes(SuperEvent)).toBe(false);
});

it.concurrent('getEventHandlerDataForListenerClass works for listeners without a prototype', () => {
  expect(container.getEventHandlerDataForListenerClass(Object.create(null)).length).toBe(0);
});
