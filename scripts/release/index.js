const execa = require('execa');
const chalk = require('chalk');
const exitCode = require('../exitcode');

const compiler = require('../build/compiler');

function run() {
  const compileRes = compiler.compileAllPackage();
  if (compileRes !== exitCode.success) return compileRes;

  const publishRes = execa.sync('yarn', [
    'workspaces', 'foreach', '--no-private',
    'npm', 'publish', '--access', 'public', '--tolerate-republish',
  ], {
    preferLocal: true,
    detached: true,
  });

  if (publishRes.exitCode !== exitCode.success) {
    console.log(chalk.red('failed to publish package', ' with exit code', publishRes.exitCode));
    return publishRes.exitCode;
  }

  return exitCode.success;
}

run();