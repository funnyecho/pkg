import type { IDuration } from '@funnyecho/time';

async function resolveAfterDuration(dur: IDuration): Promise<void> {
  if (dur <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, dur);
  });
}

async function resolveAfterSeconds(s: number): Promise<void> {
  if (s <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, s * 1000);
  });
}

async function resolveAfterEventBubbled($ele: HTMLElement, eventName: string): Promise<Event> {
  return new Promise((resolve) => {
    const listener = (e: Event) => {
      $ele.removeEventListener(eventName, listener);
      resolve(e);
    };

    $ele.addEventListener(eventName, listener);
  });
}

async function zombiePromise(): Promise<void> {
  return zombie;
}

function promiseResolvable(): [Promise<void>, () => void] {
  let resolver: () => void;
  let resolved = false;

  const promise = new Promise<void>((res) => {
    if (resolved) {
      res();
    } else {
      resolver = res;
    }
  });

  const resolveFunc = () => {
    resolved = true;
    typeof resolver === 'function' && resolver();
  };

  return [promise, resolveFunc];
}

const zombie = new Promise<void>((_) => {});

export default {
  zombie,

  resolvable: promiseResolvable,

  resolveAfterEventBubbled,
  resolveAfterSeconds,
  resolveAfterDuration,
};
