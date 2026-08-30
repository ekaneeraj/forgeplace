FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

ENV PORT=4242

EXPOSE 4242

CMD ["bun", "dist/main.js"]