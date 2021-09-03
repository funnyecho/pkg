const execa = require('execa');
const chalk = require('chalk');
const exitCode = require('../exitcode');
const fs = require('fs');
const path = require('path');

function getPackageList() {
  const { readdirSync } = fs;

  return readdirSync(resolve('packages'), { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

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
    const compileRes = compileSource(pkg);
    if (compileRes.exitCode !== exitCode.success) {
      console.log(chalk.red('failed to compile package', pkg, ' with exit code', compileRes.exitCode));
      return compileRes.exitCode;
    }
  }

  return exitCode.success;
}

function compileAllPackage() {
  return compile({ packages: getPackageList() });
}

module.exports = {
  getPackageList,
  compile,
  compileAllPackage,
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

function compileSource(pkg) {
  const res = execa.sync('tsc', [
    '-b', 'tsconfig.build.json',
    // '--force',
    // '--traceResolution',
  ], {
    preferLocal: true,
    detached: true,
    cwd: resolve('packages', pkg, 'src'),
  });

  return res;
}