/* eslint-disable no-console */
/* eslint-disable max-len */
import { join, resolve } from 'path';
import dotenv from 'dotenv';
import { expect, test } from 'vitest';

import jetEnv, { bool, date, num, str, transform } from '../src';


// **** Run unit-tests **** //

/**
 * Test default options.
 */
test('jetEnv with default options', () => {
  // Configure dotenv
  dotenv.config({
    path: join(resolve(), '/test', '.env'),
  });
  
  const Env = jetEnv({
    Stage: str,
    IsLocal: bool,
    DryRunEnabled: bool,
    Port: num,
    BackEndUrl: str,
    FrontEndUrl: str,
    BypassDbConn: transform(JSON.parse, (arg) => arg === true),
    S3BucketName: ['S3_BUCKET_NAME', str],
    S3BucketUrl: str,
    S3BucketExp: date,
    Aws: {
      S3Credentials: {
        AccessKeyId: str,
        SecretAccessKey: str,
      },
    },
    Oauth: bool,
  });
  
  const expectedResult = {
    Stage: 'development',
    IsLocal: false,
    DryRunEnabled: false,
    Port: 1,
    BackEndUrl: 'localhost:3000',
    FrontEndUrl: 'localhost:3001',
    BypassDbConn: true,
    S3BucketName: 'my-dev-bucket',
    S3BucketUrl: 'aws.s3.mybucket.com',
    S3BucketExp: new Date('2024-10-28T04:14:56.587Z'),
    Aws: {
      S3Credentials: {
        AccessKeyId: 'asdfasdfasdfasdf',
        SecretAccessKey: 'asdfasdfasdfasdf',
      },
    },
    Oauth: true,
  };
  
  expect(Env).toStrictEqual(expectedResult);
});

/**
 * Test custom options.
 */
test('jetEnv with custom options', () => {
  const customEnv = {
    STAGE: 'development',
    IS_LOCAL: 'false',
  } as Record<string, string>;
  
  const Env = jetEnv({
    STAGE: str,
    IS_LOCAL: bool,
    SUBNET_ID: str,
  }, {
    getValue: (property: string) => (customEnv)[property], // get value from customEnv object instead of env file
    variableNameFormatter: (name: string) => name, // don't format var names
    onError: (property: string) => console.error(`Variable "${property}" was missing or invalid.`), // log validation errors instead of throwing
  });
  
  const expectedResult = {
    STAGE: 'development',
    IS_LOCAL: false,
    SUBNET_ID: undefined,
  };
  
  expect(Env).toStrictEqual(expectedResult);
});
