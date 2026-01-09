# jet-env ✈️

<p align="center">
  <a href="https://www.npmjs.com/package/jet-paths">
    <img src="https://img.shields.io/npm/v/jet-paths?color=0f9d58&logo=npm&label=npm%20version" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/jet-paths">
    <img src="https://img.shields.io/npm/dm/jet-paths?color=2962ff&label=downloads" alt="npm downloads" />
  </a>
  <a href="https://bundlephobia.com/package/jet-paths">
    <img src="https://img.shields.io/bundlephobia/minzip/jet-paths?color=512da8&label=minzipped" alt="bundle size" />
  </a>
  <a href="https://github.com/seanpmaxwell/jet-env/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/seanpmaxwell/jet-env?color=ffb300" alt="license" />
  </a>
</p>

> TypeScript-first, zero-dependency environment variable validation designed for teams that want one reliable entry point for runtime configuration. Published on npm as [`jet-paths`](https://www.npmjs.com/package/jet-paths).
<br/>


## Table of Contents 
1. [Features](#features)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Validators at a Glance](#validators-at-a-glance)
5. [Customizing Behavior](#customizing-behavior)
6. [Error Messaging Tips](#error-messaging-tips)

<br/><b>***</b><br/>

## Features 
- Automatic conversion from `PascalCase` keys to `UPPER_SNAKE_CASE` environment variable names, including deeply nested structures.
- Tiny footprint (no dependencies) with first-class TypeScript types so your `Env` object stays type-safe everywhere.
- Built-in validators (`bool`, `num`, `date`, `str`) plus a `transform` wrapper for pre-processing values before validation.
- Works in Node.js or the browser (if you can access your environment variables with `process.env[]`) and let `jet-env` enforce shape and type.
- Friendly API that you can learn in minutes, yet customizable through options for fetching values, formatting names, and error handling.

<br/><b>***</b><br/>

## Installation

```bash
npm install jet-paths
# or
yarn add jet-paths
# or
pnpm add jet-paths
```

<br/><b>***</b><br/>

## Quick Start
`jetEnv` walks an object definition, maps each key to an environment variable, and validates the runtime value.

```typescript
import jetEnv, { bool, date, num, str, transform } from 'jet-env';

const Env = jetEnv({
  NodeEnv: str, // NODE_ENV
  IsLocal: bool, // IS_LOCAL
  Port: num, // PORT
  BackEndUrl: str, // BACK_END_URL
  FrontEndUrl: str, // FRONT_ENV_URL
  BypassDbConn: transform(JSON.parse, (value) => value === true),
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

console.log(`Running ${Env.NodeEnv} at port ${Env.Port}`);
```

`jetEnv` does not load `.env` files. Use tools like `dotenv`, your platform secrets manager, or CI/CD variables, then let `jetEnv` validate and expose the shape you expect.

<br/><b>***</b><br/>

## Validators at a Glance
| Validator | Description | Notes |
| --- | --- | --- |
| `str` | Ensures a non-empty string. | Empty values fail validation. |
| `num` | Parses and validates numeric input. | Throws if `Number(value)` is `NaN`. |
| `bool` | Accepts `true/false`, `1/0`, `yes/no`. | Case-insensitive for string inputs. |
| `date` | Converts to `Date` instance. | Rejects invalid dates. |
| `transform(fn, validator)` | Pre-processes before validating. | Perfect for JSON parsing or casting lists. |

<br/><b>***</b><br/>

## Customizing Behavior
Pass an optional `options` object as the second argument to `jetEnv` to override the core behavior. Every property is optional, so you can extend only what you need.

```typescript
const Env = jetEnv(schema, {
  getValue: (name) => process.env[name],
  variableNameFormatter: (name) => name.replace(/[A-Z]/g, '_$&').toUpperCase(),
  onError: (property) => {
    throw new Error(`Missing or invalid env var for ${property}`);
  },
});
```

- **getValue:** Fetch the value, default is `(propertyName: string)=> process.env[property]`
- **variableNameFormatter:** Set your own custom function for formatting environment-variable names from object keys.
- **onError:** Swap the default error handling for your own logic.

<br/><b>***</b><br/>

## Error Messaging Tips
- Mention the full path (e.g., `Aws.S3Credentials.AccessKeyId`) in your custom `onError` implementation so missing variables are obvious in logs.
- Co-locate your schema definition with your application's bootstrap so failures happen before the app starts serving traffic.

---

Happy coding! If you build something cool or find a rough edge, please open an issue or PR so the community can benefit too.
