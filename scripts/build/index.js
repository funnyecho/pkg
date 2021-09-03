const compiler = require('./compiler');

function run() {
  return compiler.compile({
    packages: compiler.getPackageList(),
    // packages: ['time', 'promise', 'context', 'logger'],
    // packages: ['logger'],
  })
}

run();