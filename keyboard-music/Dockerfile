# react
FROM node:lts-alpine as build

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./
RUN npm install
RUN npm install react-scripts@3.4.1 -g
COPY . ./

RUN npm run build

# nginx
FROM nginx:1.21.6-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]