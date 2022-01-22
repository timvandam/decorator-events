import { Context } from '../Context';

describe('duplicate variable declarations', () => {
  it.concurrent('throws for different values', () => {
    const env = new Context();
    env.value(123, 'test');
    expect(() => env.value(321, 'test')).toThrow();
  });

  it.concurrent('does not throw for identical values', () => {
    const env = new Context();
    env.value(123, 'test');
    expect(() => env.value(123, 'test')).not.toThrow();
  });
});

it.concurrent('works when using the same value multiple times', () => {
  const env = new Context();
  env.value(123, 'test1');
  env.value(123, 'test2');
  expect(env.evaluate('return [test2, test1]')).toStrictEqual([123, 123]);
});
