import * as path from 'node:path';
import { Pool } from "pg"
import { Result, AsyncResult } from "../utils/result"
import { Config } from "../config"

// **********************************************************
// Types
// **********************************************************
export type DbClient = ReturnType<typeof createDbClient>;
export type QueryResult = ReturnType<DbClient["query"]>
export type QueryOneResult = ReturnType<DbClient["one"]>

type UpsertBatchQuery = {
    table: string;
    columns: string[];
    uniqueColumns: string[];
    items: Record<string, any>[];
};

// **********************************************************
// Database errors
// **********************************************************
export class NotFoundError { readonly _tag = "not-found" }
export class ConnectionError { readonly _tag = "connection-error"; constructor(readonly err: string) { } }
export class ConstraintViolationError { readonly _tag = "constraint-violation"; constructor(readonly err: string) { } }
export class DataIntegrityError { readonly _tag = "data-integrity"; constructor(readonly err: string) { } }
export class QuerySyntaxError { readonly _tag = "sysntax-error"; constructor(readonly err: string) { } };

export type DbErrors =
    | NotFoundError
    | ConnectionError
    | ConstraintViolationError
    | DataIntegrityError
    | QuerySyntaxError



export function createDbClient(
    conf: Pick<Config, "EXCHANGE_DB_HOST"|"EXCHANGE_DB_PORT"|"EXCHANGE_DB_NAME"|"EXCHANGE_DB_PASSWORD"|"EXCHANGE_DB_USER" >
) {

    const pool = new Pool({
        application_name: 'exchange-reports',
        host: conf.EXCHANGE_DB_HOST,
        port: conf.EXCHANGE_DB_PORT,
        database: conf.EXCHANGE_DB_NAME,
        user: conf.EXCHANGE_DB_USER,
        password: conf.EXCHANGE_DB_PASSWORD,
        connectionTimeoutMillis: 3000,
        idleTimeoutMillis: 5000,
        max: 10
    });

    function errorHandling(err:any): Result<never, DbErrors> {
        if( "code" in err ) {
            if(String(err.code).startsWith("23"))
                return Result.err(new ConstraintViolationError(err.message));
            if(String(err.code).startsWith("42"))
                return Result.err(new QuerySyntaxError(err.message));
        }
        return Result.err(new ConnectionError(err.message));
    }

    

    return {
        
        query: async  (text: string, ...params: any[]): AsyncResult<unknown[], DbErrors> => {
            return pool.query(text, params)
                .then(res => Result.ok(res.rows))
                .catch(errorHandling)
        },
            
        one: async ( sql: string, ...params: any[] ): AsyncResult<unknown, DbErrors> => {

            return pool.query(sql, params).then(res => {

                if (res.rowCount === 0) {
                    return Result.err(new NotFoundError());
                }
                if(res.rowCount > 1) {
                    return Result.err(new DataIntegrityError("Expected one row, got more"));
                }
                return Result.ok(res.rows[0]);
            })
            .catch(errorHandling);
        },

    
        close: () => pool.end(),

        migrate: async () => {
            
            const {default: Postgrator} = (await import('postgrator'));
            const postgrator = new Postgrator({
                migrationPattern: path.join(__dirname, './schema/*.sql'),
                driver: 'pg',
                database: conf.EXCHANGE_DB_NAME,
                schemaTable: `exchanges._migrations`,
                execQuery: (query:string) => pool.query(query),
                newline: 'LF'
            }); 

            return postgrator.migrate();       

        }
    }
}

function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



// const db = createDbClient({
//     EXCHANGE_DB_HOST: "localhost",
//     EXCHANGE_DB_PORT: 5432,
//     EXCHANGE_DB_NAME: "test",
//     EXCHANGE_DB_USER: "root",
//     EXCHANGE_DB_PASSWORD: "1234"
// })



