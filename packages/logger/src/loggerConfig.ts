import type { ITransportList } from './transport';

export interface ILoggerConfig {
  owner: string;
  transportList?: ITransportList;
}

export type IWithLoggerConfig = (config: ILoggerConfig) => ILoggerConfig | void;

function newNopLoggerConfig(): ILoggerConfig {
  return {
    owner: '',
    transportList: [],
  };
}

function withLoggerConfig(config: ILoggerConfig, ...withConfigs: IWithLoggerConfig[]): ILoggerConfig {
  if (!config) config = newNopLoggerConfig();

  for (let i = 0; i < withConfigs.length; ++i) {
    const withFn = withConfigs[i];
    if (typeof withFn === 'function') {
      const c = withFn(config);
      if (c) {
        config = c;
      }
    }
  }

  return config;
}

function pipeOwner(owner: string): IWithLoggerConfig {
  return (config) => {
    if (owner) {
      config.owner = [config.owner, owner].join('.');
    }
  };
}

function withOwner(owner: string): IWithLoggerConfig {
  return (config) => {
    if (owner) {
      config.owner = `${owner}`;
    }
  };
}

function pipeTransport(...transportList: ITransportList): IWithLoggerConfig {
  return (config) => {
    config.transportList = [...(config.transportList || []), ...transportList.filter((v) => v)];
  };
}

export default {
  newNopLoggerConfig,
  withLoggerConfig,

  pipeOwner,
  withOwner,

  pipeTransport,
};
