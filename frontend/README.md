# Frontend

Vite + React frontend for the online code editor.

## Environment variables

Create `frontend/.env` from `frontend/.env.example`.

- `VITE_API_BASE_URL`: backend base URL for REST and websocket connections

If `VITE_API_BASE_URL` is not set, local development continues to use the Vite proxy.

## Vercel deployment

Use the `frontend` directory as the project root in Vercel.

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:
  `VITE_API_BASE_URL=https://online-code-editor-66kh.onrender.com`
