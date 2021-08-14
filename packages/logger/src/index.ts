import type { ILogger } from './logger';
import loggerConfig from './loggerConfig';
import level from './level';
import logger from './logger';
import transports from './transports';

export type { ILogger } from './logger';
export type { ITransport } from './transport';

export default {
  transports,
  level,

  ...loggerConfig,
  ...logger,
};
