import type { IEntry } from './entry';
import type { IContext } from '@funnyecho/context';

export type ITransportWalkerFn = (ctx: IContext, entry: IEntry) => void | [IContext, IEntry] | false;
export type ITransportWalkerFnList = ITransportWalkerFn[];

export type ITransport =
  | ITransportWalkerFn
  | {
      capture?: ITransportWalkerFn;
      bubble?: ITransportWalkerFn;
    };

export type ITransportList = ITransport[];

function traverseTransportWalkerList(ctx: IContext, entry: IEntry, list: ITransportWalkerFnList): void | [IContext, IEntry] | false {
  if (!ctx || !Array.isArray(list) || !entry) return;

  for (let i = 0; i < list.length; ++i) {
    const walker = list[i];

    if (typeof walker === 'function') {
      const result = walker(ctx, entry);
      if (Array.isArray(result)) {
        [ctx, entry] = result;
      } else if (result === false) {
        return false;
      }
    }
  }

  return [ctx, entry];
}

function traverseCapturedTransportList(ctx: IContext, entry: IEntry, list: ITransportList): void | [IContext, IEntry] | false {
  if (!ctx || !Array.isArray(list) || !entry) return;

  for (let i = 0; i < list.length; ++i) {
    const transport = list[i];
    if (transport) {
      let walker: ITransportWalkerFn;

      if (typeof transport !== 'function') {
        walker = transport.capture;
      } else {
        walker = transport;
      }

      if (typeof walker === 'function') {
        const result = walker(ctx, entry);
        if (Array.isArray(result)) {
          [ctx, entry] = result;
        } else if (result === false) {
          return false;
        }
      }
    }
  }

  return [ctx, entry];
}

function traverseBubbledTransportList(ctx: IContext, entry: IEntry, list: ITransportList): void | [IContext, IEntry] | false {
  if (!ctx || !Array.isArray(list) || !entry) return;

  for (let i = list.length - 1; i >= 0; --i) {
    const transport = list[i];
    if (transport) {
      let walker: ITransportWalkerFn;

      if (typeof transport !== 'function') {
        walker = transport.bubble;
      }

      if (typeof walker === 'function') {
        const result = walker(ctx, entry);
        if (Array.isArray(result)) {
          [ctx, entry] = result;
        } else if (result === false) {
          return false;
        }
      }
    }
  }

  return [ctx, entry];
}

function traverseTransportList(ctx: IContext, entry: IEntry, list: ITransportList): IEntry | void {
  if (!ctx || !Array.isArray(list) || !entry) return entry;

  const capturedRes = traverseCapturedTransportList(ctx, entry, list);
  if (capturedRes === false) return undefined;

  if (Array.isArray(capturedRes)) {
    [ ctx, entry ] = capturedRes;
  }

  const bubbledRes = traverseBubbledTransportList(ctx, entry, list);
  if (bubbledRes === false) return undefined;

  if (Array.isArray(bubbledRes)) {
    [ ctx, entry ] = bubbledRes;
  }

  return entry;
}

export default {
  traverseTransportWalkerList,
  traverseTransportList,

  traverseCapturedTransportList,
  traverseBubbledTransportList,
};
