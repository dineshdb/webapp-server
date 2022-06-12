import { exists, Application, Router, Context} from "./deps.ts";
import { envsubst } from "./src/envsubst.ts";
import { logger, timer } from "./src/middlewares.ts";

const PORT = Deno.env.get("PORT") ?? "8080";
const port = parseInt(PORT);

const app = new Application();
app.use(logger);
app.use(timer);

const router = new Router();
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
  return async (ctx: Context, next: () => unknown) => {
    const filePath = ctx.request.url.pathname;
    const stat = await exists(`${root}${filePath}`);
    if (stat) {
      return ctx.send({
        root,
        index: 'index.html',
      });
    }
    return next();
  };
}

// TODO Fallback to per folder index.html
function fallbackIndexHtml(index: string = 'index.html') {
  return (ctx: Context) => {
    return ctx.send({
      root: Deno.cwd(),
      index,
    });
  };
}
