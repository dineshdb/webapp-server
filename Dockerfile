FROM docker.io/denoland/deno:latest
ENV PORT=8080
WORKDIR /app
COPY deps.ts .
RUN deno cache --unstable deps.ts
ADD . .
USER deno
CMD [ "run", "--unstable", "-A", "main.ts"]

