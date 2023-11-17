import assert from "node:assert";
import { describe, it } from 'mocha';
import { calculateWordTypes } from '../src/word-types';

describe('calculateWordTypes', () => {
    it('should return the correct number of word types', () => {
        let wordTypes = calculateWordTypes("The quick brown fox jumps over the lazy dog")
        assert.deepEqual(wordTypes, { determiner: 2, preposition: 1, noun: 1 });

        wordTypes = calculateWordTypes("I am a student")
        assert.deepEqual(wordTypes, { pronoun: 1, determiner: 1, noun: 1 });
    });

    it('should return empty object for an empty string', () => {
        const text = '';
        const wordTypes = calculateWordTypes(text);
        assert.deepEqual(wordTypes, { });
    });
});