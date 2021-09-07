import type { ITransport, ITransportList } from '../';
import transport from '../transport';

function withConcat(...transportList: ITransportList): ITransport {
  return {
    capture(ctx, entry) {
      return transport.traverseCapturedTransportList(ctx, entry, transportList);
    },
    bubble(ctx, entry) {
      return transport.traverseBubbledTransportList(ctx, entry, transportList);
    }
  }
}

export default {
  withConcat,
};
