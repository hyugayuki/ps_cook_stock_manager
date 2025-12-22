---
description: How to deploy the Next.js application to Vercel
---

# Deploying to Vercel

This workflow describes how to deploy your "Pokemon Sleep Cooking Planner" to Vercel.

## Prerequisites

- A GitHub account (recommended) or a Vercel account.
- The project code pushed to a GitHub repository.

## Option 1: Vercel Dashboard (Recommended)

1.  **Push your code to GitHub**:
    Ensure your latest changes are committed and pushed to your GitHub repository.

2.  **Log in to Vercel**:
    Go to [vercel.com](https://vercel.com) and log in (using GitHub is easiest).

3.  **Add New Project**:

    - Click **"Add New..."** -> **"Project"**.
    - Import your GitHub repository (`ps_cook_stock_manager` or similar name).

4.  **Configure Project**:

    - **Framework Preset**: Vercel should automatically detect "Next.js".
    - **Root Directory**: Leave as `./` (default).
    - **Build Command**: `next build` (default).
    - **Output Directory**: `.next` (default).
    - **Environment Variables**: This app doesn't currently require any secrets, so you can skip this.

5.  **Deploy**:
    Click **"Deploy"**. Vercel will build your app and verify it.

6.  **Done!**:
    Once finished, you will get a URL like `https://ps-cook-stock-manager.vercel.app`.

## Option 2: Vercel CLI

If you prefer using the terminal:

1.  **Install Vercel CLI**:

    ```bash
    npm i -g vercel
    ```

2.  **Login**:

    ```bash
    vercel login
    ```

3.  **Deploy**:
    Run the following command in your project root:

    ```bash
    vercel
    ```

    - Follow the prompts (Set up and deploy? [Y], Scope? [Select account], Link to existing project? [N], etc.).
    - For most settings, you can accept the defaults.

4.  **Production Deployment**:
    To deploy to production (not a preview URL):
    ```bash
    vercel --prod
    ```

## Post-Deployment Checks

- Check that `localStorage` persistence works (your plans should be saved purely in your browser).
- Verify the UI looks correct on mobile devices accessing the public URL.
