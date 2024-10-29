import path from 'path';
import dotenv from 'dotenv';
import jetEnv, { bool, date, num, str, transform } from '../src';


// Configure Dotenv
const result = dotenv.config({
  path: path.join(__dirname, '.env'),
});  
if (!!result?.error) {
  throw result.error;
}

// Run jetEnv with default options
const Env = jetEnv({
  NodeEnv: str,
  IsLocal: bool,
  DryRunEnabled: bool,
  Port: num,
  BackEndUrl: str,
  FrontEndUrl: str,
  BypassDbConn: transform(JSON.parse, (arg) => arg === true),
  S3BucketName: ['S3_BUCKET_NAME', str],
  S3BucketUrl: str,
  S3BucketExp: date,
  // BadVal: 'SOME_BAD_VAL',
  Aws: {
    S3Credentials: {
      AccessKeyId: str,
      SecretAccessKey: str,
    },
  },
  Oauth: bool,
});

console.log(Env);
console.log(Env.IsLocal);
console.log(Env.DryRunEnabled);
console.log(Env.Port);
console.log(Env.S3BucketExp)
console.log(Env.Aws.S3Credentials.AccessKeyId)



// Run jetEnv with "custom" options
const Env2 = jetEnv({
  NodeEnv: str,
  IsLocal: bool,
  Dog: str,
}, {
  getValue: (property: string) => (Env as any)[property], 
  variableNameFormatter: (name: string) => name,
  onError: (property: string) => console.error(`Variable "${property}" was missing or invalid.`),
});

console.log(Env2)
