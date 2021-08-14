import constant from './constant';

export interface IValuer<T = any> {
  readonly defaultGetter: () => T;
}

function newValuer<T>(value?: T): IValuer<T> {
  let getter: () => T;
  if (value === undefined) {
    getter = () => {
      throw new Error(constant.errNotNullableValuer);
    };
  } else {
    getter = () => {
      return value;
    };
  }

  return createValuer(getter);
}

function newValuerWithGetter<T>(getter?: () => T): IValuer<T> {
  if (typeof getter !== 'function') {
    getter = () => {
      throw new Error(constant.errNotNullableValuer);
    };
  }

  return createValuer(getter);
}

export default {
  newValuer,
  newValuerWithGetter,
};

function createValuer<T>(getter: () => T): IValuer<T> {
  return Object.defineProperty({}, 'defaultGetter', {
    value: getter,
    writable: false,
    configurable: false,
  }) as IValuer<T>;
}
