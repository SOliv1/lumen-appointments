const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const buildDir = path.join(__dirname, "build");

const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
};

function resolveAsset(requestUrl) {
  const cleanPath = decodeURIComponent(requestUrl.split("?")[0]);
  const requestedPath = cleanPath === "/" ? "/index.html" : cleanPath;
  const filePath = path.normalize(path.join(buildDir, requestedPath));

  if (!filePath.startsWith(buildDir)) {
    return path.join(buildDir, "index.html");
  }

  return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
    ? filePath
    : path.join(buildDir, "index.html");
}

http
  .createServer((request, response) => {
    const filePath = resolveAsset(request.url);
    const extension = path.extname(filePath);

    fs.readFile(filePath, (error, content) => {
      if (error) {
        response.writeHead(500);
        response.end("Unable to serve Serene Care Sync.");
        return;
      }

      response.writeHead(200, {
        "Content-Type": types[extension] || "application/octet-stream",
      });
      response.end(content);
    });
  })
  .listen(port, () => {
    console.log(`Serene Care Sync is running on port ${port}`);
  });
