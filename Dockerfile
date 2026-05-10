FROM node:26-bookworm-slim AS builder

WORKDIR /app

ARG SITE_URL
ENV SITE_URL=$SITE_URL

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
RUN npm prune --omit=dev

FROM node:26-bookworm-slim AS runner

WORKDIR /app
ARG SITE_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SITE_URL=$SITE_URL

COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/data ./data
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/next.config.js ./next.config.js
RUN mkdir -p /app/storage && chown node:node /app/storage

USER node

EXPOSE 3000

CMD ["npm", "start"]
