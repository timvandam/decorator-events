export function insert<T>(array: T[], thing: T, index: number): void {
  index = Math.max(0, index);
  index = Math.min(array.length, index);
  array.splice(index, 0, thing);
}

/**
 * Merges source into target. Both should be ascending.
 */
export function merge<T>(target: T[], source: T[], keyExtractor: (element: T) => number): void {
  let insertIndex = 0;
  for (const element of source) {
    while (
      insertIndex < target.length &&
      keyExtractor(element) >= keyExtractor(target[insertIndex])
    ) {
      insertIndex++;
    }

    insert(target, element, insertIndex);
  }
}
