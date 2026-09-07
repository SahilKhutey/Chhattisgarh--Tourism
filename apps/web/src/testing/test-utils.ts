/**
 * Test utilities for mocking API responses and global fetch.
 */

const originalFetch = global.fetch;

export function mockFetch(
  response: unknown,
  options: { ok?: boolean; status?: number } = {},
) {
  const { ok = true, status = 200 } = options;
  const mock = jest.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(response),
      text: () =>
        Promise.resolve(
          typeof response === "string" ? response : JSON.stringify(response),
        ),
    }),
  );
  global.fetch = mock as unknown as typeof fetch;
  return mock;
}

export function restoreFetch() {
  global.fetch = originalFetch;
}
