import { IResolvers, MercuriusLoaders } from "mercurius"
import * as z from "zod"
import * as DbQueries from "../exchange-database/db-queries"


const DateValidator = z.object({
    from_date: z.coerce.date(),
    to_date: z.coerce.date().optional()
});

export const resolvers: IResolvers = {

    Query: {
        topProfitCountries: async (root, {to_date, from_date}, { db }) => {

            DateValidator.parse({ from_date, to_date });

            const res = await DbQueries.topProfitCountries({ db, to_date, from_date });
            if(!res.success) {
                console.error("topProfitCountries: ", res.error);
                throw res.error
            }
            return res.data;
        }
    },
};

export const loaders: MercuriusLoaders = {
    Country: {
        async exchangers (queries, {db}) {
            if(!queries.length) 
                return [];

            const { params: { topN }, obj: { from_date, to_date }  } = queries[0];

            z.object({ topN: z.number().min(1).max(100)} ).parse({ topN });

            const country_codes = queries.map(({obj:{ code }}) => code);
            const res = await DbQueries.topExchangersByCountry({ db, country_codes, to_date, from_date, topN });
            if(!res.success) {
                console.error("exchangers: ", res.error);
                throw res.error
            }
            const topExchangers = res.data; 
            return country_codes.map((code) => topExchangers[code] || []);
        }
    }
}
