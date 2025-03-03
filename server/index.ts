import {$, build, type ServeOptions} from 'bun'
import handleApiRequest from './api.ts'
import {watch} from "fs"

const port = Bun.env.PORT || 3000

async function main() {
  await buildClient()
  startServer()
  console.log(`Server available at http://localhost:${port}/`)

  if (Bun.env.NODE_ENV !== 'production') {
    const watcher = watch('client', {recursive: true}, debounce(buildClient, 20))
    process.on("SIGINT", () => watcher.close())
  }
  process.on("SIGINT", () => process.exit())
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
        return new Response(e.message, {status: 500})
        console.error(e)
      }
    }
  } as ServeOptions)
}

async function handleUiRoute(path: string) {
  if (await Bun.file(`build/${path}`).exists()) {
    return serveFile(`build/${path}`)
  } else if (await Bun.file(`build/static/${path}`).exists()) {
    return serveFile(`build/static/${path}`)
  } else {
    return serveFile(`build/public/index.html`)
  }
}

async function serveFile(path: string, compress = true) {
  if (compress) {
    const file = Bun.file(path)
    const content = Bun.gzipSync(await file.arrayBuffer())
    return new Response(content, {headers: {'Content-Type': file.type, 'Content-Encoding': 'gzip'}})
  } else {
    return new Response(Bun.file(path))
  }
}

async function buildClient() {
  await fixEuiSideEffects()

  await $`mkdir -p build`
  const version = Bun.env.VERSION || await $`git rev-parse --short HEAD`.text()

  const result = await build({
    entrypoints: ['./client/index.tsx', './client/serviceWorker.ts'],
    outdir: './build/static',
    naming: {
      asset: '[name].[ext]',
    },
    minify: Bun.env.NODE_ENV === 'production',
    define: {
      VERSION: `'${version.trim()}'`
    }
  })
  if (!result.success) {
    console.error('There were errors during the client build:')
    for (const log of result.logs) {
      console.log(log)
    }
  }
  await $`cp -r client/public build/`
  console.log('Rebuilt')
}

async function fixEuiSideEffects() {
  const euiPkg = Bun.file(`${import.meta.dir}/../node_modules/@elastic/eui/package.json`)
  await Bun.write(euiPkg, JSON.stringify({
    ...await euiPkg.json(),
    sideEffects: false
  }, null, 2))
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
