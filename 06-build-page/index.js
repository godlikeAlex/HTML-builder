const fs = require('fs');
const fsPromises = require('node:fs/promises');
const path = require('path');

const distFolderPath = path.join(__dirname, 'project-dist');

async function initScript() {
  await fsPromises.rm(distFolderPath, { recursive: true, force: true });
  await fsPromises.mkdir(distFolderPath, { recursive: true });

  createBundleStyles('style', 'styles');
  copyFolder('assets');
  buildTemplate('template.html');
}

async function copyFolder(folderToCopy) {
  const targetFolderPath = path.join(__dirname, folderToCopy);

  await fsPromises.mkdir(path.join(distFolderPath, folderToCopy), {
    recursive: true,
  });

  const files = await fsPromises.readdir(targetFolderPath, {
    withFileTypes: true,
  });

  files.forEach(async (file) => {
    const fileStat = await fsPromises.stat(path.join(file.path, file.name));

    if (fileStat.isDirectory()) {
      return copyFolder(`${folderToCopy}/${file.name}`);
    }

    fsPromises.copyFile(
      path.join(targetFolderPath, file.name),
      path.join(distFolderPath, folderToCopy, file.name),
    );
  });
}

async function createBundleStyles(filename, src) {
  const targetFolderPath = path.join(__dirname, src);

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
    path.join(distFolderPath, `${filename}.css`),
  );

  for (const bundleChunk of bundleChunks) {
    bundleStream.write(bundleChunk);
  }

  bundleStream.close();
}

async function buildTemplate(file) {
  const placeholderRegex = /\{\{(\w+)\}\}/g;

  const templates = await retrieveAllTemplates('components');

  const targetFileStream = fs.createReadStream(
    path.join(__dirname, file),
    'utf-8',
  );

  const newFileStream = fs.createWriteStream(
    path.join(distFolderPath, 'index.html'),
  );

  targetFileStream.on('data', async (htmlChunk) => {
    const htmlChunkWithTemplates = htmlChunk.replace(
      placeholderRegex,
      (match) => templates[match] ?? match,
    );

    newFileStream.write(htmlChunkWithTemplates);
  });

  targetFileStream.on('end', () => {
    targetFileStream.close();
    newFileStream.close();
  });
}

async function retrieveAllTemplates(templatesFolder) {
  const templateFolderPath = path.join(__dirname, templatesFolder);
  const templates = {};

  try {
    await fsPromises.stat(templateFolderPath);

    const files = await fsPromises.readdir(templateFolderPath, {
      withFileTypes: true,
    });

    for (const file of files) {
      const filePath = path.join(file.path, file.name);
      const stats = await fsPromises.stat(filePath);

      if (stats.isDirectory()) {
        continue;
      }

      const htmlTemplate = await getFileContent(filePath);

      templates[`{{${path.parse(filePath).name}}}`] = htmlTemplate;
    }
  } catch (error) {
    console.log(error);
  }

  return templates;
}

function getFileContent(path) {
  return new Promise((resolve) => {
    let fileContent = '';

    const readStream = fs.createReadStream(path, 'utf-8');

    readStream.on('data', (data) => {
      fileContent += data;
    });

    readStream.on('end', () => {
      resolve(fileContent);
      readStream.close();
    });
  });
}

initScript();
