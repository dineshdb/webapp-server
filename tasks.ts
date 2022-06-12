#!/usr/bin/env -S deno run --unstable --allow-env --allow-read --allow-write --allow-run

import {
  main,
  sh,
} from "https://cdn.jsdelivr.net/gh/dineshdb/tasks@v0.4.0/mod.ts";

main({
  fmt: sh("deno fmt --unstable ."),
  lint: sh("deno lint --unstable ."),
  compile: sh("deno compile --unstable main.ts"),
  image: sh(`podman build -t dineshdb/webapp-server .`),
});
