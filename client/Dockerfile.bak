FROM node:20-bookworm-slim

WORKDIR /app

#copy package.json files
COPY package*.json ./
#clean dependencies install
RUN npm ci 

#copy all from current dir to container current dir
COPY . . 

CMD ["npm", "run", "dev", "--", "--host"]