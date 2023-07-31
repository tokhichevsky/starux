import { createQueue } from './queue';

const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

describe('queue tests', () => {
  test('race', async () => {
    const func = async (time: number, result: string) => {
      await delay(time);
      return result;
    };

    const queueFunc = createQueue(func);

    const raceResult = await Promise.race([ queueFunc(100, 'done1'), queueFunc(30, 'done2') ]);
    expect(raceResult).toBe('done1');
  });

  test('all', async () => {
    const func = async (time: number, result: string) => {
      await delay(time);
      return result;
    };

    const queueFunc = createQueue(func);

    const allResult = await Promise.all([ queueFunc(100, 'done1'), queueFunc(30, 'done2') ]);
    expect(allResult).toEqual(['done1', 'done2']);
  });

  test('call times', async () => {
    const func = jest.fn(async (time: number, result: string) => {
      await delay(time);
      return result;
    });

    const queueFunc = createQueue(func);

    await Promise.all([ queueFunc(100, 'done1'), queueFunc(30, 'done2') ]);
    expect(func).toBeCalledTimes(2);

    await Promise.race([ queueFunc(100, 'done1'), queueFunc(30, 'done2') ]);
    expect(func).toBeCalledTimes(4);
  });
});
