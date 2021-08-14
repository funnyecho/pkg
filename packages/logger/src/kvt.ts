/* eslint-disable */
type _R<T extends readonly any[], U extends readonly any[]> = readonly [] | readonly [...U, ...T];
type IRepeatedTuple<T extends readonly any[]> = _R<
  T,
  _R<
    T,
    _R<
      T,
      _R<
        T,
        _R<
          T,
          _R<
            T,
            _R<
              T,
              _R<
                T,
                _R<
                  T,
                  _R<
                    T,
                    _R<
                      T,
                      _R<
                        T,
                        _R<
                          T,
                          _R<
                            T,
                            _R<
                              T,
                              _R<
                                T,
                                _R<
                                  T,
                                  _R<
                                    T,
                                    _R<
                                      T,
                                      _R<
                                        T,
                                        _R<
                                          T,
                                          _R<
                                            T,
                                            _R<
                                              T,
                                              _R<T, _R<T, _R<T, _R<T, _R<T, _R<T, _R<T, _R<T, _R<T, _R<T, _R<T, _R<T, _R<T, _R<T, _R<T, _R<T, _R<T, readonly []>>>>>>>>>>>>>>>>>
                                            >
                                          >
                                        >
                                      >
                                    >
                                  >
                                >
                              >
                            >
                          >
                        >
                      >
                    >
                  >
                >
              >
            >
          >
        >
      >
    >
  >
>;

export type IKeyValuePair = [string, any];
export type IKeyValueTuple = IRepeatedTuple<IKeyValuePair>;
export type IKvt = IKeyValueTuple;
