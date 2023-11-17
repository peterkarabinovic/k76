import assert from "node:assert";
import { join } from "node:path";
import { describe, it } from "mocha"
import { parseLines, createFileLoader } from "../../src/exchange-data-sources"

describe("FileDataSource", () => {


    it("Should iterate items", async () => {
        const content = [
            "exchange-offices",
            "  exchange-office",
            "    id = 1",
            "    name = \"Office 1\"",
            "    country = \"UKR\"",
            "    exchanges",
            "      exchange",
            "        from = EUR",
            "        to = USD",
            "        ask = 110",
            "        date = 2023-04-24 22:55:33"
        ];
        const items = parseLines( iterateLines(content) );
        for await (const it of items) {            
            assert( it._tag === "exchange-office" || it._tag === "exchange" );
        }
    });

    it("Should iterate items from file", async () => {
        
        const loader = createFileLoader( join(__dirname, "..", "..", "data", "test-data.txt") );

        for await (const it of loader.exchangeOffices()) {
            assert( it._tag === "exchange-office" );
            if( it.id == 1 ) {
                assert.strictEqual( it.name, "Exchanger 1" );
                assert.strictEqual( it.country, "UKR" );
                for await (const ex of loader.exchanges(it.id)) {
                    assert.strictEqual(ex.date, "2023-04-24 22:55:33");
                }
            }
            if( it.id == 2 ) {
                assert.strictEqual( it.name, "Exchanger 2" );
                assert.strictEqual( it.country, "UKR" );
                for await (const ex of loader.exchanges(it.id)) {
                    assert( ex._tag === "exchange" );
                }
            }
        }

        for await (const it of loader.countries()) {
            assert( it._tag === "country" );
            assert.strictEqual( it.code, "UKR" );
            assert.strictEqual( it.name, "Ukraine" );
        }

    });
});


async function* iterateLines(lines: string[]): AsyncIterable<string> {
    for (const line of lines) {
        yield line;
    }
}
