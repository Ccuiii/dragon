export type Request<T> = (...args: any[]) => Promise<T>;

export type FetchConfig<T> = {
  enhanceResponse?: (data: T) => any;
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
  pollingInterval?: number;
};

export type FetchResult<T> = {
  loading: boolean;
  data: T | undefined;
  setData: (data: any) => void;
  error: Error | undefined;
  params: any;
  run: (...args: any[]) => Promise<T | Error>;
  cancel: (...args: any[]) => void;
};

export type Options<T> = {
  manual?: boolean; // 自动执行
  enhanceResponse?: (data: T) => any;
  onSuccess?: (data: T) => void;
  onError?: (data: T) => void;
  pollingInterval?: number;
};
