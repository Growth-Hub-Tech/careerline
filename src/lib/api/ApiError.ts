interface ApiErrorInit {
  readonly status: number;
  readonly message: string;
  readonly code?: string;
  readonly reference?: string;
  readonly details?: string;
  readonly retryAfter?: number;
  readonly fieldErrors?: Readonly<Record<string, string>>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly reference: string | undefined;
  readonly details: string | undefined;
  readonly retryAfter: number | undefined;
  readonly fieldErrors: Readonly<Record<string, string>>;

  constructor({
    status,
    message,
    code,
    reference,
    details,
    retryAfter,
    fieldErrors = {},
  }: ApiErrorInit) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.reference = reference;
    this.details = details;
    this.retryAfter = retryAfter;
    this.fieldErrors = fieldErrors;
  }

  get isNetwork() {
    return this.status === 0;
  }
}
