FROM node:20.11-alpine as builder

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --silent

FROM nginx:1.25.3-alpine
VOLUME /var/cache/nginx
COPY --from=builder /usr/src/app/dist/frontend-gestion-delictual/browser /usr/share/nginx/html
EXPOSE 80




