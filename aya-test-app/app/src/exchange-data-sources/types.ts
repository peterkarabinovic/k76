import * as T from "../exchange-model";


export interface IExchangeDataSource {
    exchangeOffices(): AsyncIterable<T.ExchangeOffice>;
    rates(office_id: number): AsyncIterable<T.Rate>;
    exchanges(office_id: number): AsyncIterable<T.Exchange>;
    countries(): AsyncIterable<T.Country>;
};

