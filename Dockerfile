FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Create logs directory
RUN mkdir -p /app/logs

CMD ["node", "index.js", "|", "npx", "pino-pretty"]
