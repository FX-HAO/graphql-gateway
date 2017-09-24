from node:8.5
WORKDIR /graphql-gateway
ADD ./ /graphql-gateway/
RUN apt-get update && npm install
EXPOSE 80
HEALTHCHECK CMD curl -f http://localhost/graphiql
CMD ["npm", "start"]
