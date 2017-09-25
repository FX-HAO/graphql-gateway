from node:8.5
WORKDIR /graphql-gateway
ADD ./ /graphql-gateway/
RUN apt-get update && npm install -g cnpm
ADD package.json /graphql-gateway/package.json
ADD package-lock.json /graphql-gateway/package-lock.json
RUN npm install
EXPOSE 80
HEALTHCHECK CMD curl -f http://localhost/graphiql
CMD ["npm", "start"]
