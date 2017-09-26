from node:8.5
WORKDIR /graphql-gateway
RUN apt-get update
ENV DOCKERIZE_VERSION v0.5.0
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz
RUN npm config set registry https://registry.npm.taobao.org
ADD package.json /graphql-gateway/package.json
ADD package-lock.json /graphql-gateway/package-lock.json
RUN npm install
ADD ./ /graphql-gateway/
EXPOSE 80
HEALTHCHECK CMD curl -f http://localhost/graphiql || exit 1
CMD ["dockerize", "-wait", "http://web/api/v1/routes?per_page=1", "-timeout", "60s", "--wait-retry-interval", "10s", "--", "dockerize", "-wait", "http://financial-accounting/api/v1/users/1/account", "-timeout", "60s", "--wait-retry-interval", "10s", "--", "npm", "start"]
