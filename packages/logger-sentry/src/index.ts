import type { ITransport } from '@funnyecho/logger';

import * as Sentry from '@sentry/browser';
import valuer from './valuer';
import logger from '@funnyecho/logger';

function withSentryConfig(): ITransport {
  return (ctx, entry) => {
    return [valuer.withSentryTransportConfig(ctx), entry];
  };
}

function withSentryPort(): ITransport {
  return (ctx, entry) => {
    const config = valuer.takeSentryTransportConfig(ctx);
    const { owner, level, fields } = entry;

    const message = `[${owner}]${entry.message}`;

    switch (level) {
      case logger.LevelEnum.error:
      case logger.LevelEnum.fatal:
        Sentry.captureException(message, {
          tags: {
            'event.owner': owner,
          },
          extra: flat(logger.mapFieldList(fields), config.exceptionExtraFlatDepth),
        });
        break;
      case logger.LevelEnum.info:
        Sentry.captureMessage(message, {
          level: Sentry.Severity.Info,
          tags: {
            'event.owner': owner,
          },
          extra: flat(logger.mapFieldList(fields), config.messageExtraFlatDepth),
        });
        break;
      case logger.LevelEnum.debug:
      default:
        Sentry.addBreadcrumb({
          type: 'Debug',
          level: Sentry.Severity.Log,
          category: owner,
          message,
          data: flat(logger.mapFieldList(fields), config.breadcrumbDataFlatDepth),
        });
        break;
    }
  };
}

export default {
  withSentryConfig,
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
