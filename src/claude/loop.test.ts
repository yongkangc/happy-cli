import { describe, it, expect } from 'vitest';
import { mapClaudeModel } from './loop';

describe('mapClaudeModel', () => {
    it('should return undefined for undefined input', () => {
        expect(mapClaudeModel(undefined)).toBeUndefined();
    });

    it('should map friendly names to latest 4.5 model identifiers', () => {
        expect(mapClaudeModel('opus')).toBe('claude-opus-4-5-20251101');
        expect(mapClaudeModel('sonnet')).toBe('claude-sonnet-4-5-20250929');
        expect(mapClaudeModel('haiku')).toBe('claude-haiku-4-5-20251001');
    });

    it('should be case-insensitive', () => {
        expect(mapClaudeModel('OPUS')).toBe('claude-opus-4-5-20251101');
        expect(mapClaudeModel('Sonnet')).toBe('claude-sonnet-4-5-20250929');
        expect(mapClaudeModel('HaIkU')).toBe('claude-haiku-4-5-20251001');
    });

    it('should handle 4.5 version-specific names', () => {
        expect(mapClaudeModel('opus-4.5')).toBe('claude-opus-4-5-20251101');
        expect(mapClaudeModel('opus-4-5')).toBe('claude-opus-4-5-20251101');
        expect(mapClaudeModel('opus45')).toBe('claude-opus-4-5-20251101');
        expect(mapClaudeModel('sonnet-4.5')).toBe('claude-sonnet-4-5-20250929');
        expect(mapClaudeModel('sonnet-4-5')).toBe('claude-sonnet-4-5-20250929');
        expect(mapClaudeModel('sonnet45')).toBe('claude-sonnet-4-5-20250929');
        expect(mapClaudeModel('haiku-4.5')).toBe('claude-haiku-4-5-20251001');
        expect(mapClaudeModel('haiku-4-5')).toBe('claude-haiku-4-5-20251001');
        expect(mapClaudeModel('haiku45')).toBe('claude-haiku-4-5-20251001');
    });

    it('should handle legacy 4.x version names', () => {
        expect(mapClaudeModel('opus-4')).toBe('claude-opus-4-20250514');
        expect(mapClaudeModel('opus4')).toBe('claude-opus-4-20250514');
        expect(mapClaudeModel('sonnet-4')).toBe('claude-sonnet-4-20250514');
        expect(mapClaudeModel('sonnet4')).toBe('claude-sonnet-4-20250514');
    });

    it('should handle legacy 3.5 version names', () => {
        expect(mapClaudeModel('sonnet-3.5')).toBe('claude-sonnet-3-5-20241022');
        expect(mapClaudeModel('sonnet-3-5')).toBe('claude-sonnet-3-5-20241022');
        expect(mapClaudeModel('sonnet35')).toBe('claude-sonnet-3-5-20241022');
        expect(mapClaudeModel('haiku-3.5')).toBe('claude-haiku-3-5-20241022');
        expect(mapClaudeModel('haiku-3-5')).toBe('claude-haiku-3-5-20241022');
        expect(mapClaudeModel('haiku35')).toBe('claude-haiku-3-5-20241022');
    });

    it('should pass through full model identifiers unchanged', () => {
        expect(mapClaudeModel('claude-opus-4-5-20251101')).toBe('claude-opus-4-5-20251101');
        expect(mapClaudeModel('claude-sonnet-4-5-20250929')).toBe('claude-sonnet-4-5-20250929');
        expect(mapClaudeModel('claude-haiku-4-5-20251001')).toBe('claude-haiku-4-5-20251001');
        expect(mapClaudeModel('claude-opus-4-20250514')).toBe('claude-opus-4-20250514');
        expect(mapClaudeModel('claude-sonnet-4-20250514')).toBe('claude-sonnet-4-20250514');
        expect(mapClaudeModel('claude-haiku-3-5-20241022')).toBe('claude-haiku-3-5-20241022');
        expect(mapClaudeModel('claude-sonnet-3-5-20241022')).toBe('claude-sonnet-3-5-20241022');
    });

    it('should pass through unknown model names unchanged', () => {
        expect(mapClaudeModel('custom-model')).toBe('custom-model');
        expect(mapClaudeModel('future-model-xyz')).toBe('future-model-xyz');
    });

    it('should handle edge cases', () => {
        expect(mapClaudeModel('')).toBe('');
        expect(mapClaudeModel('claude-')).toBe('claude-');
    });
});
