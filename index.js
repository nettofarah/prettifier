const { find, exec } = require('shelljs')
const { uniq, get, set, clone } = require('lodash')
const fs = require('fs-promise')
const hasYarn = require('has-yarn')
const validator = require('package-json-validator').PJV
const Listr = require('listr')

function loadPackageJSON() {
  return fs.readJSON('./package.json')
}

function installDep(name) {
  const prefix = hasYarn() ? 'yarn add' : 'npm install'
  return new Promise(resolve => {
    exec(`${prefix} --dev ${name}`, { silent: true }, resolve)
  })
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

const tasks = new Listr([
  {
    title: 'Installing Dependencies',
    task: () => {
      return new Listr([
        {
          title: 'prettier',
          task: () => installDep('prettier')
        },

        {
          title: 'husky',
          task: () => installDep('husky')
        },

        {
          title: 'lint-staged',
          task: () => installDep('lint-staged')
        }
      ])
    }
  },
  {
    title: 'Setting Up commit hook',
    task: ctx => {
      return loadPackageJSON().then(pkg => (ctx.pkg = pkg))
    }
  },
  {
    title: 'Adding rules',
    task: ctx => {
      const newPkg = setupCommitHook(ctx.pkg)
      ctx.pkg = newPkg
    }
  },

  {
    title: 'Validating package.json',
    task: (ctx, task) => {
      const validation = validateConfig(ctx.pkg)
      if (!validation.valid) {
        return Promise.reject('Invalid package.json configuration', validation)
      }
    }
  },
  {
    title: 'Updating package.json',
    task: ctx => {
      return updatePackage(ctx.pkg)
    }
  }
])

tasks.run().catch(err => {
  console.error(err)
})
