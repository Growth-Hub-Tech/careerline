import {
  callbackUrl,
  clearReturn,
  readReturn,
  rememberReturn,
  safeReturnPath,
} from './checkoutReturn';

describe('checkout return', () => {
  it('remembers where to come back to until it is cleared', () => {
    rememberReturn('/tests/202');

    expect(readReturn()).toBe('/tests/202');
    clearReturn();
    expect(readReturn()).toBeNull();
  });

  it('never returns to an address outside the app, even if one was stored', () => {
    rememberReturn('https://evil.test');

    expect(readReturn()).toBeNull();
  });

  it('sends Paystack back to the payment check page', () => {
    expect(callbackUrl()).toBe(`${window.location.origin}/payments/callback`);
  });

  it.each([
    ['/tests/202', '/tests/202'],
    ['/credits?tab=1', '/credits?tab=1'],
    ['https://evil.test', null],
    ['//evil.test', null],
    ['tests', null],
    [null, null],
  ])('only trusts the address %s inside the app', (value, expected) => {
    expect(safeReturnPath(value)).toBe(expected);
  });
});
