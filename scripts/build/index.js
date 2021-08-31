const compiler = require('./compiler');

function run() {
  compiler.compile({
    packages: ['time', 'promise', 'context', 'logger', 'logger-sentry'],
    // packages: ['time', 'promise', 'context'],
    // packages: ['logger-sentry'],
  })
}

run();