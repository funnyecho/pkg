import context from './index';
import valuer from './valuer';
import time from '@funnyecho/time';
import constant from './constant';

describe('empty context', () => {
  [context.background(), context.todo()].forEach((ctx) => {
    test('done return not null', async () => {
      expect(ctx.done()).not.toBeNull();
    });

    test('err return null', async () => {
      expect(ctx.err()).toBeNull();
    });

    test('value return default value', async () => {
      const va = valuer.newValuer(1);
      expect(ctx.value(va)).toEqual(1);
    });

    test('deadline is nil', () => {
      const dd = ctx.deadline();
      expect(dd).toBeNull();
    });
  });
});

describe('valuer', function () {
  const va = valuer.newValuer(1);
  const vb = valuer.newValuer(true);
  const vc = valuer.newValuer(['foo']);

  const ctx = context.background();
  const ctxA = context.withValue(ctx, va, 2);
  const ctxB = context.withValue(ctxA, vb, false);
  const ctxC = context.withValue(ctxB, vc, ['bar']);

  const ctxAA = context.withValue(ctxC, va, 3);
  const ctxCC = context.withValue(ctxB, vc, ['zoo']);

  test('get value', () => {
    expect(ctx.value(va)).toEqual(1);
    expect(ctx.value(vb)).toEqual(true);
    expect(ctx.value(vc)).toEqual(['foo']);

    expect(ctxA.value(va)).toEqual(2);
    expect(ctxA.value(vb)).toEqual(true);
    expect(ctxA.value(vc)).toEqual(['foo']);

    expect(ctxB.value(va)).toEqual(2);
    expect(ctxB.value(vb)).toEqual(false);
    expect(ctxB.value(vc)).toEqual(['foo']);

    expect(ctxC.value(va)).toEqual(2);
    expect(ctxC.value(vb)).toEqual(false);
    expect(ctxC.value(vc)).toEqual(['bar']);

    expect(ctxAA.value(va)).toEqual(3);
    expect(ctxAA.value(vb)).toEqual(false);
    expect(ctxAA.value(vc)).toEqual(['bar']);

    expect(ctxCC.value(va)).toEqual(2);
    expect(ctxCC.value(vb)).toEqual(false);
    expect(ctxCC.value(vc)).toEqual(['zoo']);
  });

  describe('valuer with default valur getter', function () {
    let seed = 0;
    const getter = () => {
      return seed++;
    }

    const vl = valuer.newValuerWithGetter(getter);
    const ctx = context.background();

    test('get value', () => {
      expect(ctx.value(vl)).toEqual(0);
      expect(ctx.value(vl)).toEqual(1);
    });
  });

  describe('valuer without default value', function () {
    const vl = valuer.newValuer()
    const ctx = context.background();
    test('get value', () => {
      expect(() => {
        ctx.value(vl);
      }).toThrowError(constant.errNotNullableValuer);
    });
  })
});

describe('withCancel', function () {
  const [ctx, cancelCtx] = context.withCancel(context.background());

  test('before cancel', () => {
    expect(ctx.err()).toBeNull();
  });

  test('after cancel', () => {
    return new Promise((cb) => {
      ctx
        .done()
        .then(() => {
          expect(ctx.err()?.message).toBe(context.errCanceled);
        })
        .finally(() => {
          cb(undefined);
        });

      cancelCtx();
    });
  });
});

describe('withDeadline', function () {
  const timeout = time.Millisecond * 20;

  test('cancel before deadline', () => {
    return new Promise((cb) => {
      const [ctx, cancel] = context.withDeadline(context.background(), time.later(timeout));
      ctx.done().then(() => {
        expect(ctx.err()?.message).toBe(context.errCanceled);
        cb(undefined);
      });

      setTimeout(() => {
        cancel();
      }, time.Millisecond);
    });
  });

  test('deadline before cancel', () => {
    return new Promise((cb) => {
      const [ctx, cancel] = context.withDeadline(context.background(), time.later(timeout));
      ctx.done().then(() => {
        expect(ctx.err()?.message).toBe(constant.errDeadline);
        cb(undefined);
      });

      setTimeout(() => {
        cancel();
      }, time.Millisecond * 40);
    });
  });
});

describe('withTimeout', function () {
  const timeout = time.Millisecond * 20;

  test('cancel before deadline', () => {
    return new Promise((cb) => {
      const [ctx, cancel] = context.withTimeout(context.background(), timeout);
      ctx.done().finally(() => {
        expect(ctx.err()?.message).toBe(constant.errCanceled);
        cb(undefined);
      });

      setTimeout(() => {
        cancel();
      }, time.Millisecond);
    });
  });

  test('deadline before cancel', () => {
    return new Promise((cb) => {
      const [ctx, cancel] = context.withTimeout(context.background(), timeout);
      ctx.done().finally(() => {
        expect(ctx.err()?.message).toBe(constant.errTimeout);
        cb(undefined);
      });

      setTimeout(() => {
        cancel();
      }, time.Millisecond * 40);
    });
  });
});

describe('hierarchy context', function () {
  const [ctx1, cancel1] = context.withCancel(context.background());
  const [ctx2] = context.withDeadline(ctx1, time.later(time.Millisecond * 100));
  const [ctx3] = context.withTimeout(ctx2, time.Second);

  test('done before parent', () => {
    return new Promise((cb) => {
      ctx2.done().then(() => {
        expect(ctx2.err()?.message).toBe(constant.errDeadline);
        cb(undefined);
      });

      setTimeout(() => {
        cancel1();
      }, time.Millisecond * 150);
    });
  });

  test('done by parent', () => {
    return new Promise((cb) => {
      ctx3.done().then(() => {
        expect(ctx3.err()?.message).toBe(constant.errDeadline);
        cb(undefined);
      });
    });
  });
});
