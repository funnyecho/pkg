import loggerTransport from './transport';
import loggerLevel from './level';
import context from '@funnyecho/context';

describe('traverseTransportList', function () {
  test('call capture then bubble like onion', function () {
    const result = [];

    loggerTransport.traverseTransportList(context.background(), {
      owner: 'logger',
      level: loggerLevel.LevelEnum.info,
      message: 'test',
    }, [
      {
        capture() {
          result.push(1);
        },
        bubble() {
          result.push(11);
        },
      },
      {
        capture() {
          result.push(2);
        },
        bubble() {
          result.push(22);
        },
      },
      {
        capture() {
          result.push(3);
        },
        bubble() {
          result.push(33);
        },
      },
    ]);

    expect(result).toEqual([1, 2, 3, 33, 22, 11]);
  })

  test('function type transport was called at capture stage', function () {
    const result = [];

    loggerTransport.traverseTransportList(context.background(), {
      owner: 'logger',
      level: loggerLevel.LevelEnum.info,
      message: 'test',
    }, [
      () => { result.push(2) },
      {
        capture() {
          result.push(3);
        },
        bubble() {
          result.push(33);
        },
      },
    ]);

    expect(result).toEqual([2, 3, 33]);
  })

  describe('interrupt traversing with returning false', function () {
    test('interrupt at capture stage', function () {
      const result = [];

      loggerTransport.traverseTransportList(context.background(), {
        owner: 'logger',
        level: loggerLevel.LevelEnum.info,
        message: 'test',
      }, [
        {
          capture() {
            result.push(1);
          },
          bubble() {
            result.push(11);
          },
        },
        {
          capture() {
            result.push(2);
            return false;
          },
          bubble() {
            result.push(22);
          },
        },
        {
          capture() {
            result.push(3);
          },
          bubble() {
            result.push(33);
          },
        },
      ]);

      expect(result).toEqual([1, 2]);
    })

    test('interrupt at bubble stage', function () {
      const result = [];

      loggerTransport.traverseTransportList(context.background(), {
        owner: 'logger',
        level: loggerLevel.LevelEnum.info,
        message: 'test',
      }, [
        {
          capture() {
            result.push(1);
          },
          bubble() {
            result.push(11);
          },
        },
        {
          capture() {
            result.push(2);
          },
          bubble() {
            result.push(22);
            return false;
          },
        },
        {
          capture() {
            result.push(3);
          },
          bubble() {
            result.push(33);
          },
        },
      ]);

      expect(result).toEqual([1, 2, 3, 33, 22]);
    })
  });

  test('change input context and entry', function () {
    let entry = {
      owner: 'logger',
      level: loggerLevel.LevelEnum.info,
      message: 'test',
    };

    let cv = context.newValuer(1);
    let ctx = context.background();

    const result = loggerTransport.traverseTransportList(ctx, {...entry}, [
      {
        capture(ctx, entry) {
          expect(ctx.value(cv)).toEqual(1);
          return [ context.withValue(ctx, cv, 2), entry ]
        },
        bubble(ctx, entry) {
          expect(ctx.value(cv)).toEqual(2);
          return [ ctx, null ];
        },
      }
    ]);

    expect(result).toBeNull();
  });
});

describe('traverseTransportWalkerList', function() {
  test('interrupt traversing with returning false', function () {
    const result = [];

    loggerTransport.traverseTransportWalkerList(context.background(), {
      owner: 'logger',
      level: loggerLevel.LevelEnum.info,
      message: 'test',
    }, [
      () => {
        result.push(1);
      },
      () => {
        result.push(2);
        return false;
      },
      () => {
        result.push(3);
      },
    ]);

    expect(result).toEqual([1, 2]);
  });

  test('change input context and entry', function () {
    let entry = {
      owner: 'logger',
      level: loggerLevel.LevelEnum.info,
      message: 'test',
    };

    let cv = context.newValuer(1);
    let ctx = context.background();

    const result = loggerTransport.traverseTransportList(ctx, {
      ...entry,
    }, [
      (ctx, entry) => {
        expect(ctx.value(cv)).toEqual(1);
        return [ context.withValue(ctx, cv, 2), entry ]
      },
      (ctx, entry) => {
        expect(ctx.value(cv)).toEqual(2);
        return [ ctx, null ];
      },
    ]);

    expect(result).toBeNull();
  });
});