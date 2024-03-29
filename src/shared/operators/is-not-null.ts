export const isNonNull = <T>(value: T): value is NonNullable<T> => {
  return value != null;
}