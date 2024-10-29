// **** Types **** //

interface IOptions {
  getValue?: (property: string, key?: string) => unknown; // Default is process.env
  variableNameFormatter?: (name: string) => string;
  onError?: (property: string) => void;
}

type TFunc = (...args: any[]) => any;
type GetTypePredicate<T> = T extends (x: any) => x is infer U ? U : never;

type TValidatorFn<T> = (
  arg: unknown,
  cb?: ((transformedVal: T) => void),
) => arg is T;

type RetVal<T> = {
  [K in keyof T]: (
    T[K] extends TFunc
    ? GetTypePredicate<T[K]>
    : T[K] extends unknown[]
    ? GetTypePredicate<T[K][1]>
    : T[K] extends object 
    ? RetVal<T[K]>
    : never
  )
};

type TArg = {
  [key: string]: TFunc | [string, TFunc] | TArg;
};


// **** Functions **** //

// Default validators
export const str = transform(String, _isStr);
export const bool = transform(_toBool, _isBool);
export const num = transform(Number, _isNum);
export const date = transform(_toDate, _isDate);

/**
 * Main
 */
function jetEnv<T extends TArg>(arg: T, optionsParam?: IOptions, namePrepend = ''): RetVal<T> {
  if (!!arg && typeof arg !== 'object') {
    throw new Error('Argument must be an object type');
  }
  const options = { ..._getDefaultOptions(), ...optionsParam };
  let retVal: Record<string, unknown> = {}
  for (const key in arg) {
    if (!_isStr(key)) {
      throw new Error('Each object key must be a string.')
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
      if (!_isStr(propArg[0]) || typeof propArg[1] !== 'function') {
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
    if (!!vldrFn && !vldrFn(envVarVal, (transVal: unknown) => envVarVal = transVal)) {
      options.onError(envVarName);
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

function _getDefaultOptions(): Required<IOptions> {
  return {
    getValue: (property: string) => process.env[property],
    variableNameFormatter: _toSnakeCase,
    onError: _onError,
  }
}

function _isStr(arg: unknown): arg is string {
  return typeof arg === 'string' && arg !== '';
}

function _toBool(arg: unknown): boolean | unknown {
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

function _isBool(arg: unknown): arg is boolean {
  return typeof arg === 'boolean';
}

function _isNum(arg: unknown): arg is number {
  return typeof arg === 'number' && !isNaN(arg);
}

function _toDate(arg: unknown): Date {
  if (num(Number(arg))) {
    arg = Number(arg);
  }
  return new Date(arg as any);
}

function _isDate(arg: unknown): arg is Date {
  return arg instanceof Date && !isNaN(arg.getTime());
}

/**
 * Any expression before an UpperCase letter
 */
function _toSnakeCase(str: string): string {
  return str.split(/\.?(?=[A-Z])/).join('_').toUpperCase();
}

function _onError(envVarName: string): void {
  throw new Error(`The environment variable "${envVarName}" was missing or invalid.`);
}


// **** Export default **** //

export default jetEnv;
