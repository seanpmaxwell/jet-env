import path from 'path';
import dotenv from 'dotenv';
import jetEnv, { isBool, isDate, isNum, isStr, transform } from '../src/jetEnv';


// Configure Dotenv
const result = dotenv.config({
  path: path.join(__dirname, './config/.env'),
});  
if (!!result?.error) {
  throw result.error;
}


const Env = jetEnv({
  NodeEnv: 'NODE_ENV',
  IsLocal: ['IS_LOCAL', isBool],
  Port: ['PORT', isNum],
  BackEndUrl: 'BACK_END_URL',
  FrontEndUrl: 'FRONT_END_URL',
  BypassDbConn: ['BYPASS_DB_CONN', transform(JSON.parse, isBool)],
  S3BucketName: ['S3_BUCKET_NAME', isStr],
  S3BucketUrl: 'S3_BUCKET_URL',
  S3BucketExp: ['S3_BUCKET_EXP', isDate],
  AWS: {
    Credentials: {
      AccessKeyId: 'S3_CREDENTIALS_ACCESS_KEY_ID',
      SecretAccessKey: 'S3_CREDENTIALS_SECRET_ACCESS_KEY',
    },
    S3: {
      Bucket: {
        Name: 'S3_BUCKET_NAME',
        Url: 'S3_BUCKET_URL',
      },
    },
  },
});

console.log(Env);
console.log(Env.IsLocal);
console.log(Env.Port);
console.log(Env.S3BucketExp)
console.log(Env.AWS.Credentials.AccessKeyId)
