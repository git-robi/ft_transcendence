# new approach - dockerized development 

## Hey guys, here are the instructions so that you can start develope the app using docker instead of doing it locally :D

N.B: This is just a temporary setup, Marc is working on the final and more complex setup.

<b>
   
### Need to Install

- [Docker](https://www.docker.com/) and Docker Compose

</b>
<b>

### Create and populate the environment variables files

The values of the variables must be shared privately so you'll have to ask me for them. We can use the service share.doppler.com to share env values securely.
The files that you have to create are:

   1. In the root folder, create a .env file and put in it all the variables that you find in ./.env.example. 

   2. In the '/server' folder you will have to create 2 files: .env and .env.docker. They are quite identical, the only exception is the DATABASE_URL. You can find instructions in the /server/.env.example file.

</b>
<b>

### Run the containers with Makefile

In the Makefile you will find description of every command.

### And that's it!
That's it basically, you can start working accessing the website through the browser while everything will run on containers in detatched mode so you will be able to use the terminal :D

</b>

**Access API Documentation:**
-  Go to `http://localhost:3001/api-docs` to view the Swagger API documentation.

