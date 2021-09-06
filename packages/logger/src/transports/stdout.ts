import type { ITransport } from '../transport';
import loggerLevel from '../level';
import Field from '../field';

function withStdout(): ITransport {
  return (_, entry) => {
    const { owner, level, message, fields } = entry;
    const output = [`[${owner}]${message}\n`, Field.mapFieldList(fields)];
    switch (level) {
      case loggerLevel.LevelEnum.error:
      case loggerLevel.LevelEnum.fatal:
        console.error(...output);
        break;
      case loggerLevel.LevelEnum.info:
        console.info(...output);
        break;
      default:
      case loggerLevel.LevelEnum.debug:
        console.debug(...output);
        break;
    }
  };
}

export default {
  withStdout,
};
