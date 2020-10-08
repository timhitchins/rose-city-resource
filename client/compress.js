const brotli = require('brotli');
const fs = require('fs');
const zlib = require('zlib');
const { promisify } = require('util');
const { resolve, join } = require('path');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const brotliSettings = {
  extension: 'br',
  skipLarger: true,
  mode: 1, // 0 = generic, 1 = text, 2 = font (WOFF2)
  quality: 10, // 0 - 11,
  lgwin: 12 // default
};
async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    if (subdir !== 'node_modules') {
      const res = resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }
  }));
  return files.reduce((a, f) => a.concat(f), []);
}
let basePath = join(__dirname, 'build');
getFiles(basePath)
  .then(files => {
    files.forEach(file => {
      console.log(file);
      if (file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.html') || file.endsWith('.json')) {
        const result = brotli.compress(fs.readFileSync(file), brotliSettings);
        fs.writeFileSync(file + '.br', result);
        const fileContents = fs.createReadStream(file);
        const writeStream = fs.createWriteStream(file + '.gz');
        const zip = zlib.createGzip();
        fileContents
          .pipe(zip)
          .on('error', err => console.error(err))
          .pipe(writeStream)
          .on('error', err => console.error(err));
      }
    })
  })
  .catch(e => console.error(e));