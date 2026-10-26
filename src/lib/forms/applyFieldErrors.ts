import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from '../api/ApiError';

export const applyFieldErrors = <T extends FieldValues>(
  error: unknown,
  fields: readonly Path<T>[],
  setError: UseFormSetError<T>,
) => {
  if (!(error instanceof ApiError)) return false;

  let applied = false;
  fields.forEach((field) => {
    const message = error.fieldErrors[field];
    if (message) {
      setError(field, { message });
      applied = true;
    }
  });

  return applied;
};
