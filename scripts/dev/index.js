const compiler = require('../build/compiler');

function watch() {
  return compiler.compile({
    packages: compiler.getPackageList(),
    watchMode: true,
  })
}

watch();