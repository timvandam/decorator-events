export function getOrDefault<K, V>(map: Map<K, V>, key: K, _default: V): V {
  return map.get(key) ?? _default;
}

export function getOrSetDefault<K, V>(map: Map<K, V>, key: K, _default: V): V {
  if (!map.has(key)) {
    map.set(key, _default);
    return _default;
  }

  return map.get(key) as V;
}
