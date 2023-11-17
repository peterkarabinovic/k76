import { bufferIterator } from "../utils";
import { createHash } from "node:crypto"
import { IExchangeDataSource }  from "../exchange-data-sources";
import { DbClient } from "./db-client"
import * as dbUpdate from "./db-updaters";

type Props = {
    db: DbClient;
    dataSource: IExchangeDataSource;
}

export async function loadData({ db, dataSource }: Props) {

    for await( let countries of bufferIterator(dataSource.countries(), 100) ) {
        const res = await dbUpdate.upsetCountries(db, countries);
        if(!res.success) {
            console.error(res.error);
            return;
        }
    }

    for await( let office of dataSource.exchangeOffices() ) {

        // 1. Insert one exchange office
        const res = await dbUpdate.upsertExchangeOffices(db, [office]);
        if(!res.success) {
            console.error(res.error);
            return;
        }

        // 2. Insert exchanges for this office
        for await( let exchanges of bufferIterator(dataSource.exchanges(office.id), 100) ) {

            const exchangesWithChecksum = exchanges.map( ex => ({ ...ex, checksum: checksum(ex) }));
            const res = await dbUpdate.insertExchanges(db, office.id, exchangesWithChecksum);

            if(!res.success) {
                console.error(res.error);
                return;
            }
        }

        // 3. Insert rates for this office
        for await( let rates of bufferIterator(dataSource.rates(office.id), 100) ) {

            const res = await dbUpdate.insertRates(db, office.id, rates);
            
            if(!res.success) {
                console.error("rates: ", res.error);
                return;
            }
        }
    }

    // 4. Update materialized views
    let res = await db.query(`
        REFRESH MATERIALIZED VIEW exchanges.profits_view;
        REFRESH MATERIALIZED VIEW exchanges.country_profits_view;
    `);
    if(!res.success) 
        console.error("profits_view: ", res.error);

}

function checksum(obj: Record<string, any>): string {
    const str = Object.keys(obj).sort().map( key => obj[key] ).join(",");
    return createHash("md5").update(str).digest("hex");
}