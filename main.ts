import { exists, Oak } from "./deps.ts";
import { envsubst } from "./src/envsubst.ts";
import { logger, timer } from "./src/middlewares.ts";

const PORT = Deno.env.get("PORT") ?? "8080";
const port = parseInt(PORT);

const app = new Oak.Application();
app.use(logger);
app.use(timer);

const router = new Oak.Router();
app.use(router.routes());
app.use(router.allowedMethods());
app.use(serve("public"));
app.use(fallbackIndexHtml("public/index.html"));

await Promise.all([
  envsubst("build/index.html", true),
  envsubst("public/index.html", true),
]);
console.info(`Starting on http://0.0.0.0:${port}`);
app.listen({ port });

function serve(folder: string) {
  const root = `${Deno.cwd()}/${folder}`;
  return async (ctx: Oak.Context) =>
    ctx.send({
      root,
      index: "index.html",
    });
}

// TODO Fallback to per folder index.html
function fallbackIndexHtml(file: string) {
  return (ctx: Oak.Context) => {
    return Oak.send(ctx, file, {
      root: Deno.cwd(),
    });
  };
}
