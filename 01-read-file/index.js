const fs = require('fs');
const path = require('path');

const pathToFile = path.join(__dirname, 'text.txt');
const readStream = fs.createReadStream(pathToFile, 'UTF-8');

let data = '';

readStream.on('data', (chunk) => (data += chunk));
readStream.on('end', () => process.stdout.write(data));
