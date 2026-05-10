import { describe, it, expect } from 'vitest';
import { lexicalToPlainText } from '@/lib/content/lexical';

describe('lexicalToPlainText', () => {
  it('returns empty string for null/undefined/non-object', () => {
    expect(lexicalToPlainText(null)).toBe('');
    expect(lexicalToPlainText(undefined)).toBe('');
    expect(lexicalToPlainText('hello')).toBe('');
    expect(lexicalToPlainText(42)).toBe('');
  });

  it('extracts text from a single paragraph', () => {
    const node = {
      root: {
        children: [
          { type: 'paragraph', children: [{ text: 'Hello world' }] },
        ],
      },
    };
    expect(lexicalToPlainText(node)).toBe('Hello world');
  });

  it('joins multiple paragraphs with single spaces', () => {
    const node = {
      root: {
        children: [
          { type: 'paragraph', children: [{ text: 'First' }] },
          { type: 'paragraph', children: [{ text: 'Second' }] },
        ],
      },
    };
    expect(lexicalToPlainText(node)).toBe('First Second');
  });

  it('walks nested children (e.g. text inside a heading)', () => {
    const node = {
      root: {
        children: [
          { type: 'heading', tag: 'h2', children: [{ text: 'Title' }] },
          {
            type: 'paragraph',
            children: [
              { text: 'Bold ' },
              { type: 'text', text: 'and italic.' },
            ],
          },
        ],
      },
    };
    expect(lexicalToPlainText(node)).toBe('Title Bold and italic.');
  });

  it('collapses whitespace runs', () => {
    const node = {
      root: {
        children: [
          { type: 'paragraph', children: [{ text: '  hello   world  ' }] },
        ],
      },
    };
    expect(lexicalToPlainText(node)).toBe('hello world');
  });

  it('handles Hindi (Devanagari) text', () => {
    const node = {
      root: {
        children: [
          { type: 'paragraph', children: [{ text: 'डॉ. विमलेश शर्मा' }] },
        ],
      },
    };
    expect(lexicalToPlainText(node)).toBe('डॉ. विमलेश शर्मा');
  });
});
