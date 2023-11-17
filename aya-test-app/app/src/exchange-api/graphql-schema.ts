
export const typeDefs = /* GraphQL */`

    type Query {
        topProfitCountries(from_date: String!, to_date: String): [Country!]!
    }

    type Country {
        name: String!
        code: String!
        profit: Float!
        from_date: String!
        to_date: String!
        exchangers(topN: Int = 10): [ExchangerProfit!]!
    }

    type ExchangerProfit {
        office_id: ID!
        name: String!
        profit: Float!
        country_code: String!
    }

    # type Exchanges {
    #     office_id: ID!
    #     datetime: String!
    #     ask: Float!
    #     bid: Float!
    #     currency_from: String!
    #     currency_to: String!
    # }

`;