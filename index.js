const { find, exec } = require('shelljs')
const { uniq, get, set, clone } = require('lodash')
const fs = require('fs-promise')
const validator = require('package-json-validator').PJV

function loadPackageJSON() {
  return fs.readJSON('./package.json')
}

function usingYarn() {
  return find('./yarn.lock')[0].includes('yarn.lock')
}

function installDependencies() {
  const prefix = usingYarn() ? 'yarn add' : 'npm install'

  console.log('Installing prettier')
  exec(`${prefix} --dev prettier`)

  console.log('Installing lint-staged')
  exec(`${prefix} --dev lint-staged`)

  console.log('Installing husky')
  exec(`${prefix} --dev husky`)
}

function setupCommitHook(originalPkg) {
  let pkg = clone(originalPkg)

  const prettierConfig = 'prettier --write --single-quote --no-semi'
  const path = ['lint-staged', '*.js']
  const config = get(pkg, path)

  const stageConfig = uniq([...config, prettierConfig, 'git add'])
  set(pkg, path, stageConfig)
  set(pkg, 'scripts.precommit', 'lint-staged')

  return pkg
}

function validateConfig(pkg) {
  return validator.validate(JSON.stringify(pkg), 'npm')
}

function updatePackage(newPackage) {
  return fs.writeJson('./package.json', newPackage)
}

installDependencies()
loadPackageJSON().then(pkg => {
  const newPkg = setupCommitHook(pkg)
  const validation = validateConfig(newPkg)

  if (validation.valid) {
    return updatePackage(newPkg)
  } else {
    return Promise.reject('Invalid package.json configuration', validation)
  }
})
