import error from './error';
import field from './field';
import level from './level';
import logger from './logger';
import loggerConfig from './loggerConfig';
import transport from './transport';

export * from './entry';
export * from './error';
export * from './field';
export * from './kvt';
export * from './level';
export * from './logger';
export * from './loggerConfig';
export * from './transport';

export default {
  ...error,
  ...field,
  ...level,
  ...loggerConfig,
  ...logger,
  ...transport,
};
