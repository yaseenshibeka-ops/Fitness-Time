FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --production false

COPY client/package*.json ./client/
RUN cd client && npm install

COPY client/ ./client/
RUN cd client && npm run build

COPY src/ ./src/
COPY public/ ./public/

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/public ./public
COPY --from=build /app/client/dist ./client/dist
COPY package*.json ./

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/app.js"]
