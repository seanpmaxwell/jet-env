import { describe, expect, test, vi } from 'vitest';

import jetEnv, { bool, num, str, transform } from '../src';


describe('jetEnv schema validation', () => {
  test('throws when schema is not an object', () => {
    expect(() => jetEnv('not-an-object' as never)).toThrow('Argument must be an object type');
    expect(() => jetEnv(42 as never)).toThrow('Argument must be an object type');
  });

  test('throws for invalid property definitions', () => {
    expect(() => jetEnv({ Invalid: 'oops' as never }))
      .toThrow('Each property must be a string or an array.');
    expect(() => jetEnv({ BadTuple: [123 as never, str] as never }))
      .toThrow('Array must be in the format [string, function]');
  });
});


describe('jetEnv behavior', () => {
  test('formats nested keys when retrieving values', () => {
    const values = {
      AWS_ACCESS_KEY_ID: 'key',
      AWS_DB_URL: 'db-url',
    } as Record<string, string>;
    const calls: Array<[string, string | undefined]> = [];

    const Env = jetEnv({
      Aws: {
        AccessKeyId: str,
        Db: {
          Url: str,
        },
      },
    }, {
      getValue: (property, key) => {
        calls.push([property, key]);
        return values[property];
      },
    });

    expect(Env.Aws.AccessKeyId).toBe('key');
    expect(Env.Aws.Db.Url).toBe('db-url');
    expect(calls).toStrictEqual([
      ['AWS_ACCESS_KEY_ID', 'AccessKeyId'],
      ['AWS_DB_URL', 'Url'],
    ]);
  });

  test('allows overriding env var names via tuple definitions', () => {
    const values = {
      CUSTOM_PORT: '3000',
      CUSTOM_HOST: 'example.com',
    } as Record<string, string>;

    const Env = jetEnv({
      CustomPort: ['CUSTOM_PORT', num],
      CustomHost: ['CUSTOM_HOST', str],
    }, {
      getValue: (property) => values[property],
    });

    expect(Env.CustomPort).toBe(3000);
    expect(Env.CustomHost).toBe('example.com');
  });

  test('custom onError collects validation failures without throwing', () => {
    const errors: string[] = [];

    const Env = jetEnv({
      ShouldFail: num,
      ShouldPass: num,
    }, {
      getValue: (property) => {
        if (property === 'SHOULD_FAIL') {
          return 'not-a-number';
        }
        return '42';
      },
      onError: (property) => errors.push(property),
    });

    expect(errors).toStrictEqual(['SHOULD_FAIL']);
    expect(Number.isNaN(Env.ShouldFail)).toBe(true);
    expect(Env.ShouldPass).toBe(42);
  });

  test('passes formatted names and keys into getValue', () => {
    const spy = vi.fn((property: string, _?: string) => {
      const mockValues = {
        SAMPLE_VAR: 'value',
      } as Record<string, string>;
      return mockValues[property];
    });

    const Env = jetEnv({ SampleVar: str }, { getValue: spy });

    expect(Env.SampleVar).toBe('value');
    expect(spy).toHaveBeenCalledWith('SAMPLE_VAR', 'SampleVar');
  });
});


describe('validator helpers', () => {
  test.each([
    ['true', true],
    ['FALSE', false],
    ['1', true],
    ['0', false],
    ['yes', true],
    ['No', false],
  ])('bool validator normalizes "%s"', (value, expected) => {
    const Env = jetEnv({ Flag: bool }, {
      getValue: () => value,
    });

    expect(Env.Flag).toBe(expected);
  });

  test('transform helper parses JSON payloads before validation', () => {
    type FeatureConfig = { enabled: boolean };
    const isFeatureConfig = (value: unknown): value is FeatureConfig => (
      typeof value === 'object'
      && value !== null
      && typeof (value as FeatureConfig).enabled === 'boolean'
    );
    const jsonValidator = transform(JSON.parse, isFeatureConfig);

    const Env = jetEnv({
      Feature: jsonValidator,
    }, {
      getValue: () => '{"enabled":true}',
    });

    expect(Env.Feature.enabled).toBe(true);
  });
});
