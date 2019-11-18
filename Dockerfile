FROM node:12.13.0

WORKDIR /microservice

COPY ./package.json /microservice
COPY ./package-lock.json /microservice
COPY ./app.js       /microservice

ENV TOKEN_HOST='localhost'
ENV TOKEN_PORT='3001'

ENV REQ_COUNTER_HOST='localhost';
ENV REQ_COUNTER_PORT='3002';

ENV VERAZ_HOST='localhost';
ENV VERAZ_PORT='3003';

ENV PORT='3000'
EXPOSE 3000

RUN npm install
CMD node app.js