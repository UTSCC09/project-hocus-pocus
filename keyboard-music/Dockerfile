# react
FROM node:lts-alpine

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./
RUN npm install
RUN npm install react-scripts@3.4.1 -g
COPY . ./

RUN npm build

# nginx
FROM nginx:1.21.6-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/ngix/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]