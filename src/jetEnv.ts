/* eslint-disable no-process-env */
/* eslint-disable @typescript-eslint/no-explicit-any */

/******************************************************************************
                                 Types
******************************************************************************/

interface IOptions {
  getValue?: (property: string, key?: string) => unknown;
  variableNameFormatter?: (name: string) => string;
  onError?: (property: string) => void;
}

type TFunction = (...args: any[]) => any;
type GetTypePredicate<T> = T extends (x: any) => x is infer U ? U : never;

type TValidatorFn<T> = (
  arg: unknown,
  cb?: ((transformedVal: T) => void),
) => arg is T;

type TReturnValue<T> = {
  [K in keyof T]: (
    T[K] extends TFunction
    ? GetTypePredicate<T[K]>
    : T[K] extends unknown[]
    ? GetTypePredicate<T[K][1]>
    : T[K] extends object 
    ? TReturnValue<T[K]>
    : never
  )
};

interface IParam {
  [key: string]: TFunction | [string, TFunction] | IParam;
};

/******************************************************************************
                              Functions
******************************************************************************/

/**
 * Default function.
 */
function jetEnv<T extends IParam>(
  arg: T,
  optionsParam?: IOptions,
  namePrepend = '',
): TReturnValue<T> {
  if (!!arg && typeof arg !== 'object') {
    throw new Error('Argument must be an object type');
  }
  const options = { ...getDefaultOptions(), ...optionsParam };
  const retVal: Record<string, unknown> = {};
  for (const key in arg) {
    if (!isString(key)) {
      throw new Error('Each object key must be a string.');
    }
    const propArg = arg[key];
    let envVarVal: unknown,
      envVarName = namePrepend + options.variableNameFormatter(key),
      vldrFn;
    // String
    if (typeof propArg === 'function') {
      envVarVal = options.getValue(envVarName, key);
      vldrFn = propArg;
    // Array
    } else if (Array.isArray(propArg)) {
      envVarName = propArg[0];
      if (!isString(propArg[0]) || typeof propArg[1] !== 'function') {
        throw new Error('Array must be in the format [string, function]');
      }
      envVarVal = options.getValue(envVarName, key);
      vldrFn = propArg[1];
    // Nested object
    } else if (typeof propArg === 'object') {
      envVarVal = jetEnv(propArg, options, envVarName + '_');
    // Throw err
    } else {
      throw new Error('Each property must be a string or an array.');
    }
    // Validate the value
    if (!!vldrFn && !vldrFn(envVarVal, (tval: unknown) => envVarVal = tval)) {
      options.onError(envVarName);
    }
    // Append to retval
    retVal[key] = envVarVal;
  }
  // Return
  return retVal as TReturnValue<T>;
}

/**
 * Transform a value before checking it.
 */
export function transform<T>(
  transFn: TFunction,
  vldt: ((arg: unknown) => arg is T),
): TValidatorFn<T> {
  return (arg: unknown, cb?: (arg: T) => void): arg is T => {
    if (arg !== undefined) {
      arg = transFn(arg);
    }
    cb?.(arg as T);
    return vldt(arg);
  };
}

/**
 * Get the default options.
 */
function getDefaultOptions(): Required<IOptions> {
  return {
    getValue: (property: string) => process.env[property],
    variableNameFormatter: toSnakeCase,
    onError: onError,
  };
}

/**
 * Any expression before an UpperCase letter
 */
function toSnakeCase(str: string): string {
  return str.split(/\.?(?=[A-Z])/).join('_').toUpperCase();
}

/**
 * Default Error behavior
 */
function onError(envVarName: string): void {
  throw new Error(`The environment variable "${envVarName}" was missing ` + 
    'or invalid.');
}

/**
 * Check non-empty string
 */
function isString(arg: unknown): arg is string {
  return (typeof arg === 'string' && arg !== '');
}

/**
 * Convert some string types to bool
 */
function toBoolean(arg: unknown): unknown {
  if (typeof arg === 'string') {
    arg = arg.toLowerCase();
    if (arg === 'true') {
      return true;
    } else if (arg === 'false') {
      return false;
    } else if (arg === '0') {
      return false;
    } else if (arg === '1') {
      return true;
    } else if (arg === 'yes') {
      return true;
    } else if (arg === 'no') {
      return false;
    }
  }
  return arg;
}

/**
 * Is boolean
 */
function isBoolean(arg: unknown): arg is boolean {
  return (typeof arg === 'boolean');
}

/**
 * Is number.
 */
function isNumber(arg: unknown): arg is number {
  return (typeof arg === 'number' && !isNaN(arg));
}

/**
 * Convert unknown to date object.
 */
function toDate(arg: unknown): unknown {
  if (num(Number(arg))) {
    arg = Number(arg);
  }
  if (isString(arg) || isNumber(arg) || isDate(arg)) {
    return new Date(arg as Date);
  }
  return arg;
}

/**
 * Check if instance of valid Date.
 */
function isDate(arg: unknown): arg is Date {
  return (arg instanceof Date && !isNaN(arg.getTime()));
}

/******************************************************************************
                              Export
******************************************************************************/

export const str = transform(String, isString);
export const bool = transform(toBoolean, isBoolean);
export const num = transform(Number, isNumber);
export const date = transform(toDate, isDate);
export default jetEnv;
