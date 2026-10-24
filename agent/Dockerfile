# syntax=docker/dockerfile:1
# Build context is the repo root (pnpm workspace) — build with:
#   docker build -f agent/Dockerfile -t mai-agent .

FROM node:26-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@11.5.1

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY agent/package.json agent/package.json
RUN pnpm install --frozen-lockfile --filter=@mai/agent --ignore-scripts

FROM deps AS build
COPY agent/tsconfig.json agent/tsconfig.build.json agent/
COPY agent/src agent/src
RUN pnpm --filter=@mai/agent build

FROM base AS prod-deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY agent/package.json agent/package.json
RUN pnpm install --frozen-lockfile --filter=@mai/agent --prod --ignore-scripts

FROM node:26-alpine AS runtime
WORKDIR /app/agent
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/agent/node_modules ./node_modules
COPY --from=build /app/agent/dist ./dist
COPY agent/package.json ./package.json
EXPOSE 8080
CMD ["node", "dist/server.js"]
