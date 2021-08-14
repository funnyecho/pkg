import type { ILevel } from './level';
import type { IFieldList } from './field';

export interface IEntry {
  owner: string;
  level: ILevel;
  message: string;
  fields?: IFieldList;
}
