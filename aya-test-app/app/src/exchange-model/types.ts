import { object, string, number, literal, TypeOf } from 'zod';

export const Country = object({
    _tag: literal("country"),
    code: string(),
    name: string()
});

export type Country = TypeOf<typeof Country>;

export const ExchangeOffice = object({
    _tag: literal("exchange-office"),
    id: string().transform(Number),
    name: string(),
    country: string()
});

export type ExchangeOffice = TypeOf<typeof ExchangeOffice>;

export const Rate = object({
    _tag: literal("rate"),
    office_id: number(),
    from: string(),
    to: string(),
    in: string().transform(Number),
    out: string().transform(Number),
    reserve: string().transform(Number),
    date: string()
});

export type Rate = TypeOf<typeof Rate>;

export const Exchange = object({
    _tag: literal("exchange"),
    office_id: number(),
    from: string(),
    to: string(),
    ask: string().transform(Number),
    date: string()
});

export type Exchange = TypeOf<typeof Exchange>;

export type ExchangeWithChecksum = Exchange & { checksum: string };

