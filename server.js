// Tiny dependency-free static file server for local preview.
// For production hosting (e.g. Bluehost), you only need to upload the
// .html / .css / .js files and the images/ folder — this server is optional.
const http = require("http")
const fs = require("fs")
const path = require("path")

const PORT = process.env.PORT || 3000
const ROOT = __dirname

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
}

function send(res, status, body, type) {
  res.writeHead(status, { "Content-Type": type || "text/plain; charset=utf-8" })
  res.end(body)
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0])

  // Normalize and prevent directory traversal.
  let filePath = path.normalize(path.join(ROOT, urlPath))
  if (!filePath.startsWith(ROOT)) {
    return send(res, 403, "Forbidden")
  }

  // Root -> index.html
  if (urlPath === "/" || urlPath === "") {
    filePath = path.join(ROOT, "index.html")
  }

  const tryServe = (p) => {
    fs.readFile(p, (err, data) => {
      if (err) return serve404(res)
      const ext = path.extname(p).toLowerCase()
      send(res, 200, data, MIME[ext] || "application/octet-stream")
    })
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) return tryServe(filePath)

    // Pretty URL: /login -> login.html
    if (!path.extname(filePath)) {
      const htmlPath = filePath.replace(/\/$/, "") + ".html"
      return fs.stat(htmlPath, (e2, s2) => {
        if (!e2 && s2.isFile()) return tryServe(htmlPath)
        return serve404(res)
      })
    }
    return serve404(res)
  })
})

function serve404(res) {
  fs.readFile(path.join(ROOT, "index.html"), (err, data) => {
    if (err) return send(res, 404, "Not Found")
    send(res, 404, data, MIME[".html"])
  })
}

server.listen(PORT, "0.0.0.0", () => {
  console.log("[v0] Lingvo Media running at http://0.0.0.0:" + PORT)
})
