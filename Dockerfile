FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production


FROM base AS release
RUN mkdir -p /data
RUN chown bun /data

USER bun
COPY --chown=bun --from=install /temp/prod/node_modules node_modules
COPY --chown=bun . .


ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "server/index.ts" ]
