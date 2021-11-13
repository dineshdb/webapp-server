import { exists, substitute } from "../deps.ts";

export async function envsubst(file: string, quiet = false) {
  const stat = await exists(file);
  if (!stat) {
    if (!quiet) {
      console.warn(`File ${file} does not exist.`);
    }
    return;
  }
  const text = await Deno.readTextFile(file);
  const substituted = substitute(text, Deno.env.get);
  return Deno.writeTextFile(file, substituted);
}
