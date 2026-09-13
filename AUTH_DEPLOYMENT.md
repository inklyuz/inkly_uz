# Inkly authentication deployment

## Browser OAuth flow

Google is a browser navigation flow, not a frontend fetch callback:

`/login` -> Google -> `https://api.inkly.uz/api/v1/auth/google/callback` -> httpOnly refresh cookie -> `302 https://inkly.uz/dashboard`.

Telegram bot login uses the same backend callback model. The bot's final inline button opens `/api/v1/auth/telegram/bot/callback?token=...`; the API consumes the one-time token, sets the refresh cookie, then redirects to `/dashboard`.

## Critical production cookie setting

The refresh cookie MUST be shared between the API and frontend hosts because Next.js middleware on `inkly.uz` checks for it. Set:

`COOKIE_SECURE=true`
`COOKIE_DOMAIN=.inkly.uz`

A host-only `api.inkly.uz` cookie is not visible to `inkly.uz` middleware and will cause `/dashboard` to bounce back to `/login`.

## Google Console

Authorized redirect URI:
`https://api.inkly.uz/api/v1/auth/google/callback`

## Frontend

Set:
`NEXT_PUBLIC_API_URL=https://api.inkly.uz/api/v1`
`NEXT_PUBLIC_SITE_URL=https://inkly.uz`
`NEXT_PUBLIC_MEDIA_CDN_URL=https://cdn.inkly.uz`

The frontend must start Google with `window.location.assign()` using the URL returned by `GET /auth/google`. It must not fetch `/auth/google/callback`.
