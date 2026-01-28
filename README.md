<b>
   
### Need to Install

- [Docker](https://www.docker.com/) and Docker Compose

</b>
<b>

### Detailed explanations on the architecture

Read this before, perhaps the answer to your question is already here! More details about the structure are explained here.
https://www.notion.so/Docker-services-2cbaa892ab4b8030b2dbce06ca8cfc09

### Create and populate the environment variables files

The values of the variables must be shared privately so you'll have to ask me for them. We can use the service share.doppler.com to share env values securely.

In the root folder, create a .env and a .env.development ile and put in it all the variables that you find in ./.env.example. 

</b>
<b>

### Run the containers with Makefile

Simply type make to launch a dev environment. 

make help provide a brief description of available make commands.

this links provides more details explanations: https://www.notion.so/Docker-services-2cbaa892ab4b8030b2dbce06ca8cfc09?source=copy_link#2eeaa892ab4b801fb45bf01738d7b7ce

### And that's it!
That's it basically, you can start working accessing the website through the browser while everything will run on containers in detached mode so you will be able to use the terminal :D

</b>

**Access API Documentation:**
-  Go to `http://localhost:3001/api-docs` to view the Swagger API documentation.

