/** Shape returned by every source adapter and every /api route. */
export type Ok<T> = { ok: true; data: T; fetchedAt: string };
export type Fail = { ok: false; error: string; lastGoodAt?: string };
export type Result<T> = Ok<T> | Fail;

export const ok = <T>(data: T): Ok<T> => ({
  ok: true,
  data,
  fetchedAt: new Date().toISOString(),
});

export const fail = (error: string, lastGoodAt?: string): Fail => ({
  ok: false,
  error,
  lastGoodAt,
});
