import { exists, Oak, proxy } from "./deps.ts";
import { envsubst } from "./src/envsubst.ts";
import { middleware } from "./src/prerender.ts";
import { logger, timer } from "./src/middlewares.ts";

const PORT = Deno.env.get("PORT") ?? "8080";
const port = parseInt(PORT);

const app = new Oak.Application();
app.use(logger);
app.use(timer);

function extractUrl(pathPrefix: string, proxyUrl = "%s") {
  if (!pathPrefix.endsWith("/")) {
    pathPrefix += "/";
  }
  return (ctx: Oak.Context) => {
    let url = ctx.request.url.href.replace(
      ctx.request.url.origin + pathPrefix,
      "",
    );
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    console.log(proxyUrl.replace("%s", url));
    return proxyUrl.replace("%s", url);
  };
}

const router = new Oak.Router();
router.all(
  "/proxy/(.*)",
  proxy(extractUrl("/proxy/"), {
    memoizeUrl: false,
  }),
);

const apiUrl = Deno.env.get("API_URL");
if (apiUrl) {
  router.all("/api", proxy(apiUrl));
}

const imageProxy = Deno.env.get("IMAGE_PROXY_URL") ?? "";
if (imageProxy) {
  // TODO: Add image related optimizations
  // TODO: Add header based authorization
  router.all(
    "/imgproxy/(.*)",
    proxy(extractUrl("/imgproxy/", imageProxy), {
      memoizeUrl: false,
    }),
  );
}

const prerender = Deno.env.get("PRERENDER_URL") ?? "";
if (prerender) {
  console.info("Prerendering enabled via", prerender);
  router.use(middleware(prerender));
}

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
  return async (ctx: Oak.Context, next: () => unknown) => {
    const filePath = ctx.request.url.pathname;
    const stat = await exists(`${root}${filePath}`);
    if (stat) {
      return Oak.send(ctx, filePath, {
        root,
      });
    }
    return next();
  };
}

// TODO Fallback to per folder index.html
function fallbackIndexHtml(file: string) {
  return (ctx: Oak.Context) => {
    return Oak.send(ctx, file, {
      root: Deno.cwd(),
    });
  };
}
