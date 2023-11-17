import * as fs from "node:fs"
import * as readline from "node:readline"
import * as T from "../exchange-model";
import { IExchangeDataSource } from './types';

export function createFileLoader(filePath: string): IExchangeDataSource {

    async function* iterateLines(filePath: string): AsyncIterable<string> {
        const reader = readline.createInterface({
            input: fs.createReadStream(filePath),
            crlfDelay: Infinity
        });

        for await (const line of reader) {
            yield line;
        }
    }


    return {
        async *exchangeOffices() {
            const lines = iterateLines(filePath);
            for await (const it of parseLines(lines)) {
                if (it._tag === "exchange-office")
                    yield it;
            }
        },

        async *rates(office_id: number) {
            const lines = iterateLines(filePath);
            for await (const it of parseLines(lines)) {
                if (it._tag === "rate" && it.office_id === office_id)
                    yield it;
            }
        },

        async *exchanges(office_id: number) {
            const lines = iterateLines(filePath);
            for await (const it of parseLines(lines)) {
                if (it._tag === "exchange" && it.office_id === office_id)
                    yield it;
            }
        },

        async *countries() {
            const lines = iterateLines(filePath);
            for await (const it of parseLines(lines)) {
                if (it._tag === "country")
                    yield it;
            }
        }
    }
}



export async function* parseLines(lines: AsyncIterable<string>): AsyncIterable<T.ExchangeOffice | T.Exchange | T.Country | T.Rate> {

    type TState =
        | "root"
        | "exchange-offices"
        | "start-exchange-office"
        | "exchange-office"
        | "exchanges"
        | "start-exchange"
        | "exchange"
        | "rates"
        | "start-rate"
        | "rate"
        | "countries"
        | "start-country"
        | "country"
        | "done"

    type TRecord = {
        tag: "exchange-offices"|"exchange-office"|"exchanges"|"exchange"|"rates"|"rate"|"countries"|"country"|"done"
        line: string
        lineNum: number
    } | {
        tag: "key-value-4-spaces"|"key-value-8-spaces"
        line: string
        lineNum: number
        key: string
        value: string
    }


    let state = "root" as TState;
    let prevState: TState = state;
    let item: any = null;
    let office_id = null;
    for await (const rec of iterRecords()) {

        if (rec.tag === "done") {
            state = "done";
        } 
        else {

            switch (state) {
                case "root": {
                    if (rec.tag === "exchange-offices")
                        state = "exchange-offices";
                    else if (rec.tag === "countries")
                        state = "countries";
                } break;

                case "exchange-offices": {
                    if (rec.tag === "exchange-office")
                        state = "start-exchange-office";
                    else if (rec.tag === "countries")
                        state = "countries";
                } break;

                case "start-exchange-office": {
                    if (rec.tag === "key-value-4-spaces") {
                        item = { [rec.key]: rec.value, _tag: "exchange-office" };
                        state = "exchange-office";
                    }
                    else throw badFormatError(rec.line, rec.lineNum);
                } break;

                case "exchange-office": {
                    if (rec.tag === "key-value-4-spaces") 
                        item[rec.key] = rec.value;
                    else if (rec.tag === "exchanges") 
                        state = "exchanges";
                    else if (rec.tag === "rates") 
                        state = "rates";
                    else if(rec.tag === "countries") 
                        state = "countries";
                    else throw badFormatError(rec.line, rec.lineNum);

                }; break;

                case "exchanges": {
                    if (rec.tag === "exchange-office")
                        state = "start-exchange-office";
                    else if (rec.tag === "countries")
                        state = "countries";
                    else if (rec.tag === "rates")
                        state = "rates";
                    else if (rec.tag === "exchange")
                        state = "start-exchange";
                }; break;

                case "start-exchange": {
                    if (rec.tag === "key-value-8-spaces") {
                        item = { [rec.key]: rec.value, _tag: "exchange", office_id };
                        state = "exchange";
                    }
                    else throw badFormatError(rec.line, rec.lineNum);
                }; break;

                case "exchange": {
                    if (rec.tag === "key-value-8-spaces") {
                        item[rec.key] = rec.value;
                    }
                    else if (rec.tag === "exchange-office")
                        state = "start-exchange-office";
                    else if (rec.tag === "countries")
                        state = "countries";
                    else if (rec.tag === "rates")
                        state = "rates";
                    else if (rec.tag === "exchange")
                        state = "start-exchange";
                } break;

                case "rates": {
                    if (rec.tag === "exchange-office")
                        state = "start-exchange-office";
                    else if (rec.tag === "countries")
                        state = "countries";
                    else if (rec.tag === "exchanges")
                        state = "exchanges";
                    else if (rec.tag === "rate")
                        state = "start-rate";
                } break;

                case "start-rate": {
                    if (rec.tag === "key-value-8-spaces") {
                        item = { [rec.key]: rec.value, _tag: "rate", office_id };
                        state = "rate";
                    }
                    else throw badFormatError(rec.line, rec.lineNum);
                } break;

                case "rate": {
                    if (rec.tag === "key-value-8-spaces") {
                        item[rec.key] = rec.value;
                    }
                    else if (rec.tag === "exchange-office")
                        state = "start-exchange-office";
                    else if (rec.tag === "countries")
                        state = "countries";
                    else if (rec.tag === "exchanges")
                        state = "exchanges";
                    else if (rec.tag === "rate")
                        state = "start-rate";
                } break;

                case "countries": {
                    if (rec.tag === "exchange-offices")
                        state = "exchange-offices";
                    else if( rec.tag === "country")
                        state = "start-country";
                } break;

                case "start-country": {
                    if (rec.tag === "key-value-4-spaces") {
                        item = { [rec.key]: rec.value, _tag: "country" };
                        state = "country";
                    }
                    else throw badFormatError(rec.line, rec.lineNum);
                } break;

                case "country": {
                    if (rec.tag === "key-value-4-spaces") 
                        item[rec.key] = rec.value;
                    else if (rec.tag === "country")
                        state = "start-country";
                    else if (rec.tag === "exchange-offices")
                        state = "exchange-offices";
                } break;
            }
        }

        if (prevState === state)
            continue;

        switch (prevState) {
            case "exchange-office": {
                const office = T.ExchangeOffice.safeParse(item);
                if (office.success) {
                    yield office.data;
                    office_id = office.data.id;
                    item = null;
                }
                else throw badFormatError(rec.line, rec.lineNum, office.error.message);
            } break

            case "exchange": {
                const exchange = T.Exchange.safeParse(item);
                if (exchange.success) {
                    yield exchange.data;
                    item = null;
                }
                else throw badFormatError(rec.line, rec.lineNum, exchange.error.message);
            } break;

            case "rate": {
                const rate = T.Rate.safeParse(item);
                if (rate.success) {
                    yield rate.data;
                    item = null;
                }
                else throw badFormatError(rec.line, rec.lineNum, rate.error.message);
            } break;

            case "country": {
                const country = T.Country.safeParse(item);
                if (country.success) {
                    yield country.data;
                    item = null;
                }
                else throw badFormatError(rec.line, rec.lineNum, country.error.message);
            } break;
        }

        prevState = state;
    }

    async function* iterRecords(): AsyncIterable<TRecord> {
        let lineNum = 0;
        for await (const line of lines) {
            lineNum++;
            let spaces = line.length - line.trimStart().length;
            let record = line.trim();
            switch (spaces) {
                case 0:
                    if (record === "exchange-offices")
                        yield { tag: "exchange-offices", line, lineNum };
                    else if (record === "countries")
                        yield { tag: "countries", line, lineNum };
                    // else 
                    //     throw badFormatError(line, lineNum);
                    break;

                case 2:
                    if (record === "exchange-office")
                        yield { tag: "exchange-office", line, lineNum };
                    else if (record === "country")
                        yield { tag: "country", line, lineNum };
                    else
                        throw badFormatError(line, lineNum);
                    break;

                case 4:
                    if (record === "exchanges")
                        yield { tag: "exchanges", line, lineNum };
                    else if (record === "rates")
                        yield { tag: "rates", line, lineNum };
                    else {
                        const [key, value] = record.split("=").map(it => it.trim());
                        if (typeof value === "undefined")
                            throw badFormatError(line, lineNum);
                        yield { tag: "key-value-4-spaces", key, value, line, lineNum };
                    }
                    break;

                case 6:
                    if (record === "exchange")
                        yield { tag: "exchange", line, lineNum };
                    else if (record === "rate")
                        yield { tag: "rate", line, lineNum };
                    else
                        throw badFormatError(line, lineNum);
                    break;

                case 8:
                    const [key, value] = record.split("=").map(it => it.trim());
                    if (typeof value === "undefined")
                        throw badFormatError(line, lineNum);
                    yield { tag: "key-value-8-spaces", key, value, line, lineNum };
                    break;
                default:
                    throw badFormatError(line, lineNum);
            }
        }
        yield { tag: "done", line: "", lineNum: -1 };
    };

    function badFormatError(line: string, lineNum: number, message?: string) {
        let msg = `Bad format at line ${lineNum}: ${line}.`;
        if(message)
            msg = msg + " " + message;
        return new Error(msg);
    }

}

