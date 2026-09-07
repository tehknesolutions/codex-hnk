// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { parseAuthCallbackUrl } from './auth-callback.ts';

test('parses implicit-flow tokens from an hnk deep link', () => {
  assert.deepEqual(
    parseAuthCallbackUrl('hnk://auth/callback#access_token=access-123&refresh_token=refresh-456&type=signup'),
    {
      kind: 'tokens',
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
    },
  );
});

test('parses PKCE authorization code callbacks', () => {
  assert.deepEqual(parseAuthCallbackUrl('https://codex.example/?code=pkce-123'), {
    kind: 'code',
    code: 'pkce-123',
  });
});

test('returns callback errors without exposing tokens', () => {
  assert.deepEqual(
    parseAuthCallbackUrl('hnk://auth/callback#error=access_denied&error_description=Link%20expired'),
    {
      kind: 'error',
      message: 'Link expired',
    },
  );
});

test('rejects incomplete session fragments', () => {
  assert.deepEqual(parseAuthCallbackUrl('hnk://auth/callback#access_token=access-only'), {
    kind: 'error',
    message: 'auth_callback_incomplete_session',
  });
});
