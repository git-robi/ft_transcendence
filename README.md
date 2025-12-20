
### Need to Install

- [Node.js](https://nodejs.org/)
- npm (comes with Node.js)

<br>

### Installation of server and client dependencies

**Install Server Dependencies:**
   - Inside the `server` directory, run:
   npm install
   
   - Create a `.env` file in the `server` and fill with values (see `.env.example`)
   
<br>

**Install Client Dependencies:**
   - Inside the `client` directory, run:
   npm install

<br>

<br>

### Server Environment (.env)

Create a `.env` file inside the `server/` folder (see `server/.env.example`)

Required variables:

- `PORT` (example: `3001`)
- `CLIENT_URL` (example: `http://localhost:5173`)
- `JWT_SECRET` (any long random string will do, you can run `openssl rand -hex 32` to generate one)

PostgreSQL connection variables (used in `server/src/db/index.ts`):

- `PGUSER`
- `PGHOST`
- `PGDATABASE`
- `PGPORT`


### Database Setup (PostgreSQL)

So far we have a PostgreSQL database with a `users` table to test the workflow

1. Create a PostgreSQL database (name should match `PGDATABASE`).
2. Apply the schema running:


psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -p "$PGPORT" -f server/db/schema.

After this, you can start the server and the client 




### Running the App

You need to run the server and client in separate terminals.

**Start the API Server:**
- Inside the `server` directory, run:
npm run dev

The server will start on `http://localhost:3001`

<br>

**Start the Client:**
- Inside the `client` directory, run:
npm run dev

The client will start on `https://localhost:5173`

<br>

**Access API Documentation:**
-   Visit `http://localhost:3001/api-docs` to view the Swagger API documentation.

