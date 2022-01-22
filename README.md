# decorator-events

[![npm version](https://badge.fury.io/js/decorator-events.svg)](https://badge.fury.io/js/decorator-events)
[![codecov](https://codecov.io/gh/timvandam/decorator-events/branch/main/graph/badge.svg?token=LOJAXCO8DD)](https://codecov.io/gh/timvandam/decorator-events)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Extremely fast decorator-based event library.

This library builds a function that handles all events each time `EventBus::register` is called.
This function is made to be easily optimized by Javascript engines, making this event library faster
than native EventEmitters. Note that a big disadvantage to this approach is that registering is
expensive (and unregistering is intentionally not made possible).

Event inheritance, event handler prioritization, and cancelling events is supported.

Inspired by the [Spigot Event API](https://www.spigotmc.org/wiki/using-the-event-api/).

## Example

```typescript
import { EventPriority, Event, EventHandler, EventBus } from 'decorator-events';

class SignInEvent extends Event {
  public sessionId?: string;

  constructor (public username: string, public password: string) {
    super();
  }
}

class SignInListener {
  @EventHandler
  async handleSignIn(event: SignInEvent): void {
    if (await passwordIsValid(event.username, event.password)) {
      event.sessionId = await createSessionIdForUser(event.username);
    } else {
      event.cancel();
    }
  }

  @EventHandler({ priority: EventPriority.MONITOR })
  logSignIn(event: SignInEvent): void {
    console.log(`User ${event.username} signed in!`);
  }


  @EventHandler({
    /* When to execute this handler.
     * Higher priority means later execution (thus more control over the final state of an event).
     * Defaults to EventPriority.NORMAL.
     */
    priority: EventPriority.NORMAL,
    /* Whether or not to ignore to cancelled events.
     * Defaults to false.
     */
    ignoreCancelled: true,
    /* Whether or not the override an event handler with the same name in a superclass.
     * Defaults to true. False means both methods are used.
     */
    override: false,
    /* Whether or not to listen to superclasses of the event being listened to.
     * Defaults to false.
     */
    inheritance: false,
  })
  showingOffSettings(event: Event): void {
    // ...
  }
}

const bus = new EventBus();
bus.register(new SignInListener());

await bus.emit(new SignInEvent('tim', 'password123')); // User Tim signed in!
```
