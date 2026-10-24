// One-time importer. Read MCP-provided download instructions from stdin.
// Temporary source URLs are deliberately excluded from the durable manifest.
import { mkdir, readFile, writeFile, stat, rename } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'

let input = ''
for await (const chunk of process.stdin) input += chunk
const plan = JSON.parse(input)
const manifest = []
const hashes = new Map()
for (const asset of plan) {
  const { url, ...metadata } = asset
  let target = resolve('public', asset.path.replace(/^\//, ''))
  await mkdir(dirname(target), { recursive: true })
  const result = spawnSync('curl.exe', ['--fail', '--location', '--silent', '--show-error', '--retry', '2', '--output', target, url], { encoding: 'utf8' })
  if (result.status !== 0) {
    manifest.push({ ...metadata, status: 'unavailable', reason: result.stderr.trim() })
    continue
  }
  const bytes = await readFile(target)
  const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  const isJpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
  const isWebp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
  const isSvg = asset.path.endsWith('.svg') && /<svg\b/.test(bytes.toString('utf8', 0, 500))
  if ((!isPng && !isSvg && !isJpeg && !isWebp) || (await stat(target)).size === 0) throw new Error(`Invalid asset: ${asset.path}`)
  const extension = isJpeg ? '.jpg' : isWebp ? '.webp' : isSvg ? '.svg' : '.png'
  if (!target.endsWith(extension)) {
    const corrected = target.replace(/\.[^.]+$/, extension)
    await rename(target, corrected)
    target = corrected
    metadata.path = metadata.path.replace(/\.[^.]+$/, extension)
  }
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  const size = isPng ? { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) } : {}
  // Retain each screen-specific filename even when bytes repeat: provenance is explicit.
  manifest.push({ ...metadata, ...size, format: isPng ? 'png' : isJpeg ? 'jpeg' : isWebp ? 'webp' : 'svg', bytes: bytes.length, sha256, duplicateOf: hashes.get(sha256) ?? null, status: 'downloaded' })
  hashes.set(sha256, hashes.get(sha256) ?? metadata.path)
  process.stdout.write(`Downloaded ${metadata.path}\n`)
}
await mkdir('src/data', { recursive: true })
await writeFile('src/data/figma-assets.json', JSON.stringify(manifest, null, 2) + '\n')
console.log(JSON.stringify({ references: manifest.length, downloaded: manifest.filter(a => a.status === 'downloaded').length, uniqueFiles: hashes.size }))
