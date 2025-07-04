# Stage 1: Build dependencies
FROM node:23-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

# Stage 2: Create final image
FROM node:23-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY index.ts .
RUN touch storage.json && chown node:node /app/storage.json

ENV TZ=UTC
ENV NODE_ENV=production
USER node

CMD ["node", "index.ts"]