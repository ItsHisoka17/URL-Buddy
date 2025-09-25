FROM node:20-alpine AS Client-build
WORKDIR /app
COPY Client/package*.json ./Client/
RUN cd Client && npm ci
COPY Client ./Client
RUN cd Client && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci

COPY . .

COPY --from=client-build /app/Client/dist ./Client/dist

EXPOSE 3000
CMD ["node", "Server.js"]
