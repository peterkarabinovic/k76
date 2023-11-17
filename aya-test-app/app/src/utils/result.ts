export type Result<T, E> = Ok<T> | Err<E>;

type Ok<A> = {
    readonly success: true;
    readonly data: A;
    map<B>(fn: (a: A) => B): Ok<B>;
};

type Err<E> = {
    readonly success: false;
    readonly error: E;
    map<B>(fn: (a: never) => B): Err<E>;
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Result {
    export function ok<T>(data: T): Ok<T> {
        return { 
            success: true, 
            data,
            map: (fn) => ok(fn(data))
        };
    }

    export function err<E>(error: E): Err<E> {
        const self: Err<E> = {
            success: false, 
            error,
            map: () => self
        };
        return self;
    }

    export function tryCatch<T = never, E = never>(fn: () => T, handler: (err: any) => E): Result<T, E> {
        try {
            return ok(fn());
        } catch (e) {
            return err(handler(e));
        }
    }
}

export type AsyncResult<T, E> = Promise<Result<T, E>>;
