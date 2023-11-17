import { AsyncResult } from "../utils";
import { DbClient, QueryResult, QueryOneResult, DbErrors } from "./db-client";




type TopProfitCountriesParams = {
    db: DbClient
    from_date: string;
    to_date: string | null;
}
export async function topProfitCountries({ db, from_date, to_date}: TopProfitCountriesParams ): QueryResult {
    return db.query(`
        SELECT 
            $1::DATE as from_date,
            COALESCE($2, NOW())::DATE as to_date,
            co.code,
            co.name,
            SUM(cpv.profit) as profit
        FROM exchanges.country_profits_view as cpv
        INNER JOIN exchanges.countries as co ON co.code = cpv.country_code
        WHERE day BETWEEN $1::DATE AND COALESCE($2, NOW())::DATE
        GROUP BY code, name
    `, from_date, to_date 
    )
}


type TopExchangersArgs = {
    db: DbClient
    from_date: string;
    to_date: string | null;
    country_codes: string[];
    topN: number;
}

type TopExchangersResult = Record<string, { office_id: number; name: string; profit: number; }[]>

export async function topExchangersByCountry(
    {db, from_date, to_date, country_codes, topN}: TopExchangersArgs
): AsyncResult<TopExchangersResult, DbErrors> {

    // Query to get topN exchange offices by country code
    return db.query(`
        WITH exchanger_profits AS (        
            SELECT exo.country_code, exo.id, exo.name, SUM(pv.profit) as profit
            FROM exchanges.exchange_offices as exo
            INNER JOIN exchanges.profits_view as pv ON pv.office_id = exo.id
            WHERE pv.datetime BETWEEN $2::TIMESTAMP AND COALESCE($3, NOW())::TIMESTAMP        
            AND exo.country_code = ANY($1::TEXT[])  
            GROUP BY exo.country_code, exo.id, exo.name
        ),
        sorted_exchanger_profits AS (
            SELECT 
                expofits.*,
                row_number() OVER (PARTITION BY expofits.country_code ORDER BY expofits.profit DESC) as exchanger_rank
            FROM exchanger_profits as expofits  
       )
        SELECT sep.country_code,
               sep.id as office_id,
               sep.name,
               sep.profit
        FROM sorted_exchanger_profits as sep
        WHERE exchanger_rank <= $4
    `, country_codes, from_date, to_date, topN)
    .then( queryResult => queryResult.map( rows => {
        return rows.reduce((acc:TopExchangersResult, row: any) => {
            const { country_code, ...ex} = row;
            acc[country_code] = acc[country_code] || [];
            acc[country_code].push(ex);
            return acc;
        }, {})
    }))
}


export async function exchangeOfficeById(db: DbClient, id: number): QueryOneResult {

    return db.one(`
        SELECT id, name, country_code
        FROM exchanges.exchange_offices
        WHERE id = $1
    `, id);
}
