import type { ITransport } from '../transport';
import type { ILevel } from '../level';
import level from '../level';

function withLevel(level: ILevel): ITransport {
  return {
    capture: (_, entry) => {
      if (entry && entry.level > level) {
        return false;
      }
    },
  };
}

function withDebugLevel(): ITransport {
  return withLevel(level.LevelEnum.debug);
}

function withInfoLevel(): ITransport {
  return withLevel(level.LevelEnum.info);
}

export default {
  withLevel,

  withDebugLevel,
  withInfoLevel,
};
