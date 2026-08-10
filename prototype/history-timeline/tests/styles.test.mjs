import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

function channel(value) {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((index) => channel(Number.parseInt(value.slice(index, index + 2), 16)));
  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function matchedRule(pattern, name) {
  const match = css.match(pattern);
  assert.ok(match, `${name} interactive rule is missing`);
  return match;
}

test('primary actions keep WCAG AA contrast on hover and keyboard focus', () => {
  const genericHoverIndex = css.indexOf('button:hover:not(:disabled)');
  assert.ok(genericHoverIndex >= 0);
  assert.match(css.slice(genericHoverIndex, css.indexOf('}', genericHoverIndex) + 1), /background:\s*#fffdf7/);

  const submit = matchedRule(
    /\.learning-card > \[data-action='submit-comprehension'\]:hover:not\(:disabled\),\s*\.learning-card > \[data-action='submit-comprehension'\]:focus-visible:not\(:disabled\)\s*\{(?<declarations>[^}]*)\}/,
    'Submit response',
  );
  const progression = matchedRule(
    /\.learning-card > \[data-action='next-event'\]:hover:not\(:disabled\),\s*\.learning-card > \[data-action='next-event'\]:focus-visible:not\(:disabled\),\s*\.learning-card > \[data-action='select-unit'\]:hover:not\(:disabled\),\s*\.learning-card > \[data-action='select-unit'\]:focus-visible:not\(:disabled\)\s*\{(?<declarations>[^}]*)\}/,
    'Next stop and Continue',
  );

  for (const [name, match] of [['Submit response', submit], ['Next stop and Continue', progression]]) {
    assert.ok(match.index > genericHoverIndex, `${name} rule must follow the generic hover rule`);
    const foreground = match.groups.declarations.match(/color:\s*(#[0-9a-f]{6})/i)?.[1];
    const background = match.groups.declarations.match(/background:\s*(#[0-9a-f]{6})/i)?.[1];
    assert.ok(foreground && background, `${name} rule must set foreground and background colors together`);
    assert.ok(contrastRatio(foreground, background) >= 4.5, `${name} interactive contrast must be at least 4.5:1`);
  }
});
