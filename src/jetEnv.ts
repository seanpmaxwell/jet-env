
// **** Types **** //

type TFunc = (...args: any[]) => any;
type GetTypePredicate<T> = T extends (x: any) => x is infer U ? U : never;

type TValidatorFn<T> = (
  arg: unknown,
  cb?: ((transformedVal: T) => void),
) => arg is T;

type RetVal<T> = {
  [K in keyof T]: (
    T[K] extends string
    ? string
    : T[K] extends unknown[]
    ? GetTypePredicate<T[K][1]>
    : T[K] extends object 
    ? RetVal<T[K]>
    : never
  )
};


// **** Functions **** //

// Default validators
export const isStr = transform(String, _isStr);
export const isBool = transform(_toBool, _isBool);
export const isNum = transform(Number, _isNum);
export const isDate = transform(_toDate, _isDate);

/**
 * Main
 */
function jetEnv<T>(arg: T): RetVal<T> {
  if (typeof arg !== 'object') {
    throw new Error('Argument must be an object type');
  }
  let retVal: Record<string, unknown> = {}
  for (const key in arg) {
    if (!_isStr(key)) {
      throw new Error('Each object key must be a string.')
    }
    const propArg = arg[key];
    let envVarVal: unknown,
      vldrFn;
    // String
    if (_isStr(propArg)) {
      envVarVal = process.env[propArg];
      vldrFn = isStr;
    // Array
    } else if (Array.isArray(propArg)) {
      const envVarName = propArg[0];
      if (!_isStr(propArg[0]) || typeof propArg[1] !== 'function') {
        throw new Error('Array must be in the format [string, function]');
      }
      envVarVal = process.env[envVarName];
      vldrFn = propArg[1];
    // Nested object
    } else if (typeof propArg === 'object') {
      envVarVal = jetEnv(propArg);
    // Throw err
    } else {
      throw new Error('Each property must be a string or an array.');
    }
    // Validate the value
    if (!!vldrFn && !vldrFn(envVarVal, (transVal: unknown) => envVarVal = transVal)) {
      throw new Error(`The environment variable "${key}" was missing or invalid.`);
    }
    // Append to retval
    retVal[key] = envVarVal;
  }
  // Return
  return retVal as RetVal<T>;
}

/**
 * Transform a value before checking it.
 */
export function transform<T>(
  transFn: TFunc,
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


// **** Helpers **** //

function _isStr(arg: unknown): arg is string {
  return typeof arg === 'string' && arg !== '';
}

function _toBool(arg: unknown): boolean {
  if (typeof arg === 'string') {
    const argF = arg.toLowerCase();
    if (argF === 'true') {
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
  return Boolean(arg);
}

function _isBool(arg: unknown): arg is boolean {
  return typeof arg === 'boolean';
}

function _isNum(arg: unknown): arg is number {
  return typeof arg === 'number' && !isNaN(arg);
}

function _toDate(arg: unknown): Date {
  if (isNum(Number(arg))) {
    arg = Number(arg);
  }
  return new Date(arg as any);
}

function _isDate(arg: unknown): arg is Date {
  return arg instanceof Date && !isNaN(arg.getTime());
}


// **** Export default **** //

export default jetEnv;
