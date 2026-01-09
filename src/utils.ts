import cx from 'clsx';

type ClassNamesRecord = Record<string, string>;

/**
 * Combines provided Mantine classNames using clsx.
 */
export function mergeClassNames<T extends ClassNamesRecord>(
  defaultClassNames: T,
  optionalClassNames?: Partial<T> | ((...args: any[]) => Partial<T>)
) {
  const mergeClasses = (optional: Partial<T> = {}): ClassNamesRecord => {
    const merged: ClassNamesRecord = {};

    // First, merge all default classNames with optional ones
    Object.entries(defaultClassNames).forEach(([classKey, className]) => {
      merged[classKey] = cx(className, optional[classKey]);
    });

    // Add any additional classes from optional that aren't in defaults
    Object.entries(optional).forEach(([classKey, className]) => {
      if (!merged[classKey] && className) {
        merged[classKey] = className;
      }
    });

    return merged;
  };

  if (typeof optionalClassNames === 'function') {
    return (...args: any[]) => mergeClasses(optionalClassNames(...args));
  }

  return mergeClasses(optionalClassNames);
}
