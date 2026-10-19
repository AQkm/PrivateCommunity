# Private Community

## Run with Docker Compose

Requirements: Docker Desktop with Docker Compose enabled.

From the repository directory, start the app:

```sh
docker compose up --build
```

The first start builds the frontend and PocketBase containers. PocketBase creates the `Events` and `Photos` collections from the project's initial schema automatically when it starts with an empty data volume. The schema is kept in one bootstrap file at `pb_migrations/1728316800_initial_schema.js`.

- App: [http://localhost:5173](http://localhost:5173)
- PocketBase: [http://localhost:8090](http://localhost:8090)

Uploaded photos and database files persist in the `pocketbase_data` Docker volume when the containers stop.

To discard the database and uploaded photos and initialize everything again from the current schema, stop the containers and remove their volumes:

```sh
docker compose down --volumes
docker compose up --build
```

This permanently deletes all data in the Compose volumes, including uploaded photos.

## Deploy the frontend to GitHub Pages

GitHub Pages can host the static frontend. PocketBase still needs to run on a publicly reachable host; Pages does not host the database, uploaded photos, or the PocketBase API.

1. Push this repository to GitHub and make sure its default branch is `main` (or update `.github/workflows/pages.yml` to use your branch).
2. In **Settings → Secrets and variables → Actions → Variables**, add a repository variable named `VITE_POCKETBASE_URL` with the public HTTPS URL of your PocketBase server, such as `https://community.example.com`. This URL is included in the public frontend build, so it is not a secret.
3. In **Settings → Pages**, set the source to **GitHub Actions**.
4. Push to `main` or run **Deploy to GitHub Pages** from the Actions tab. GitHub will show the published URL in the workflow's `github-pages` environment.

Configure the PocketBase host to allow browser requests from the published Pages origin and set its collection API rules for the access you intend. Do not expose PocketBase admin credentials in the frontend. Without a `VITE_POCKETBASE_URL` variable, the deployed frontend falls back to `http://127.0.0.1:8090` and cannot reach a hosted database.

Stop the app with `Ctrl+C`. If it was started in the background, run:

```sh
docker compose down
```

## Run the frontend without Docker

Requirements: Node.js and npm. PocketBase must be running separately at `http://127.0.0.1:8090` (or set `VITE_POCKETBASE_URL` to its address).

```sh
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).
