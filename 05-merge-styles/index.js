const path = require('path');
const fsPromises = require('node:fs/promises');
const fs = require('fs');

async function initScript() {
  const targetFolderPath = path.join(__dirname, 'styles');
  const distFolderPath = path.join(__dirname, 'project-dist');

  await fsPromises.mkdir(distFolderPath, { recursive: true });

  const files = await fsPromises.readdir(targetFolderPath, {
    withFileTypes: true,
  });

  const contentFiles = files
    .filter((file) => path.extname(file.name) === '.css')
    .map(
      (file) =>
        new Promise((resolve) => {
          const output = [];

          const readStream = fs.createReadStream(
            path.join(targetFolderPath, file.name),
          );

          readStream.on('data', (data) => output.push(data));
          readStream.on('end', () => resolve(output));
        }),
    );

  const bundleChunks = await Promise.all(contentFiles).then((files) => {
    const output = [];

    for (const chunks of files) {
      chunks.forEach((chunk) => output.push(chunk));
    }

    return output;
  });

  const bundleStream = fs.createWriteStream(
    path.join(distFolderPath, 'bundle.css'),
  );

  for (const bundleChunk of bundleChunks) {
    bundleStream.write(bundleChunk);
  }

  bundleStream.close();
}

initScript();
