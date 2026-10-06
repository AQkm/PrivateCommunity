# Private Community

Start the app with Docker Desktop installed:

```sh
docker compose up --build
```

Open [http://localhost:5173](http://localhost:5173). PocketBase runs at [http://localhost:8090](http://localhost:8090); its data persists in a Docker volume.

Run the end-to-end check (Node.js/npm and Docker required):

```sh
npm install
npx playwright install chromium
npm run test:playwright
```
