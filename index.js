const { find, exec } = require('shelljs')
const { writeAt } = require('json-crate')

const usingYarn = find('./yarn.lock')[0].includes('yarn.lock')
const packageManager = usingYarn ? 'yarn' : 'npm'

const yarnPrefix = 'yarn add --dev'
const npmPrefix = 'npm install --dev'

const installPrefix = usingYarn ? yarnPrefix : npmPrefix

// TODO: check for packages?

console.log('Installing prettier')
exec(`${installPrefix} prettier`)

console.log('Installing lint-staged')
exec(`${installPrefix} lint-staged`)

console.log('Installing husky')
exec(`${installPrefix} husky`)

const lintStageConfig = writeAt('./package.json', 'lint-staged', {
  '*.js': ['prettier --write --single-quote --no-semi', 'git add']
})

lintStageConfig.then(() => {
  writeAt('./package.json', 'scripts.precommit', 'lint-staged')
})
