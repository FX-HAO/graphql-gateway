from node:8.5
WORKDIR /graphql-gateway
RUN apt-get update
RUN npm config set registry https://registry.npm.taobao.org
ADD package.json /graphql-gateway/package.json
ADD package-lock.json /graphql-gateway/package-lock.json
RUN npm install
ADD ./ /graphql-gateway/
EXPOSE 80
HEALTHCHECK CMD curl -f http://localhost/graphiql
CMD ["npm", "start"]
