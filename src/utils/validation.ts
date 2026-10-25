/**
 * Validation utilities for 3D FormX
 */

export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasSpecialChar: boolean;
  errorMessage: string | null;
}

/**
 * Validates that a password satisfies:
 * 1. Minimum 8 characters length
 * 2. At least one special character
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const hasMinLength = password.length >= 8;
  const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;
  const hasSpecialChar = specialCharRegex.test(password);

  let errorMessage: string | null = null;
  if (!hasMinLength && !hasSpecialChar) {
    errorMessage = 'Password must be at least 8 characters long and contain at least one special character (!@#$%^&*).';
  } else if (!hasMinLength) {
    errorMessage = 'Password must be at least 8 characters long.';
  } else if (!hasSpecialChar) {
    errorMessage = 'Password must contain at least one special character (e.g. !@#$%^&*).';
  }

  return {
    isValid: hasMinLength && hasSpecialChar,
    hasMinLength,
    hasSpecialChar,
    errorMessage,
  };
};
