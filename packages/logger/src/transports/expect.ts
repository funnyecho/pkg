import type { IEntry, ITransport, ITerminalTransport } from '../';
import transport from '../transport';
import { IContext } from '@funnyecho/context';

export type IExpectAssert = (ctx: IContext, entry: IEntry) => boolean;

function withExpect(tester: IExpectAssert, next: ITransport | ITerminalTransport): ITransport {
  return {
    capture(ctx, entry) {
      if (tester(ctx, entry) && next != null) {
        return transport.traverseCapturedTransportList(ctx, entry, [next]);
      }
    },
    bubble(ctx, entry) {
      if (tester(ctx, entry) && next != null) {
        return transport.traverseBubbledTransportList(ctx, entry, [next]);
      }
    },
  };
}

function withTruth(tester: IExpectAssert, next: ITransport | ITerminalTransport): ITransport {
  return withExpect(tester, next);
}

function withFalsy(tester: IExpectAssert, next: ITransport | ITerminalTransport): ITransport {
  return withExpect((ctx: IContext, entry: IEntry) => {
    return !tester(ctx, entry);
  }, next);
}

export default {
  withExpect,
  withTruth,
  withFalsy,
};
