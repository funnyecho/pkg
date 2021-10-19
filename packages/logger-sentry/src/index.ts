import type { ITransport } from '@funnyecho/logger';

import * as Sentry from '@sentry/browser';
import configValuer from './valuerConfig';
import onTagValuer, { ISentryOnTag } from './valuerOnTag';
import logger from '@funnyecho/logger';

function withSentryConfig(): ITransport {
  return (ctx, entry) => {
    return [configValuer.withSentryTransportConfig(ctx), entry];
  };
}

function withSentryOnTag(onTag: ISentryOnTag): ITransport {
  return (ctx, entry) => {
    return [onTagValuer.withSentryOnTag(ctx, onTag), entry];
  }
}

function withSentryPort(): ITransport {
  return {
    bubble: (ctx, entry) => {
      const config = configValuer.takeSentryTransportConfig(ctx);
      const onTag = onTagValuer.takeSentryOnTag(ctx);
      const { owner, level, fields } = entry;

      const message = `${entry.message}`;
      const fieldMap = logger.mapFieldList(fields);

      const tagged = {};
      if (typeof onTag === 'function') {
        Object.keys(fieldMap).forEach((key) => {
          const shouldTag = onTag(key);
          if (!shouldTag) return;

          const field = fieldMap[key];
          if (typeof field === 'function' || typeof field === 'object') return;

          const tagName = shouldTag === true ? key : shouldTag;
          tagged[tagName] = field;

          delete fieldMap[key];
        })
      }

      switch (level) {
        case logger.LevelEnum.error:
        case logger.LevelEnum.fatal:
          Sentry.captureException(message, {
            tags: {
              'event.owner': owner,
              ...tagged,
            },
            extra: flat(fieldMap, config.exceptionExtraFlatDepth),
          });
          break;
        case logger.LevelEnum.info:
          Sentry.captureMessage(message, {
            level: Sentry.Severity.Info,
            tags: {
              'event.owner': owner,
              ...tagged,
            },
            extra: flat(fieldMap, config.messageExtraFlatDepth),
          });
          break;
        case logger.LevelEnum.debug:
        default:
          Sentry.addBreadcrumb({
            type: 'Debug',
            level: Sentry.Severity.Log,
            category: owner,
            message: `${message} ${JSON.stringify(fieldMap, null, 2)}`,
            data: tagged,
          });
          break;
      }
    },
  };
}

export default {
  withSentryConfig,
  withSentryOnTag,
  withSentryPort,
};

function flat(obj: any, depth: number): any {
  if (!obj) return {};

  if (typeof obj === 'object') {
    if (depth <= 0) {
      return JSON.stringify(obj, undefined, 3);
    }
    return Object.keys(obj).reduce((prev, key) => {
      prev[key] = flat(obj[key], depth - 1);
      return prev;
    }, {});
  }

  if (Array.isArray(obj)) {
    if (depth <= 0) {
      return JSON.stringify(obj, undefined, 3);
    }
    return obj.map((sub) => flat(sub, depth - 1));
  }

  return obj;
}
