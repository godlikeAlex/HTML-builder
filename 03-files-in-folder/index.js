const fs = require('node:fs/promises');
const path = require('path');
const process = require('process');

async function initScript() {
  const files = await fs.readdir(path.join(__dirname, 'secret-folder'), {
    withFileTypes: true,
  });

  files.forEach(async (file) => {
    const stats = await fs.stat(path.join(file.path, file.name));

    if (stats.isDirectory()) {
      return;
    }

    const [fileName, fileExt] = file.name.split('.');

    process.stdout.write(`${fileName} - ${fileExt} - ${stats.size} \n`);
  });
}

initScript();
