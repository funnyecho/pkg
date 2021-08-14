import type { IContext } from '@funnyecho/context';
import context from '@funnyecho/context';

export interface ISentryTransportConfig {
  exceptionExtraFlatDepth: number;
  messageExtraFlatDepth: number;
  breadcrumbDataFlatDepth: number;
}

function newSentryTransportConfig(): ISentryTransportConfig {
  return {
    exceptionExtraFlatDepth: 4,
    messageExtraFlatDepth: 3,
    breadcrumbDataFlatDepth: 3,
  };
}

const valuer = context.newValuer<ISentryTransportConfig>();

function withSentryTransportConfig(ctx: IContext, config?: ISentryTransportConfig): IContext {
  return context.withValue(ctx, valuer, config || newSentryTransportConfig());
}

function takeSentryTransportConfig(ctx: IContext): ISentryTransportConfig {
  return ctx.value(valuer);
}

export default {
  withSentryTransportConfig,
  takeSentryTransportConfig,
  newSentryTransportConfig,
};
