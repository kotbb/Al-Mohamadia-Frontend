export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string | string[];
  errorCode?: string;
  path: string;
  timestamp: string;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errorCode?: string;
  readonly path?: string;
  readonly timestamp?: string;
  readonly messages: string[];

  constructor(body: Partial<ApiErrorBody> & { statusCode: number }) {
    const messages = Array.isArray(body.message)
      ? body.message
      : body.message
        ? [body.message]
        : ["Request failed"];
    super(messages.join("; "));
    this.name = "ApiError";
    this.statusCode = body.statusCode;
    this.errorCode = body.errorCode;
    this.path = body.path;
    this.timestamp = body.timestamp;
    this.messages = messages;
  }
}
