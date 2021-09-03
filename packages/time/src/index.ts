// A Time represents an instant in time with millisecond precision.
export type IDuration = number;
export declare class ITime {
  timestamp: number;
  add(d: IDuration): ITime;
  sub(d: IDuration): ITime;
  duration(t: ITime): IDuration;
}

const Millisecond: IDuration = 1;
const Second: IDuration = Millisecond * 1000;
const Minute: IDuration = Second * 60;
const Hour: IDuration = Minute * 60;
const Day: IDuration = Hour * 24;
const Week: IDuration = Day * 7;

class Time implements ITime {
  readonly v: number;

  constructor(v: number) {
    this.v = v;
  }

  get timestamp(): number {
    return this.v;
  }

  add(d: IDuration): ITime {
    return new Time(this.v + d);
  }

  sub(d: IDuration): ITime {
    return new Time(this.v - d);
  }

  duration(t: ITime): IDuration {
    return this.v - t.timestamp;
  }
}

function time(v: number): ITime {
  return new Time(v);
}

function now(): ITime {
  return time(Date.now());
}

function later(dur: IDuration): ITime {
  return now().add(dur);
}

function former(dur: IDuration): ITime {
  return now().sub(dur);
}

export default {
  time,
  now,
  later,
  former,

  Millisecond,
  Second,
  Minute,
  Hour,
  Day,
  Week,
};
