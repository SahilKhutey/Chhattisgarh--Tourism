import '@testing-library/jest-dom';

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (val: unknown) => JSON.parse(JSON.stringify(val));
}

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;
