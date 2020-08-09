export type Nullable<T> = T | null;

export type Undefinable<T> = T | undefined;

export type UndefinableNullable<T> = Undefinable<Nullable<T>>;
