# Simple, TypeScript first, zero-dependency environment variable validation/initialization tool.


## Why jet-env
- Small, quick, convenient zero-dependency. 
- You can learn this tool in 5 minutes.
- Works client or server side.
- Automatically constructs environment-variable names from object keys.
- Sets up a completely type-safe object to hold all your environment variables.
- Includes 4 build-in validator-functions: (`bool`, `num`, `date` and `str`)
- `transform()` wrapper for validator-functions includes if a value needs to be modified first.
- Easier to learn and smaller han `envalid`.


## Overview
This library does not load environment variables, but it provides a single function that will loop through an object and assignment an environment variable to each one. If the environment variable is `undefined` or the incorrect type, then an error will be thrown. <br/>

The environment variable name will be constructed using the keys on the object. `PascalCase` names will automatically be converted to `UPPER_SNAKE_CASE`. So if your environment variable is `NODE_ENV` then the key should be `NodeEnv` on the object key. This will work for nested objects tool. The parent-object's key name will be prepended to whatever the child-properties's key is.<br/>

If you want to override the behavior for naming the environment variables, you can pass an array instead of a function. The first value in the array must be a string and will be used to pull the environment variable (no prepending is done). The second value must be a validator-function<br/>

If you want your environment variable value transformed before validation, there is a helper function export that your can wrap your validator function with. There are also 4 default validator-functions (`bool`, `num`, `date` and `str`) that come packaged by default.<br/>

Notes on validators: 
- An empty string will not satisfy the `str` function.
- `date` will convert any valid date value (`string` or `number`) to a `Date` object and make sure it's valid.
- For boolean types, there are several different variations which will satisfy the built-in `bool` function:
  - `false/true`, case doesn't matter 
  - `0`: `false`
  - `1`: `true`
  - `no`: `false` case doesn't matter
  - `yes`: `true` case doesn't matter


## Quick Glance
```typescript
import jetEnv, { bool, date, num, transform } from 'jet-env';

const Env = jetEnv({
  NodeEnv: str, // NODE_ENV
  IsLocal: bool, // IS_LOCAL
  Port: num, // PORT
  BackEndUrl: str, // BACK_END_URL
  FrontEndUrl: str, // FRONT_ENV_URL
  BypassDbConn: transform(JSON.parse, (arg) => arg === true),
  S3BucketName: ['S3_BUCKET_NAME', str],
  S3BucketUrl: str, // S3_BUCKET_URL
  S3BucketExp: date, // S3_BUCKET_EXP
  Aws: {
    S3Credentials: {
      AccessKeyId: str, // AWS_S3_CREDENTIALS_ACCESS_KEY_ID
      SecretAccessKey: str, // AWS_S3_CREDENTIALS_SECRET_ACCESS_KEY 
    },
  },
});
```


## Overriding Default Behavior
- The default behavior for formatting variable names, fetching values, and handling error messages can all be overridden by an optional `options` parameter as the second argument to `jetEnv`. Here's a overview of the `options` object:
```typescript
{
  getValue?: (property: string, key?: string) => unknown; // Fetch the value, default is "=> process.env[property]"
  variableNameFormatter?: (name: string) => string; // Set your own custom function for formatting environment-variable names from object keys.
  onError?: (property: string) => void; // Change what happens when a validator-function fails (currently throws an error)
}
```


## That's It! 

Happy Coding :)
