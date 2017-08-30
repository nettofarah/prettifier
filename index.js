const { find, exec } = require('shelljs')
const { writeAt, loadAt } = require('json-crate')
const { uniq } = require('lodash')

function installDependencies() {
  const usingYarn = find('./yarn.lock')[0].includes('yarn.lock')
  const packageManager = usingYarn ? 'yarn' : 'npm'
  const prefix = usingYarn ? 'yarn add' : 'npm install'

  console.log('Installing prettier')
  exec(`${prefix} --dev prettier`)

  console.log('Installing lint-staged')
  exec(`${prefix} --dev lint-staged`)

  console.log('Installing husky')
  exec(`${prefix} --dev husky`)
}

function setupCommitHook() {
  const prettierConfig = 'prettier --write --single-quote --no-semi'
  const path = ['lint-staged', '*.js']
  const lintConfig = loadAt('./package.json', path).catch(() => [])

  return lintConfig
    .then(config => {
      const stageConfig = uniq([...config, prettierConfig, 'git add'])
      return writeAt('./package.json', path, stageConfig)
    })
    .then(() => {
      return writeAt('./package.json', 'scripts.precommit', 'lint-staged')
    })
}

installDependencies()
setupCommitHook()
