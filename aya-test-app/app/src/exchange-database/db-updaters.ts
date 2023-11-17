import { AsyncResult, Result } from "../utils/result";
import { DbClient, DbErrors } from "./db-client";
import * as T from "../exchange-model";


export async function upsetCountries(db: DbClient, countries: T.Country[]): AsyncResult<void, DbErrors | Error> {

    return checkLimits(1000, countries, () => {

        return db.query(`
            INSERT INTO exchanges.countries (code, name)
            SELECT 
                UNNEST($1::TEXT[]),
                UNNEST($2::TEXT[])
            ON CONFLICT (code) DO UPDATE SET
                name = EXCLUDED.name
            `,
            countries.map(country => country.code),
            countries.map(country => country.name)
        )
    }
    );
}

export async function upsertExchangeOffices(db: DbClient, offices: T.ExchangeOffice[]): AsyncResult<void, DbErrors | Error> {

    return checkLimits(1000, offices, () => {

        return db.query(`
            INSERT INTO exchanges.exchange_offices (id, name, country_code)
            SELECT 
                UNNEST($1::INTEGER[]),
                UNNEST($2::TEXT[]),
                UNNEST($3::TEXT[])
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                country_code = EXCLUDED.country_code
        `,
                offices.map(office => office.id),
                offices.map(office => office.name),
                offices.map(office => office.country )
            );
        }
    );


}

export async function insertRates(db: DbClient, office_id: number, rates: T.Rate[]): AsyncResult<void, DbErrors | Error> {

    return checkLimits(1000, rates, () => {

        return db.query(`
            INSERT INTO exchanges.rates (office_id, currency_pair, in_price, out_price, reserve, datetime)
            SELECT 
                $1,
                UNNEST($2::currency_pair[]),
                UNNEST($3::NUMERIC[]),
                UNNEST($4::NUMERIC[]),
                UNNEST($5::NUMERIC[]),
                UNNEST($6::TIMESTAMP[])
            ON CONFLICT ON CONSTRAINT rates_rate_unique DO UPDATE SET
                in_price = EXCLUDED.in_price,
                out_price = EXCLUDED.out_price,
                reserve = EXCLUDED.reserve
            `,
                office_id,
                rates.map(rate => `(${rate.from},${rate.to})`),
                rates.map(rate => rate.in),
                rates.map(rate => rate.out),
                rates.map(rate => rate.reserve),
                rates.map(rate => rate.date)
            );
        }
    );

}

export async function insertExchanges(db: DbClient, office_id: number, exchanges: T.ExchangeWithChecksum[]): AsyncResult<void, DbErrors | Error> {

     return checkLimits(1000, exchanges, () => {

        return db.query(`
            INSERT INTO exchanges.exchanges (office_id, currency_pair, ask, datetime, checksum)
            SELECT
                $1,
                UNNEST($2::currency_pair[]),
                UNNEST($3::NUMERIC[]),
                UNNEST($4::TIMESTAMP[]),
                UNNEST($5::TEXT[])
            ON CONFLICT ON CONSTRAINT exchanges_checksum_unique DO NOTHING
            `,  
                office_id,
                exchanges.map(exchange => `(${exchange.from},${exchange.to})`),
                exchanges.map(exchange => exchange.ask),
                exchanges.map(exchange => exchange.date),
                exchanges.map(exchange => exchange.checksum)
            )
    });
}


async function checkLimits<E>(limit = 1000, items: any[], fn: () => AsyncResult<any, E>): AsyncResult<void, E | Error> {
    if (items.length > limit)
        return Result.err(new Error(`Too many items to upsert. Limit is ${limit}`));
    if (items.length === 0)
        return Result.ok(undefined);
    return fn();
}