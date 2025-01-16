const readline = require('node:readline');
const fs = require('fs');
const path = require('path');
const { stdin: input, stdout: output } = require('node:process');

const pathToFile = path.join(__dirname, 'text.txt');
const rl = readline.createInterface({ input, output });
const writeableStream = fs.createWriteStream(pathToFile);

output.write('🤖: What would you like to add to the file? \n');

rl.on('line', (input) => {
  if (input === 'exit') {
    return endScript();
  }

  writeableStream.write(input);
});

rl.on('SIGINT', () => endScript());

function endScript() {
  rl.close();
  output.write('🤖: See you next time! 😉 \n');
  writeableStream.close();
}
