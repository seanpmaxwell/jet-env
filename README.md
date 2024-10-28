# Simple, TypeScript first, zero-dependency environment variable validation/initialization tool.


## Why jet-env
- Small, quick, convenient zero-dependency. 
- You can learn this tool in 5 minutes.
- Let's you setup a completely type-safe object to hold all your environment variables.
- Includes 4 build-in validator-functions: (`isBool`, `isNum`, `isDate` and `isStr`)
- `transform()` wrapper for validator-functions includes if a value needs to be modified first.
- Easier to learn and smaller han `envalid`:


## Overview
This library does not load environment variables, but it provides a single function that will loop through an object and assignment an environment variable to each one. If the environment variable is `undefined` or the incorrect type, then an error will be thrown. <br/>

You can validate your types by passing a 2 length array or a string. For the array, the first index must be the environment-variable name and the second a validator-function. The type assigned will be to whatever the type-predicate of your validator-function is. You can also just pass a string instead of an array and `string` will automatically be assumed as the type that needs to be validated.<br/>

If you want your environment variable transformed before validation, there is a helper function export that your can wrap your validator function with. There are also 4 default validator-functions (`isBool`, `isNum`, `isDate` and `isStr`) that come packaged by default (no point in really using `isStr` though cause you can just pass a string instead of an array).<br/>

Notes on validators: 
- An empty string will not satisfy the `isStr` function.
- `isDate` will convert any valid date value (`string` or `number`) to a `Date` object and make sure it's valid.
- For boolean types, there are several different variations which will satisfy the built-in `isBool` function:
  - `false/true`, case doesn't matter 
  - `0`: `false`
  - `1`: `true`
  - `no`: `false` case doesn't matter
  - `yes`: `true` case doesn't matter


## Quick Glance
```typescript
import jetEnv, { isBool, isDate, isNum, transform } from '../src/jetEnv';

const Env = jetEnv({
  NodeEnv: 'NODE_ENV',
  IsLocal: ['IS_LOCAL', isBool],
  Port: ['PORT', isNum],
  BackEndUrl: 'BACK_END_URL',
  FrontEndUrl: 'FRONT_END_URL',
  BypassDbConn: ['BYPASS_DB_CONN', transform(JSON.parse, isBool)],
  S3BucketName: 'S3_BUCKET_NAME',
  S3BucketUrl: 'S3_BUCKET_URL',
  S3BucketExp: ['S3_BUCKET_EXP', isDate],
  AWS: {
    Credentials: {
      AccessKeyId: 'S3_CREDENTIALS_ACCESS_KEY_ID',
      SecretAccessKey: 'S3_CREDENTIALS_SECRET_ACCESS_KEY',
    },
  },
});
```


## That's It! 

Happy Coding :)
