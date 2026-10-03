import { describe, expect, it } from 'vitest';
import { changePasswordSchema, loginSchema, passwordStrength, registerSchema, resetPasswordSchema } from './auth-schemas';
import { safeRedirect } from '../safe-redirect';
import { createTranslator } from '@/i18n/translator';
import en from '@/i18n/messages/en.json';
import ar from '@/i18n/messages/ar.json';

const t = createTranslator('en', en);

const messages = (result) => Object.fromEntries(result.error.issues.map((i) => [i.path.join('.'), i.message]));

describe('auth schemas', () => {
  it('trims emails and requires a valid address', () => {
    expect(loginSchema(t).parse({ email: '  a@b.co ', password: 'x' }).email).toBe('a@b.co');
    expect(messages(loginSchema(t).safeParse({ email: 'nope', password: '' }))).toEqual({
      email: 'Enter a valid email address.',
      password: 'Enter your password.',
    });
  });

  it('enforces the 10-character password minimum on registration', () => {
    const result = registerSchema(t).safeParse({ name: 'Layla', email: 'a@b.co', password: 'short' });
    expect(messages(result).password).toBe('Use at least 10 characters.');
    expect(registerSchema(t).safeParse({ name: 'Layla', email: 'a@b.co', password: 'long enough pass' }).success).toBe(true);
  });

  it('requires matching confirmation for reset and change', () => {
    expect(messages(resetPasswordSchema(t).safeParse({ password: 'a long password', confirmPassword: 'different one' }))).toEqual({
      confirmPassword: 'Passwords don’t match.',
    });
    expect(
      messages(changePasswordSchema(t).safeParse({ currentPassword: 'same password!', newPassword: 'same password!', confirmPassword: 'same password!' })),
    ).toEqual({ newPassword: 'Choose a different password.' });
  });

  it('builds messages in the page language', () => {
    const tAr = createTranslator('ar', ar, en);
    expect(messages(registerSchema(tAr).safeParse({ name: 'x', email: 'nope', password: 'short' }))).toEqual({
      name: 'أدخل اسمك الكامل.',
      email: 'أدخل بريدًا إلكترونيًا صالحًا.',
      password: 'استخدم 10 أحرف على الأقل.',
    });
  });

  it('scores password strength for the meter', () => {
    expect(passwordStrength('')).toBe(0);
    expect(passwordStrength('short')).toBe(0);
    expect(passwordStrength('longenoughx')).toBe(1);
    expect(passwordStrength('Long Enough Pass 42')).toBe(4);
  });
});

describe('safeRedirect', () => {
  it('allows same-site paths and rejects open redirects', () => {
    expect(safeRedirect('/account?tab=1')).toBe('/account?tab=1');
    expect(safeRedirect('//evil.com')).toBe('/account');
    expect(safeRedirect('/\\evil.com')).toBe('/account');
    expect(safeRedirect('https://evil.com')).toBe('/account');
    expect(safeRedirect(null)).toBe('/account');
  });
});
