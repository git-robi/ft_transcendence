
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


## Set up postgres database with Prisma ORM

We use postgres together with Prisma. That means that you need to have postgres installed and running on your computer.
Then you need to fill the DATABASE_URL in .env with DATABASE_URL="postgresql://postgres@localhost:5432/pong_test".

To set up Prisma you need to run 3 commands:

1. `npx prisma migrate dev` - it inits a database with the schema in prisma schema
2. `npx prisma generate` - it creates the prisma client, which we need for interacting with the database using ts instead of sql
3. `npx prisma db seed` - it populates the tables with the data in the seed.ts file



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

~~~
** Game
Actually the 'Pong' game sources are in 'game' dir.
* See "Backlog" for more information
