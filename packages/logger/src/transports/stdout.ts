import type { ITransport } from '../transport';
import loggerLevel from '../level';
import Field from '../field';

function withStdout(): ITransport {
  return (_, entry) => {
    const { owner, level, message, fields } = entry;
    const label = `${message} [${owner}]`
    const fieldMap = Field.mapFieldList(fields);

    console.group(label);

    Object.keys(fieldMap).forEach((key) => {
      const value = fieldMap[key];
      switch (level) {
        case loggerLevel.LevelEnum.error:
        case loggerLevel.LevelEnum.fatal:
          console.error(key, value);
          break;
        case loggerLevel.LevelEnum.info:
          console.info(key, value);
          break;
        default:
        case loggerLevel.LevelEnum.debug:
          console.debug(key, value);
          break;
      }
    });

    console.groupEnd();
  };
}

export default {
  withStdout,
};
