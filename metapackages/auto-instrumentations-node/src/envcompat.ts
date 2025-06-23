// XXX: not necessary once we upgrade to >= 0.57.0

import { diag } from '@opentelemetry/api';
import { inspect } from 'util';

/**
 * Retrieves a number from an environment variable.
 * - Returns `undefined` if the environment variable is empty, unset, contains only whitespace, or is not a number.
 * - Returns a number in all other cases.
 *
 * @param {string} key - The name of the environment variable to retrieve.
 * @returns {number | undefined} - The number value or `undefined`.
 */
export function getNumberFromEnv(key: string): number | undefined {
  const raw = process.env[key];
  if (raw == null || raw.trim() === '') {
    return undefined;
  }

  const value = Number(raw);
  if (isNaN(value)) {
    diag.warn(
      `Unknown value ${inspect(raw)} for ${key}, expected a number, using defaults`
    );
    return undefined;
  }

  return value;
}

/**
 * Retrieves a string from an environment variable.
 * - Returns `undefined` if the environment variable is empty, unset, or contains only whitespace.
 *
 * @param {string} key - The name of the environment variable to retrieve.
 * @returns {string | undefined} - The string value or `undefined`.
 */
export function getStringFromEnv(key: string): string | undefined {
  const raw = process.env[key];
  if (raw == null || raw.trim() === '') {
    return undefined;
  }
  return raw;
}
