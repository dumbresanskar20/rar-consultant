import { z } from 'zod';
import { services } from '../config/services.js';

const serviceNames = services.map((service) => service.title);

export function sanitizeDescription(value = '') {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeMobileInput(value = '') {
  return value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
}

export function normalizeIndianMobile(value = '') {
  const compact = value.trim();
  const match = /^(?:\+91|0)?([6-9]\d{9})$/.exec(compact);
  return match ? `+91${match[1]}` : '';
}

const nameSchema = z
  .string()
  .transform((value) => value.trim().replace(/[’]/g, "'"))
  .pipe(
    z
      .string()
      .min(2, 'Please enter at least 2 characters.')
      .max(60, 'Please keep your name under 60 characters.')
      .regex(/^[\p{L} .'-]+$/u, 'Use letters, spaces, dots, hyphens, or apostrophes only.')
      .refine((value) => /\p{L}/u.test(value), 'Please include your name.'),
  );

const mobileSchema = z
  .string()
  .trim()
  .refine(
    (value) => /^(?:\+91|0)?[6-9]\d{9}$/.test(value),
    'Enter a 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
  );

const emailSchema = z
  .string()
  .transform((value) => value.trim().toLowerCase())
  .pipe(
    z
      .string()
      .max(100, 'Email must be 100 characters or fewer.')
      .email('Enter a valid email address.'),
  );

const serviceSchema = z
  .string()
  .refine((value) => serviceNames.includes(value), 'Please select one of the listed services.');

const descriptionSchema = z
  .string()
  .transform(sanitizeDescription)
  .pipe(
    z
      .string()
      .min(20, 'Please add at least 20 characters.')
      .max(500, 'Please keep your description under 500 characters.'),
  );

export const enquirySchema = z.object({
  fullName: nameSchema,
  mobile: mobileSchema.transform(normalizeIndianMobile),
  email: emailSchema,
  service: serviceSchema,
  message: descriptionSchema,
});
