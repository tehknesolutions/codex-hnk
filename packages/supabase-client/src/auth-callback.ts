export type AuthCallbackPayload =
  | {
      kind: 'tokens';
      accessToken: string;
      refreshToken: string;
    }
  | {
      kind: 'code';
      code: string;
    }
  | {
      kind: 'error';
      message: string;
    }
  | null;

function collectParams(url: string): URLSearchParams {
  const questionIndex = url.indexOf('?');
  const hashIndex = url.indexOf('#');
  const parts: string[] = [];

  if (questionIndex >= 0) {
    const end = hashIndex >= 0 && hashIndex > questionIndex ? hashIndex : url.length;
    const query = url.slice(questionIndex + 1, end);
    if (query) parts.push(query);
  }

  if (hashIndex >= 0) {
    const fragment = url.slice(hashIndex + 1);
    if (fragment) parts.push(fragment);
  }

  return new URLSearchParams(parts.join('&'));
}

export function parseAuthCallbackUrl(url: string): AuthCallbackPayload {
  if (!url.trim()) return null;

  const params = collectParams(url);
  const error = params.get('error_description') ?? params.get('error');
  if (error) {
    return {
      kind: 'error',
      message: error,
    };
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken || refreshToken) {
    if (!accessToken || !refreshToken) {
      return {
        kind: 'error',
        message: 'auth_callback_incomplete_session',
      };
    }
    return {
      kind: 'tokens',
      accessToken,
      refreshToken,
    };
  }

  const code = params.get('code');
  if (code) {
    return {
      kind: 'code',
      code,
    };
  }

  return null;
}
