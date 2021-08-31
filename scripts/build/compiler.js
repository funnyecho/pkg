const execa = require('execa');
const chalk = require('chalk');
const exitCode = require('./exitcode');
const path = require('path');

function compile({ packages } = {}) {
  if (!packages || packages.length <= 0) {
    console.log(chalk.red('invalid bundle packages:', packages));
    return exitCode.fa_invalid_package;
  }

  for (let i = 0; i < packages.length; ++i) {
    const pkg = packages[i];
    if (!pkg) continue;

    console.log('cleaning:', pkg);
    const cleanRes = cleanPkg(pkg);
    if (cleanRes !== exitCode.success) {
      console.log(chalk.red('cleaning failed:', pkg, cleanRes));
      return cleanRes;
    }

    console.log('compiling:', pkg);
    const res = execa.sync('tsc', [
      '-b', 'tsconfig.build.json',
      // '--traceResolution',
    ], {
      preferLocal: true,
      detached: true,
      cwd: resolve('packages', pkg),
    });

    if (res.exitCode !== exitCode.success) {
      console.log(chalk.red('failed to compile package', pkg, ' with exit code', res.exitCode));
      return res.exitCode;
    }
  }

  return exitCode.success;
}

module.exports = {
  compile,
}

function resolve(...segments) {
  return path.resolve(__dirname, '../../', ...segments);
}

function cleanPkg(pkg) {
  const cleanRes = execa.sync('rimraf', [
    '-rf', './dist',
  ], {
    preferLocal: true,
    detached: true,
    cwd: resolve('packages', pkg),
  });

  if (cleanRes.exitCode !== exitCode.success) {
    console.log(chalk.red('failed to clean package', pkg, ' with exit code', cleanRes.exitCode));
    return cleanRes.exitCode;
  }

  return exitCode.success;
}