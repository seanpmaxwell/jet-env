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

// Run jetEnv
const Env = jetEnv({
  NodeEnv: str,
  IsLocal: bool,
  DryRunEnabled: bool,
  Port: num,
  BackEndUrl: str,
  FrontEndUrl: str,
  BypassDbConn: ['BYPASS_DB_CONN', transform(JSON.parse, (arg) => arg === true)],
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
});

console.log(Env);
console.log(Env.IsLocal);
console.log(Env.DryRunEnabled);
console.log(Env.Port);
console.log(Env.S3BucketExp)
console.log(Env.Aws.S3Credentials.AccessKeyId)
