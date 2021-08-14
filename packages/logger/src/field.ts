import error from './error';

export interface IField {
  key?: string;
  value?: any;
}

export type IFieldList = IField[];

function getFieldKey(field?: IField): string {
  return field?.key == null ? '' : String(field.key);
}

function getFieldValue(field?: IField): any {
  return field?.value;
}

function marshalFieldList(...values: any[]): IFieldList {
  const fields: IFieldList = [];

  for (let i = 0; i < values.length; ++i) {
    const item = values[i];
    if (item) {
      const itemType = typeof item;
      if (itemType === 'string') {
        i += 1;
        if (i >= values.length) {
          fields.push({
            key: item,
            value: error.errNilFieldValue,
          });
        } else {
          fields.push({
            key: item,
            value: values[i],
          });
        }
      } else if (isPlainObject(item)) {
        Object.keys(item).forEach((key) => {
          fields.push({
            key,
            value: item[key],
          });
        });
      } else {
        fields.push({
          key: '',
          value: item,
        });
      }
    }
  }

  return fields;
}

function mergeFieldList(...list: IFieldList[]): IFieldList {
  return list.reduce((result, l) => {
    if (!Array.isArray(l)) return result;
    return result.concat(l || []);
  }, []);
}

function mapFieldList(fields: IFieldList): { [key: string]: any } {
  const record: { [key: string]: any } = {};
  const extra: any[] = [];

  (fields || []).forEach((field) => {
    const key = getFieldKey(field);
    const value = getFieldValue(field);

    if (!key) {
      extra.push(value);
    } else {
      record[key] = value;
    }
  });

  if (extra.length > 0) {
    Object.assign(record, { __extra__: extra });
  }

  return record;
}

export default {
  getFieldKey,
  getFieldValue,

  marshalFieldList,

  mergeFieldList,
  mapFieldList,
};

// Refer to: https://stackoverflow.com/a/5878101
function isPlainObject(obj) {

  // Basic check for Type object that's not null
  if (typeof obj == 'object' && obj !== null) {

    // If Object.getPrototypeOf supported, use it
    if (typeof Object.getPrototypeOf == 'function') {
      var proto = Object.getPrototypeOf(obj);
      return proto === Object.prototype || proto === null;
    }

    // Otherwise, use internal class
    // This should be reliable as if getPrototypeOf not supported, is pre-ES5
    return Object.prototype.toString.call(obj) == '[object Object]';
  }

  // Not an object
  return false;
}
