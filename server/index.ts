import { $, build, type ServeOptions } from 'bun'
import handleApiRequest from './api.ts'
import { watch } from "fs";

const port = Bun.env.PORT || 3000

async function main() {
  await buildClient()
  startServer()
  console.log(`Server available at http://localhost:${port}/`)

  const watcher = watch('client', debounce(buildClient, 20));

  process.on("SIGINT", () => {
    watcher.close();
    process.exit(0);
  });
}

function startServer() {
  Bun.serve({
    port,
    async fetch(req) {
      const path = new URL(req.url).pathname
      console.log(req.method, path)
      return path.startsWith('/api') ? await handleApiRequest(req) : await handleUiRoute(path)
    },
    error(e) {
      if (e instanceof Response) {
        return e
      } else {
        console.error(e)
        throw e
      }
    }
  } as ServeOptions);
}

async function handleUiRoute(path: string) {
  if (await Bun.file(`build/${path}`).exists()) {
    return new Response(Bun.file(`build/${path}`));
  } else if (await Bun.file(`build/static/${path}`).exists()) {
    return new Response(Bun.file(`build/static/${path}`));
  } else {
    return new Response(Bun.file(`build/public/index.html`))
  }
}

async function buildClient() {
  await $`mkdir -p build`
  const result = await build({
    entrypoints: ['./client/index.tsx'],
    outdir: './build/static',
    // minify: Bun.env.NODE_ENV === 'production',
    // splitting: Bun.env.NODE_ENV === 'production',
  });
  if (!result.success) {
    console.error('There were errors during the client build:')
    for (const log of result.logs) {
      console.log(log)
    }
  }
  await $`cp -r client/public build/`
  console.log('Rebuilt')
}

function debounce(fn: (...params: any[]) => void, wait: number) {
  let isWaitingToStart = false
  return async function debouncedFn(...args: any[]) {
    if (!isWaitingToStart) {
      isWaitingToStart = true
      setTimeout(async () => {
        isWaitingToStart = false
        await fn(...args)
      }, wait)
    }
  }
}

await main()
