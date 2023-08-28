FROM node:lts-alpine
WORKDIR /app
COPY package.json ./
COPY tsconfig.json ./
COPY . .
RUN yarn install
RUN yarn run build


FROM node:lts-alpine
WORKDIR /app
COPY package.json ./
COPY --from=0 /app/prisma/schema.prisma ./prisma/schema.prisma
RUN yarn install --prod
RUN npx prisma generate
COPY --from=0 /app/dist .
EXPOSE 8899
CMD ["npm", "run", "start:prod"]
