FROM node:13.10.1-alpine3.11
RUN apk add --no-cache bash

# Create Directory for the Container
WORKDIR /usr/src/app

# Fetch packages
COPY package.json tsconfig.json setup.sql yarn.lock ./

RUN yarn

# Copy all other source code to work directory
COPY src ./src/
COPY wait-for-it.sh ./

# Build typescript
RUN yarn tsc

# Set user
USER node

# Start app
CMD ["./wait-for-it.sh", "postgres:5432", "--", "node", "./dist/server.js"]
