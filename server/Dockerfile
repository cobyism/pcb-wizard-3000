FROM node:18-alpine
RUN apk update && apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 4000
CMD npx prisma migrate deploy && npm run start