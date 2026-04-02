import 'jest';

// Global test setup
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDefined(): R;
      toBeInstanceOf<T>(constructor: Function): R;
      toContain(item: any): R;
      toThrow(message?: string | RegExp): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toEqual(expected: any): R;
      toBe(expected: any): R;
      toBeNull(): R;
      toBeUndefined(): R;
      toBeFalsy(): R;
      toBeTruthy(): R;
      toMatch(pattern: string | RegExp): R;
      toHaveLength(length: number): R;
    }
  }
}

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
