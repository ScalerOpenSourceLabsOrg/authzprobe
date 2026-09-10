# Multi-stage build: compile TypeScript, then ship a lean runtime image.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
# AuthzProbe is stateless — mount your spec + config at runtime, e.g.:
#   docker run --rm -v "$PWD:/work" authzprobe scan \
#     --spec /work/openapi.yaml --config /work/identities.yaml
ENTRYPOINT ["node", "dist/cli.js"]
