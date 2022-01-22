import { merge, insert } from '../array-utils';

describe('insert', () => {
  it.concurrent('works when inserting at index 0', () => {
    const array = [1, 2, 3];
    insert(array, 0, 0);
    expect(array).toStrictEqual([0, 1, 2, 3]);
  });

  it.concurrent('works when inserting at the end', () => {
    const array = [1, 2, 3];
    insert(array, 4, array.length);
    expect(array).toStrictEqual([1, 2, 3, 4]);
  });

  it.concurrent('works when inserting in the middle', () => {
    const array = [1, 3];
    insert(array, 2, 1);
    expect(array).toStrictEqual([1, 2, 3]);
  });

  it.concurrent('works when inserting at a negative index', () => {
    const array = [1, 2, 3];
    insert(array, 0, -123);
    expect(array).toStrictEqual([0, 1, 2, 3]);
  });

  it.concurrent('works when inserting at an index above the highest index', () => {
    const array = [1, 2, 3];
    insert(array, 4, 123);
    expect(array).toStrictEqual([1, 2, 3, 4]);
  });

  it.concurrent('works when inserting in an empty array', () => {
    const array: number[] = [];
    insert(array, 999, 0);
    expect(array).toStrictEqual([999]);
  });
});

describe('merge', () => {
  const isSorted = <T>(arr: T[], keySelector: (el: T) => number) =>
    arr.slice(1).every((el, i) => keySelector(arr[i]) <= keySelector(el));

  it.each([
    {
      name: 'works with two big arrays',
      arr1: [1, 5, 12, 50, 53, 53, 53, 53, 54, 69, 420],
      arr2: [-420, -69, 69, 420, 420, 420, 420, 420, 42069],
    },
    {
      name: 'works with empty target',
      arr1: [],
      arr2: [-420, -69, 69, 420, 420, 420, 420, 420, 42069],
    },
    {
      name: 'works with empty source',
      arr1: [1, 5, 12, 50, 53, 53, 53, 53, 54, 69, 420],
      arr2: [],
    },
  ])('$name', ({ arr1, arr2 }) => {
    expect(isSorted(arr1, (e) => e)).toBe(true);
    expect(isSorted(arr2, (e) => e)).toBe(true);

    merge(arr1, arr2, (e) => e);
    expect(isSorted(arr1, (e) => e)).toBe(true);
  });
});
