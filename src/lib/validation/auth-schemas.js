import { z } from 'zod';

// Mirrors the API's DTO rules so users get instant feedback; the API remains the authority.
// Schemas are built per language: pass the page's `t` (useI18n) so messages are translated.
export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;
export const NAME_MAX = 120;

const emailField = (t) =>
  z
    .string()
    .trim()
    .min(1, t('validation.emailRequired'))
    .pipe(z.email(t('validation.emailInvalid')));

const newPasswordField = (t) =>
  z
    .string()
    .min(PASSWORD_MIN, t('validation.passwordMin', { min: PASSWORD_MIN }))
    .max(PASSWORD_MAX, t('validation.passwordMax', { max: PASSWORD_MAX }));

export const loginSchema = (t) =>
  z.object({
    email: emailField(t),
    password: z.string().min(1, t('validation.passwordRequired')),
  });

export const registerSchema = (t) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(2, t('validation.nameRequired'))
      .max(NAME_MAX, t('validation.nameMax', { max: NAME_MAX })),
    email: emailField(t),
    password: newPasswordField(t),
  });

export const forgotPasswordSchema = (t) => z.object({ email: emailField(t) });

export const resetPasswordSchema = (t) =>
  z
    .object({ password: newPasswordField(t), confirmPassword: z.string() })
    .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: t('validation.passwordsMismatch') });

export const changePasswordSchema = (t) =>
  z
    .object({
      currentPassword: z.string().min(1, t('validation.currentPasswordRequired')),
      newPassword: newPasswordField(t),
      confirmPassword: z.string(),
    })
    .refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: t('validation.passwordsMismatch') })
    .refine((v) => v.newPassword !== v.currentPassword, { path: ['newPassword'], message: t('validation.passwordUnchanged') });

/** Rough strength meter (0–4) for UX only — length and character variety. */
export function passwordStrength(value = '') {
  if (!value) return 0;
  let score = value.length >= PASSWORD_MIN ? 1 : 0;
  if (value.length >= 14) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score++;
  return Math.min(score, 4);
}
