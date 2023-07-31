type PromiseResolve<T> = (value: T | PromiseLike<T>) => void;

export function createQueue<T extends (...args: any) => any>(
  reducer: T,
): (
  ...args: Parameters<T>
) => ReturnType<Awaited<T>> {
  const queue: { args: Parameters<T>; resolve: PromiseResolve<any> }[] = [];
  let isHandling = false;

  function callReducer(args: Parameters<T>, resolve: PromiseResolve<any>) {
    isHandling = true;
    const result = reducer(...args);

    resolve(result);
    if (result instanceof Promise) {
      // eslint-disable-next-line promise/catch-or-return
      result.finally(() => {
        isHandling = false;

        const data = queue.shift();

        if (data) {
          callReducer(data.args, data.resolve);
        }
      });
    } else {
      isHandling = false;

      const data = queue.shift();

      if (data) {
        callReducer(data.args, data.resolve);
      }
    }
  }

  return (...args) => {
    return new Promise<any>((resolve) => {
      if (isHandling) {
        queue.push({ args, resolve });
      } else {
        callReducer(args, resolve);
      }
    }) as any;
  };
}
