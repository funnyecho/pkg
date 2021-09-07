import { ITransport, ITerminalTransport, IEntry } from '../';
import transport from '../transport';
import { IContext } from '@funnyecho/context';

export type ISplitAssert = (ctx: IContext, entry: IEntry) => boolean;

function withSplit(tester: ISplitAssert, truth: ITransport | ITerminalTransport, falsy: ITransport | ITerminalTransport): ITransport {
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
  withSplit,
};
