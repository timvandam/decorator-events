# decorator-events
[![codecov](https://codecov.io/gh/timvandam/decorator-events/branch/main/graph/badge.svg?token=LOJAXCO8DD)](https://codecov.io/gh/timvandam/decorator-events)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Extremely fast decorator-based event library.

This library builds a function that handles all events each time `EventBus::register` is called.
This function is made to be easily optimized by Javascript engines, making this event library faster than native EventEmitters.

Listening for subclasses of events, prioritizing event handlers, and cancelling events is supported.

## Example
```ts
class User {
  constructor(public readonly id: number, public readonly name: string) {}
}

class SignInEvent extends Event {
  constructor(public readonly user: User) {
    super();
  }
}

class Listener {
  @EventHandler
  async eventHandler(event: SignInEvent) {
    console.log(`User ${event.user.name} signed in!`);
    // handle the event
    // ...
  }
}

const bus = new EventBus();
bus.register(new Listener());

bus.emit(new SignInEvent(new User(1, 'Tim'))); // User Tim signed in!
```
