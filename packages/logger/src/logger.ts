import type { ITransportList } from './transport';
import type { IKvt } from './kvt';
import LoggerConfig, { ILoggerConfig, IWithLoggerConfig } from './loggerConfig';
import Level from './level';
import Field, { IFieldList } from './field';
import { IEntry } from './entry';
import Transport from './transport';
import Context from '@funnyecho/context';

export type ILogExtra = { [key: string]: any };
export type ILogTupleExtra = IKvt;

export interface ILogger {
  get owner(): string;
  get transportList(): ITransportList;

  debug(msg: string, extra: ILogExtra);
  debug(msg: string, ...extra: ILogTupleExtra);

  info(msg: string, extra: ILogExtra);
  info(msg: string, ...extra: ILogTupleExtra);

  error(msg: string, extra: ILogExtra);
  error(msg: string, ...extra: ILogTupleExtra);
}

function withLogger(logger: ILogger, ...withConfig: IWithLoggerConfig[]): ILogger {
  return newLogger(LoggerConfig.withLoggerConfig(copyLoggerConfig(logger), ...withConfig));
}

function newNopLogger(): ILogger {
  return newLogger(LoggerConfig.newNopLoggerConfig());
}

export default {
  withLogger,
  newNopLogger,
};

function newLogger(config: ILoggerConfig): ILogger {
  const { owner, transportList } = config;

  function marshalLogExtra(extra: any[]): IFieldList {
    return Field.marshalFieldList(extra);
  }

  function log(entry: IEntry) {
    Transport.traverseTransportList(Context.background(), entry, transportList);
  }

  function debug(msg: string, extra: ILogExtra);
  function debug(msg: string, ...extra: ILogTupleExtra);
  function debug(msg: string) {
    const entry: IEntry = {
      owner,
      level: Level.LevelEnum.debug,
      message: msg,
      // eslint-disable-next-line prefer-rest-params
      fields: marshalLogExtra(Array.from(arguments).slice(1)),
    };

    log(entry);
  }

  function info(msg: string, extra: ILogExtra);
  function info(msg: string, ...extra: ILogTupleExtra);
  function info(msg: string) {
    const entry: IEntry = {
      owner,
      level: Level.LevelEnum.info,
      message: msg,
      // eslint-disable-next-line prefer-rest-params
      fields: marshalLogExtra(Array.from(arguments).slice(1)),
    };

    log(entry);
  }

  function error(msg: string, extra: ILogExtra);
  function error(msg: string, ...extra: ILogTupleExtra);
  function error(msg: string) {
    const entry: IEntry = {
      owner,
      level: Level.LevelEnum.error,
      message: msg,
      // eslint-disable-next-line prefer-rest-params
      fields: marshalLogExtra(Array.from(arguments).slice(1)),
    };

    log(entry);
  }

  return {
    get owner() {
      return owner;
    },
    get transportList() {
      return transportList;
    },

    debug,
    info,
    error,
  };
}

function copyLoggerConfig(logger?: ILogger): ILoggerConfig {
  if (!logger) return LoggerConfig.newNopLoggerConfig();

  return {
    owner: logger.owner,
    transportList: logger.transportList,
  };
}