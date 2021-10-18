import type { IContext } from '@funnyecho/context';
import context from '@funnyecho/context';

export type ISentryOnTag = (tagName: string) => boolean | string;

function newSentryOnTag(): ISentryOnTag {
  return () => false;
}

const valuer = context.newValuerWithGetter<ISentryOnTag>(newSentryOnTag);

function withSentryOnTag(ctx: IContext, onTag?: ISentryOnTag): IContext {
  return context.withValue(ctx, valuer, onTag || newSentryOnTag());
}

function takeSentryOnTag(ctx: IContext): ISentryOnTag {
  return ctx.value(valuer);
}

export default {
  withSentryOnTag,
  takeSentryOnTag,
  newSentryOnTag,
};
