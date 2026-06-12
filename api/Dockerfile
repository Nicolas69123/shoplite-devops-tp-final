# Stage 1 : installation des dependances (npm necessaire ici seulement)
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2 : image finale minimale
FROM node:20-alpine

# Correctifs de securite du systeme de base (vulnerabilites HIGH detectees par Trivy)
# + suppression de npm/yarn : inutiles au runtime (CMD = node), et leurs
# dependances internes (cross-spawn, glob, tar...) portaient 11 HIGH au scan.
RUN apk upgrade --no-cache \
  && rm -rf /usr/local/lib/node_modules/npm \
            /usr/local/bin/npm /usr/local/bin/npx \
            /opt/yarn* /usr/local/bin/yarn /usr/local/bin/yarnpkg

WORKDIR /app

ENV NODE_ENV=production
ENV API_PORT=3000

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "src/server.js"]
