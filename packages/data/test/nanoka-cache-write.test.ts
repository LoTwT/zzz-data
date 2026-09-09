import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { fetchNanokaData } from "../scripts/nanoka/fetch.ts"
import { NanokaHttpClient } from "../scripts/nanoka/http.ts"
import { loadSourcePolicy } from "../scripts/nanoka/policy.ts"

vi.mock(import("node:fs/promises"), async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, writeFile: vi.fn(actual.writeFile) }
})

const actualFs =
  await vi.importActual<typeof import("node:fs/promises")>("node:fs/promises")
const temporaryDirectories: string[] = []

afterEach(async () => {
  vi.mocked(writeFile).mockReset().mockImplementation(actualFs.writeFile)
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

describe("Nanoka atomic cache writes", () => {
  it("preserves the previous file and removes the partial temporary file when writing runs out of space", async () => {
    const cacheRoot = await mkdtemp(join(tmpdir(), "nanoka-cache-write-"))
    temporaryDirectories.push(cacheRoot)
    const cacheDirectory = join(cacheRoot, "3.0")
    await mkdir(cacheDirectory)
    const oldManifest = '{"previous":"cached bytes"}\n'
    await actualFs.writeFile(join(cacheDirectory, "manifest.json"), oldManifest)
    const diskError = Object.assign(new Error("disk full"), { code: "ENOSPC" })
    vi.mocked(writeFile).mockImplementationOnce(
      async (file, _data, options) => {
        await actualFs.writeFile(file, "{", options)
        throw diskError
      },
    )
    const policy = await loadSourcePolicy()
    const fetchImplementation = vi.fn<typeof fetch>(
      async () => new Response("{}"),
    )
    const manifest = { zzz: { live: "3.0", latest: "3.0", available: ["3.0"] } }

    await expect(
      fetchNanokaData({
        policy,
        httpClient: new NanokaHttpClient(policy, { fetchImplementation }),
        upstreamManifest: manifest,
        upstreamManifestBytes: new TextEncoder().encode(
          JSON.stringify(manifest),
        ),
        version: "3.0",
        entities: ["character"],
        cacheRoot,
      }),
    ).rejects.toBe(diskError)
    expect(await readFile(join(cacheDirectory, "manifest.json"), "utf8")).toBe(
      oldManifest,
    )
    expect(await readdir(cacheDirectory)).toEqual(["manifest.json"])
    expect(fetchImplementation).not.toHaveBeenCalled()
  })
})
