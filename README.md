# adisMainBackend

## Environment variables (Nunggalrejo / Firebase)

The Nunggalrejo Firebase service requires the following environment variables to be set (for local development put them in `.env`, for Vercel add them in Project Settings):

- `NUNGGALREJO_FB_TYPE`
- `NUNGGALREJO_FB_PROJECT_ID`
- `NUNGGALREJO_FB_PRIVATE_KEY_ID`
- `NUNGGALREJO_FB_PRIVATE_KEY` (when adding in Vercel, replace actual newlines with `\\n`; the app will convert `\\n` back to newlines)
- `NUNGGALREJO_FB_EMAIL`

If any of the required variables are missing, the server will fail to start and will log which variables are missing.
