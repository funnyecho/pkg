import type { IFieldList } from '../field';
import Field from '../field';
import type { ITransport } from '../transport';

function withFields(fields: IFieldList): ITransport {
  return (_, entry) => {
    entry.fields = Field.mergeFieldList(entry.fields, fields);
  };
}

export default {
  withFields,
};
