FROM node:20-bookworm-slim

WORKDIR /app

#copy package.json files
COPY package*.json ./
#clean dependencies install
RUN npm ci 

#copy all from current dir to container current dir
COPY . . 

RUN npx prisma generate
# Copy and make entrypoint executable
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh
CMD ["sh","./entrypoint.sh"]