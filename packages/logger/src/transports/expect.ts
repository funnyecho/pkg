import type { IEntry, ITransport } from '../';
import transport from '../transport';
import { IContext } from '@funnyecho/context';

export type IExpectAssert = (ctx: IContext, entry: IEntry) => boolean;
export type ITerminalTransport = undefined | null;

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

function withSplit(tester: IExpectAssert, truth: ITransport | ITerminalTransport, falsy: ITransport | ITerminalTransport): ITransport {
  return {
    capture(ctx, entry) {
      const useTruth = !!tester(ctx, entry);

      if (useTruth && truth != null) {
        return transport.traverseCapturedTransportList(ctx, entry, [truth]);
      }

      if (!useTruth && falsy != null) {
        return transport.traverseCapturedTransportList(ctx, entry, [falsy]);
      }
    },
    bubble(ctx, entry) {
      const useTruth = !!tester(ctx, entry);

      if (useTruth && truth != null) {
        return transport.traverseBubbledTransportList(ctx, entry, [truth]);
      }

      if (!useTruth && falsy != null) {
        return transport.traverseBubbledTransportList(ctx, entry, [falsy]);
      }
    },
  };
}

export default {
  withExpect,
  withTruth,
  withFalsy,
  withSplit,
};
