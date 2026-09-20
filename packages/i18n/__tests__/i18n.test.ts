import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  LocaleMessages,
  MessageCatalog,
  createTranslator,
  isLocalizedText,
  matchLocale,
  parseAcceptLanguage,
  pickText,
  readStoredLocale,
  resolveLocale,
  storeLocale,
} from '../src/index';

const CATALOG = {
  'book.open': 'Open book',
  'book.pages': { one: '{count} page', other: '{count} pages' },
  'book.published': 'Published version {version}',
} as const satisfies MessageCatalog<string>;

type Key = keyof typeof CATALOG;

const TRANSLATIONS: LocaleMessages<Key> = {
  ko: {
    'book.open': '책 열기',
    'book.pages': { other: '{count}쪽' },
  },
};

describe('resolveLocale', () => {
  it('takes the setting first', () => {
    expect(resolveLocale({ chosen: 'ko', system: ['en-US'] })).toBe('ko');
  });

  it('falls back to the system when the setting is "follow the system"', () => {
    expect(resolveLocale({ chosen: null, system: ['ko-KR', 'en'] })).toBe('ko');
  });

  it('ignores a setting this build does not know', () => {
    expect(resolveLocale({ chosen: 'ja', system: ['ko-KR'] })).toBe('ko');
  });

  it('ends at the source language when nothing fits', () => {
    expect(resolveLocale({ system: ['ja-JP', 'fr'] })).toBe(DEFAULT_LOCALE);
    expect(resolveLocale({})).toBe(DEFAULT_LOCALE);
  });

  it('matches on the language, not the region', () => {
    expect(matchLocale('EN-gb')).toBe('en');
    expect(matchLocale('ko-Kore-KR')).toBe('ko');
    expect(matchLocale('ja')).toBeNull();
  });
});

describe('parseAcceptLanguage', () => {
  it('sorts by quality and keeps the written order when it ties', () => {
    expect(parseAcceptLanguage('en;q=0.8, ko;q=0.9, fr')).toEqual(['fr', 'ko', 'en']);
  });

  it('drops what the client refused and what it wrote wrong', () => {
    expect(parseAcceptLanguage('ko, en;q=0')).toEqual(['ko']);
    expect(parseAcceptLanguage('')).toEqual([]);
    expect(parseAcceptLanguage(null)).toEqual([]);
  });
});

describe('createTranslator', () => {
  it('writes the translation, and the source language for what is missing', () => {
    const ko = createTranslator('ko', CATALOG, TRANSLATIONS);
    expect(ko.t('book.open')).toBe('책 열기');
    expect(ko.t('book.published', { version: 3 })).toBe('Published version 3');
    expect(ko.has('book.open')).toBe(true);
    expect(ko.has('book.published')).toBe(false);
  });

  it('counts by the rules of the language', () => {
    const en = createTranslator('en', CATALOG, TRANSLATIONS);
    const ko = createTranslator('ko', CATALOG, TRANSLATIONS);
    expect(en.t('book.pages', { count: 1 })).toBe('1 page');
    expect(en.t('book.pages', { count: 12 })).toBe('12 pages');
    expect(ko.t('book.pages', { count: 1 })).toBe('1쪽');
  });

  it('writes numbers as the language does', () => {
    const en = createTranslator('en', CATALOG, TRANSLATIONS);
    expect(en.t('book.published', { version: 1234 })).toBe('Published version 1,234');
    expect(en.formatBytes(2_097_152)).toBe('2 MB');
    expect(en.formatBytes(512)).toBe('512 byte');
  });

  it('leaves a hole where a value was not given', () => {
    const en = createTranslator('en', CATALOG, TRANSLATIONS);
    expect(en.t('book.published')).toBe('Published version {version}');
  });
});

describe('pickText', () => {
  it('takes the language asked for, then the source language', () => {
    const name = { en: 'Quiz', ko: '퀴즈' };
    expect(pickText('ko', name)).toBe('퀴즈');
    expect(pickText('en', name)).toBe('Quiz');
    expect(pickText('ko', { en: 'Flip card' })).toBe('Flip card');
    expect(pickText('ko', 'Flip card')).toBe('Flip card');
  });

  it('knows a localized map from anything else', () => {
    expect(isLocalizedText({ en: 'Quiz' })).toBe(true);
    expect(isLocalizedText({ ko: '퀴즈' })).toBe(false);
    expect(isLocalizedText('Quiz')).toBe(false);
    expect(isLocalizedText(null)).toBe(false);
  });
});

describe('stored locale', () => {
  it('remembers and forgets', () => {
    const map = new Map<string, string>();
    const storage = {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => void map.set(key, value),
      removeItem: (key: string) => void map.delete(key),
    };
    expect(readStoredLocale(storage)).toBeNull();
    storeLocale(storage, 'ko');
    expect(readStoredLocale(storage)).toBe('ko');
    storeLocale(storage, null);
    expect(readStoredLocale(storage)).toBeNull();
  });

  it('survives a browser that refuses to store', () => {
    const storage = {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('denied'); },
      removeItem: () => { throw new Error('denied'); },
    };
    expect(readStoredLocale(storage)).toBeNull();
    expect(() => storeLocale(storage, 'ko')).not.toThrow();
  });
});
