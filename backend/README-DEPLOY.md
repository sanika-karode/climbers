# Deploy Backend to Vercel

## Step 1: Create a New Vercel Project for the Backend

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your Git repository (e.g. climbers)
4. **Important:** Set **Root Directory** to `backend`
5. Click **Edit** next to Root Directory and enter `backend`
6. Framework Preset: Leave as **Other** (Vercel auto-detects FastAPI via pyproject.toml)

## Step 2: Environment Variables

In Project Settings → Environment Variables, add:

| Name | Value |
|------|-------|
| `SUPABASE_DB_URL` | Your Supabase connection string (Transaction mode, port 6543) |
| `SECRET_KEY` | Your JWT secret key |
| `CORS_ORIGINS` | Your frontend URL, e.g. `https://your-frontend.vercel.app` |

Get Supabase URL: Supabase Dashboard → Project Settings → Database → Connection string → **URI** → **Transaction** mode

## Step 3: Deploy

Click **Deploy** or push to your connected branch. Vercel will:

1. Install dependencies from `requirements.txt`
2. Find the FastAPI app via `pyproject.toml` (`app.main:app`)
3. Deploy as a serverless function

## Step 4: Get Your Backend URL

After deployment, your backend URL will be:
```
https://your-backend-project.vercel.app
```

Test it: `https://your-backend-project.vercel.app/health` should return `{"status":"ok"}`

## Step 5: Connect Frontend

In your **frontend** Vercel project (climbing-app), add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://your-backend-project.vercel.app` |

Redeploy the frontend so it uses the production API URL.
