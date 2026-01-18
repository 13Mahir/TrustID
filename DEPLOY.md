# Deploying TrustID Platform to Vercel

This project is configured for deployment on Vercel as a Monorepo (Single Project).

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **MySQL Database**: You need a hosted MySQL database (e.g., PlanetScale, Aiven, AWS RDS, or a Vercel Marketplace integration).
    *   **Note**: This project **requires** MySQL. It will not work with Vercel Postgres/KV without code changes.

## Deployment Steps

1.  **Push to GitHub**: Ensure this project is pushed to a GitHub repository.

2.  **Import into Vercel**:
    *   Go to Vercel Dashboard -> "Add New..." -> "Project".
    *   Import your GitHub repository.

3.  **Configure Project**:
    *   **Framework Preset**: Select **Vite** (If not detected automatically, or choose "Other" and ensure settings below).
    *   **Root Directory**: Leave as `./` (Root).
    *   **Build Command**: `cd Frontend && npm install && npm run build` (This is already defined in `package.json`, so Vercel might pick it up as `npm run build` from root. If needed, override it in settings).
    *   **Output Directory**: `Frontend/dist`
    *   **Install Command**: `npm install` (Installs root dependencies including backend modules).

4.  **Environment Variables**:
    Add the following variables in the Vercel Project Settings (Environment Variables):

    *   `DATABASE_URL`: Your MySQL Connection String (e.g., `mysql://user:pass@host:port/db`) - **Recommended**
    *   **OR** use individual variables:
        *   `DB_HOST`
        *   `DB_USER`
        *   `DB_PASSWORD`
        *   `DB_NAME`
    *   `GEMINI_API_KEY`: Your Gemini API Key
    *   `TWO_FACTOR_API_KEY`: Your 2Factor API Key (or use demo values)
    *   `NODE_ENV`: `production` (Vercel sets this automatically, but good to check)

5.  **Deploy**: Click **Deploy**.

## Troubleshooting

-   **404 on API calls**: Ensure the `vercel.json` file is present in the root and contains the rewrite for `/api/(.*)`.
-   **Database Error**: Check the Function Logs in Vercel Dashboard. Ensure your database allows connections from Vercel IPs (allow `0.0.0.0/0` or use a secure tunnel).
-   **Static Assets 404**: Ensure "Output Directory" is set to `Frontend/dist`.

## Local Development (Updated)

-   **Frontend**: Now uses a proxy to `localhost:5001`.
-   **Run**:
    1.  Start Backend: `cd Backend && npm run dev`
    2.  Start Frontend: `cd Frontend && npm run dev`
    3.  Access UI at `http://localhost:8080` (or the port shown by Vite).
