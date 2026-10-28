import { bearerToken, cookieToken } from './token.js';

describe('token helpers', () => {
  it('reads a Bearer header', () => {
    expect(bearerToken('Bearer abc')).toBe('abc');
    expect(bearerToken('Basic abc')).toBeUndefined();
    expect(bearerToken(undefined)).toBeUndefined();
  });

  it('reads the auth cookie from a raw Cookie header', () => {
    expect(cookieToken('theme=dark; token=abc; x=1')).toBe('abc');
    expect(cookieToken('mytoken=abc')).toBeUndefined();
    expect(cookieToken(undefined)).toBeUndefined();
  });
});
