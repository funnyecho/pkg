import type { IField } from './field';
import loggerField from './field';

describe('getter', function () {
  describe('key getter', function () {
    const tcs: {
      caseName: string;
      pairs: [any, string | ((key: any) => string)][],
    }[] = [
      {
        caseName: 'key is nil',
        pairs: [[null, ''], [undefined, '']],
      },
      {
        caseName: 'key is string type',
        pairs: [['foo', 'foo']],
      },
      {
        caseName: 'key is non string type',
        pairs: [
          [true, String],
          [false, String],
          [NaN, String],
          [1, String],
          [Symbol('foo'), String],
          [{foo: 1}, String],
          [[1,'foo'], String],
          [() => {}, String],
          [Math.max, String],
        ],
      },
    ];

    for (let tc of tcs) {
      test(tc.caseName, () => {
        for (let pair of tc.pairs) {
          const field: IField = { key: pair[0], value: undefined };
          const expectValue = typeof pair[1] === 'function' ? pair[1](pair[0]) : pair[1];
          expect(loggerField.getFieldKey(field)).toEqual(expectValue);
        }
      });
    }

    test('field is nil', () => {
      expect(loggerField.getFieldKey(null)).toEqual('');
    });
  });

  describe('value getter', function () {
    const tcs: {
      caseName: string;
      pairs: [any, any | ((v: any) => any)][];
    }[] = [
      {
        caseName: 'value is nil',
        pairs: [[undefined, undefined], [null, null]],
      },
      {
        caseName: 'return passed value',
        pairs: [
          [1, 1],
          [true, true],
          [{foo: 1}, (v) => v],
        ],
      }
    ];

    for (let tc of tcs) {
      test(tc.caseName, () => {
        for (let pair of tc.pairs) {
          const field: IField = { key: '', value: pair[0] };
          const expectValue = typeof pair[1] === 'function' ? pair[1](pair[0]) : pair[1];
          expect(loggerField.getFieldValue(field)).toStrictEqual(expectValue);
        }
      });
    }

    test('field is nil', () => {
      expect(loggerField.getFieldValue(null)).toEqual(undefined);
    });
  });
});

describe('mergeFieldList', function () {
  const list = loggerField.mergeFieldList(
    undefined,
    null,
    [{key: '1', value: 1}, {key: '2', value: 2}],
    [{key: '3', value: 3}, {key: '4', value: 4}],
  );

  test('length', function () {
    expect(list.length).toBe(4);
  });

  test('merge with source order', function () {
    for (let i = 0; i < list.length; ++i) {
      expect(loggerField.getFieldKey(list[i])).toEqual(`${i+1}`);
      expect(loggerField.getFieldValue(list[i])).toEqual(i+1);
    }
  });
});

describe('mapFieldList', function () {
  const result = loggerField.mapFieldList([
    { key: '1', value: 1 },
    { key: '2', value: 2 },
    { key: null, value: 3 },
    { value: 4 },
    { key: 'foo', value: 'bar' },
    { key: 'foo', value: 'zoo' },
  ]);

  test('invalid key field will store in `__extra__`', function () {
    expect(result.__extra__).toEqual([3, 4]);
  });

  test('duplicated key was merged', function () {
    expect(result.foo).toEqual('zoo');
  });

  test('`key` as key, `value` as value', function () {
    expect(result['1']).toEqual(1);
    expect(result['2']).toEqual(2);
  });
});

describe('marshalFieldList', function () {
  test('marshal like [string, any, string, any]', function () {
    const fl = loggerField.marshalFieldList('foo', 1, 'bar', { age: 18 });
    const fieldMap = loggerField.mapFieldList(fl);

    expect(fl.length).toEqual(2);
    expect(fieldMap.foo).toEqual(1);
    expect(fieldMap.bar).toEqual({ age: 18 });
  });

  describe('marshal like [string, any, string]', function () {
    const fl = loggerField.marshalFieldList('foo', 1, 'lonely string');
    const fieldMap = loggerField.mapFieldList(fl);

    test('unpair string was treat as key with empty value', function () {
      expect(fl.length).toEqual(2);
      expect(fieldMap.foo).toEqual(1);
      expect(fieldMap['longly string']).toEqual(undefined);
      expect(fieldMap.__extra__).toEqual(undefined);
    });
  });

  describe('marshal like [string, any, ...object[]]', function () {
    const fl = loggerField.marshalFieldList('foo', 1, { bar: 2 }, { age: 18 }, { a: { b: 'c' } });
    const fieldMap = loggerField.mapFieldList(fl);

    test('unpair object was merged into field list', function () {
      expect(fl.length).toEqual(4);
      expect(fieldMap.foo).toEqual(1);
      expect(fieldMap.bar).toEqual(2);
      expect(fieldMap.age).toEqual(18);
      expect(fieldMap.a).toEqual({ b: 'c' });
      expect(fieldMap.__extra__).toEqual(undefined);
    });
  });

  describe('marshal like [string, any, ...(nonObject|nonString)[]]', function () {
    const sym = Symbol('non');
    const fl = loggerField.marshalFieldList('foo', 1, { bar: 2 }, [1], true, 'pair', 'abc', sym);
    const fieldMap = loggerField.mapFieldList(fl);

    expect(fl.length).toEqual(6);
    expect(fieldMap.foo).toEqual(1);
    expect(fieldMap.bar).toEqual(2);
    expect(fieldMap.pair).toEqual('abc');

    test('unpair argument was treated as value with empty key', function () {
      expect(fieldMap.__extra__).toEqual([[1], true, sym]);
    });
  });
});