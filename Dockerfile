FROM node:16.13.0

WORKDIR /app

ARG API_KEY
ENV API_KEY=${API_KEY}
ARG LATITUDE
ENV LATITUDE=${LATITUDE}
ARG LONGITUDE
ENV LONGITUDE=${LONGITUDE}

COPY index.ts package.json package-lock.json /app/

RUN npm install

EXPOSE 8002

CMD ["npm", "run", "start"]
