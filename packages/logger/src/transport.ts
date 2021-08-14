import type { IEntry } from './entry';
import type { IContext } from '@funnyecho/context';

type ITransportWalkerFn = (ctx: IContext, entry: IEntry) => void | [IContext, IEntry] | false;

export type ITransport =
  | ITransportWalkerFn
  | {
      capture?: ITransportWalkerFn;
      bubble?: ITransportWalkerFn;
    };

export type ITransportList = ITransport[];

function traverseTransportList(ctx: IContext, entry: IEntry, list: ITransportList): IEntry | void {
  if (!ctx || !Array.isArray(list) || !entry) return entry;

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
        if (result) {
          [ctx, entry] = result;
        } else if (result === false) {
          return undefined;
        }
      }
    }
  }

  for (let i = list.length - 1; i >= 0; --i) {
    const transport = list[i];
    if (transport) {
      let walker: ITransportWalkerFn;

      if (typeof transport !== 'function') {
        walker = transport.bubble;
      }

      if (typeof walker === 'function') {
        const result = walker(ctx, entry);
        if (result) {
          [ctx, entry] = result;
        } else if (result === false) {
          return undefined;
        }
      }
    }
  }

  return entry;
}

export default {
  traverseTransportList,
};
