import { HttpErrorResponse } from '@angular/common/http';

// Turns any error (from the services or from HttpClient) into a text the user can read.
export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'The server is not reachable. Is the API running?';
    // An API that explains itself answers { "message": "..." } (the auth server does)
    const message: unknown = error.error?.message;
    if (typeof message === 'string') return errorMessage(new Error(message));
    if (error.status === 404) return 'Not found';
    return `Server error (${error.status})`;
  }

  if (error instanceof Error) {
    switch (error.message) {
      case 'bad credentials':
        return 'Wrong email or password';
      case 'email already taken':
        return 'This email is already taken';
      case 'user not found':
        return 'This user does not exist';
      case 'no token':
        return 'Log in first (no token sent)';
      case 'invalid token':
        return 'Invalid token: the signature does not match';
      case 'token expired':
        return 'Your token expired: log in again';
    }
    return error.message;
  }

  return 'Something went wrong';
}
