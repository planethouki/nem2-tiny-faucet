FROM node:lts-slim
WORKDIR /app
COPY . .
RUN npm i
CMD ["npm", "start"]