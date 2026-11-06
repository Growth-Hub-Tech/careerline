import { callbackUrl, rememberReturn, safeReturnPath, takeReturn } from './checkoutReturn';

describe('checkout return', () => {
  it('remembers where to come back to, once', () => {
    rememberReturn('/tests/202');

    expect(takeReturn()).toBe('/tests/202');
    expect(takeReturn()).toBeNull();
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
