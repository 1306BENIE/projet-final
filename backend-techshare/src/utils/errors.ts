export class NotificationError extends Error {
  constructor(message: string, public code: number) {
    super(message);
    this.name = "NotificationError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }> = []
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string, public code: number = 401) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}
