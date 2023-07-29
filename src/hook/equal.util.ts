type ArrayValue = any[] | null | undefined;

function shallowEqualArrays(
  arrA: ArrayValue,
  arrB: ArrayValue
): boolean {
  if (!arrA || !arrB) {
    return false;
  }

  const len = arrA.length;

  if (arrB.length !== len) {
    return false;
  }

  for (let i = 0; i < len; i++) {
    if (!shallowEqual(arrA[i], arrB[i])) {
      return false;
    }
  }

  return true;
}

export type ObjectValue = Record<string, any> | null | undefined;

function shallowEqualObjects(
  objA: ObjectValue,
  objB: ObjectValue
): boolean {
  if (!objA || !objB) {
    return false;
  }

  const aKeys = Object.keys(objA);
  const bKeys = Object.keys(objB);
  const len = aKeys.length;

  if (bKeys.length !== len) {
    return false;
  }

  for (let i = 0; i < len; i++) {
    const key = aKeys[i];

    if (
      !shallowEqual(objA[key], objB[key]) ||
      !Object.prototype.hasOwnProperty.call(objB, key)
    ) {
      return false;
    }
  }

  return true;
}

export function shallowEqual(a: any, b: any): boolean {
  const aIsArr = Array.isArray(a);
  const bIsArr = Array.isArray(b);

  if (aIsArr !== bIsArr) {
    return false;
  }

  if (aIsArr && bIsArr) {
    return shallowEqualArrays(a, b);
  }

  const aIsObj = typeof a === 'object';
  const bIsObj = typeof b === 'object';

  if (aIsObj !== bIsObj) {
    return false;
  }

  if (aIsObj && bIsObj) {
    return shallowEqualObjects(a, b);
  }

  return Object.is(a, b);
}
