export function deepMerge<T>(target:any, source:any) {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      deepMerge(target[key], source[key]); // 재귀적으로 병합
    } else {
      target[key] = source[key]; // 값 복사
    }
  }
  return target as T;
}