const path = require('path');
const fs = require('node:fs/promises');

async function initScript() {
  const targetFolderPath = path.join(__dirname, 'files');
  const copyFolderPath = path.join(__dirname, 'files-copy');

  await fs.mkdir(copyFolderPath, {
    recursive: true,
  });

  const files = await fs.readdir(targetFolderPath, { withFileTypes: true });

  files.forEach(({ name }) => {
    fs.copyFile(
      path.join(targetFolderPath, name),
      path.join(copyFolderPath, name),
    );
  });
}

initScript();
