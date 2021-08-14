import type { IValuer } from './valuer';
import promise from '@funnyecho/promise';
import type { IDuration, ITime } from '@funnyecho/time';
import time from '@funnyecho/time';
import constant from './constant';
import contextValuer from './valuer';

type IDonePromise = Promise<void>;
type ICancelFunc = () => void;

export interface IContext {
  deadline(): ITime | null;
  done(): IDonePromise;
  err(): Error | null;
  value<T>(cv: IValuer<T>): T | null;
}

function background(): IContext {
  return forkParentCtx(_background);
}

function todo(): IContext {
  return forkParentCtx(_todo);
}

function withValue<T>(parent: IContext, valuer: IValuer<T>, value: T): IContext {
  return newValueCtx(parent, valuer, value);
}

function withCancel(parent: IContext): [IContext, ICancelFunc] {
  return newCancelCtx(parent);
}

function withTimeout(parent: IContext, timeout: IDuration): [IContext, ICancelFunc] {
  return newCancelCtx(newTimeoutCtx(parent, timeout));
}

function withDeadline(parent: IContext, deadline: ITime): [IContext, ICancelFunc] {
  return newCancelCtx(newDeadlineCtx(parent, deadline));
}

export default {
  background,
  todo,
  withValue,
  withCancel,
  withTimeout,
  withDeadline,

  ...constant,
  ...contextValuer,
};

function newEmptyCtx(): IContext {
  return {
    deadline() {
      return null;
    },
    done(): Promise<void> {
      return promise.zombie;
    },
    err(): null {
      return null;
    },
    value<T>(cv: IValuer<T>): T | null {
      return cv ? cv.defaultGetter() : null;
    },
  };
}

function newValueCtx<T>(parent: IContext, valuer: IValuer<T>, value: T): IContext {
  return {
    deadline(): ITime | null {
      return parent.deadline();
    },
    done(): Promise<void> {
      return parent.done();
    },
    err(): Error | null {
      return parent.err();
    },
    value(cv: IValuer): any {
      if (valuer === cv) {
        return value;
      }

      return parent.value(cv);
    },
  };
}

function forkParentCtx(parent: IContext): IContext {
  if (!parent) parent = _background;

  return {
    deadline() {
      return parent.deadline();
    },
    done() {
      return parent.done();
    },
    err() {
      return parent.err();
    },
    value(cv) {
      return parent.value(cv);
    },
  };
}

function createCancellablePromise(): [IDonePromise, ICancelFunc] {
  return promise.resolvable();
}

function newTimeoutCtx(parent: IContext, dur: IDuration): IContext {
  let error: Error | null;

  const deadline = time.later(dur);
  const timeoutPromise = promise.resolveAfterDuration(dur);

  return {
    deadline(): ITime | null {
      return deadline;
    },
    done(): Promise<void> {
      return Promise.race([parent.done().then(() => parent.err()), timeoutPromise.then(() => new Error(constant.errTimeout))]).then((err) => {
        error = err;
      });
    },
    err(): Error | null {
      return error;
    },
    value<T>(cv: IValuer<T>): T | null {
      return parent.value(cv);
    },
  };
}

function newDeadlineCtx(parent: IContext, deadline: ITime): IContext {
  let error: Error | null = null;

  const deadlinePromise = promise.resolveAfterDuration(deadline.duration(time.now()));

  return {
    deadline(): ITime | null {
      return deadline;
    },
    done(): Promise<void> {
      return Promise.race([
        parent.done().then(() => parent.err()),
        deadlinePromise.then(() => {
          return new Error(constant.errDeadline);
        }),
      ]).then((err) => {
        error = err;
      });
    },
    err(): Error | null {
      return error;
    },
    value<T>(cv: IValuer<T>): T | null {
      return parent.value(cv);
    },
  };
}

function newCancelCtx(parent: IContext): [IContext, ICancelFunc] {
  const [cancelPromise, cancelFunc] = createCancellablePromise();

  let error: Error | null = null;

  return [
    {
      deadline(): ITime | null {
        return parent.deadline();
      },
      done(): IDonePromise {
        return Promise.race([
          parent.done().then(() => {
            return parent.err();
          }),
          cancelPromise.then(() => {
            return new Error(constant.errCanceled);
          }),
        ]).then((err) => {
          error = err;
        });
      },
      err(): Error | null {
        return error;
      },
      value<T>(cv: IValuer<T>): T | null {
        return parent.value(cv);
      },
    },
    cancelFunc,
  ];
}

const _background = newEmptyCtx();
const _todo = newEmptyCtx();
