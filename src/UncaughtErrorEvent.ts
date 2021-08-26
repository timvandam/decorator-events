import { Event } from './Event';

export class UncaughtErrorEvent<T = unknown> extends Event {
  constructor(public readonly error: T) {
    super();
  }
}
