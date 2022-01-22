import { getOrSetDefault, getOrDefault } from '../map-utils';

describe('getOrDefault', () => {
  it.concurrent('returns the default value when the key is not present', () => {
    const map = new Map<number, number>();
    const key = 2;
    const defaultValue = Math.random();

    expect(map.has(key)).toBe(false);
    expect(getOrDefault(map, key, defaultValue)).toBe(defaultValue);
    expect(map.has(key)).toBe(false);
  });

  it.concurrent('returns the value when the key is present', () => {
    const map = new Map<number, number>();
    const key = 2;
    const value = 3;
    const defaultValue = Math.random() + value;
    map.set(key, value);
    expect(getOrDefault(map, key, defaultValue)).toBe(value);
  });
});

describe('getOrSetDefault', () => {
  it.concurrent('returns and sets the default value when the key is not present', () => {
    const map = new Map<number, number>();
    const key = 2;
    const defaultValue = Math.random();

    expect(map.has(key)).toBe(false);
    expect(getOrSetDefault(map, key, defaultValue)).toBe(defaultValue);
    expect(map.has(key)).toBe(true);
  });

  it.concurrent('returns the value when the key is present', () => {
    const map = new Map<number, number>();
    const key = 1;
    const value = 2;
    const defaultValue = Math.random();
    map.set(key, value);
    expect(getOrSetDefault(map, key, defaultValue)).toBe(value);
  });
});
