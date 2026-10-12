import { test, expect } from '@playwright/test';
import { applyMarkdown } from '../../lib/kudos/markdown-input';
import { safeHref } from '../../lib/kudos/safe-link';

/**
 * The compose toolbar (mm:I520:11647;520:9877) and the board renderer that
 * reads its output. Both are covered here because both are arithmetic or
 * parsing that a visual check cannot confirm: where the caret lands after a
 * transform, and whether a URL is safe to turn into a link.
 */

test.describe('applyMarkdown', () => {
  test('wraps the selection and keeps it selected', () => {
    const result = applyMarkdown(
      { value: 'cam on ban', selectionStart: 0, selectionEnd: 6 },
      'bold',
    );
    expect(result.value).toBe('**cam on** ban');
    // The same words stay highlighted, shifted past the opening marker.
    expect(result.value.slice(result.selectionStart, result.selectionEnd)).toBe('cam on');
  });

  test('puts the caret between the markers when nothing is selected', () => {
    const result = applyMarkdown({ value: '', selectionStart: 0, selectionEnd: 0 }, 'italic');
    expect(result.value).toBe('**');
    expect(result.selectionStart).toBe(1);
    expect(result.selectionEnd).toBe(1);
  });

  test('pressing the same button again unwraps rather than nesting', () => {
    const once = applyMarkdown({ value: 'hi', selectionStart: 0, selectionEnd: 2 }, 'bold');
    const twice = applyMarkdown(once, 'bold');
    expect(twice.value).toBe('hi');
    expect(twice.value.slice(twice.selectionStart, twice.selectionEnd)).toBe('hi');
  });

  test('strikethrough uses its own marker', () => {
    const result = applyMarkdown({ value: 'nope', selectionStart: 0, selectionEnd: 4 }, 'strikethrough');
    expect(result.value).toBe('~~nope~~');
  });

  test('quote prefixes every line the selection touches', () => {
    const result = applyMarkdown(
      { value: 'one\ntwo\nthree', selectionStart: 1, selectionEnd: 9 },
      'quote',
    );
    expect(result.value).toBe('> one\n> two\n> three');
  });

  test('quote toggles off when every touched line already has it', () => {
    const result = applyMarkdown(
      { value: '> one\n> two', selectionStart: 0, selectionEnd: 11 },
      'quote',
    );
    expect(result.value).toBe('one\ntwo');
  });

  test('numbered list counts up per line', () => {
    const result = applyMarkdown(
      { value: 'a\nb\nc', selectionStart: 0, selectionEnd: 5 },
      'numberList',
    );
    expect(result.value).toBe('1. a\n2. b\n3. c');
  });

  test('a caret inside one line still formats that whole line', () => {
    // The selection touches no newline, so the transform has to widen to the
    // line boundaries on its own.
    const result = applyMarkdown({ value: 'one\ntwo', selectionStart: 5, selectionEnd: 5 }, 'quote');
    expect(result.value).toBe('one\n> two');
  });

  test('link wraps the selection as the label and keeps the url', () => {
    const result = applyMarkdown(
      { value: 'see docs', selectionStart: 4, selectionEnd: 8 },
      'link',
      { url: 'https://sun-asterisk.com' },
    );
    expect(result.value).toBe('see [docs](https://sun-asterisk.com)');
  });

  test('link with no url leaves a skeleton with the caret in the url slot', () => {
    const result = applyMarkdown(
      { value: '', selectionStart: 0, selectionEnd: 0 },
      'link',
      { url: '', linkPlaceholder: 'link' },
    );
    expect(result.value).toBe('[link]()');
    // Between the parentheses, ready to paste.
    expect(result.selectionStart).toBe(7);
  });
});

test.describe('safeHref', () => {
  test('allows http and https', () => {
    expect(safeHref('https://sun-asterisk.com')).toBe('https://sun-asterisk.com/');
    expect(safeHref('http://sun-asterisk.com')).toBe('http://sun-asterisk.com/');
  });

  test('rejects javascript: — the reason this guard exists', () => {
    expect(safeHref('javascript:alert(1)')).toBeNull();
    // Case and padding must not get past it.
    expect(safeHref('  JaVaScRiPt:alert(1)')).toBeNull();
  });

  test('rejects data: and other schemes', () => {
    expect(safeHref('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(safeHref('vbscript:msgbox(1)')).toBeNull();
    expect(safeHref('file:///etc/passwd')).toBeNull();
  });

  test('rejects empty input', () => {
    expect(safeHref('')).toBeNull();
    expect(safeHref('   ')).toBeNull();
  });

  test('resolves a relative path against the inert base', () => {
    // Safe by protocol, but deliberately not pointing at this site.
    expect(safeHref('/kudos')).toBe('https://example.invalid/kudos');
  });
});
