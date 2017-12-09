const { uniq, get, set, clone } = require('lodash')
const fs = require('fs-promise')
const hasYarn = require('has-yarn')
const validator = require('package-json-validator').PJV
const Listr = require('listr')
const inquirer = require('inquirer')
const chalk = require('chalk')

function loadPackageJSON() {
  return fs.readJSON('./package.json')
}

function installDep(packageManager, name) {
  const { exec } = require('shelljs')
  const prefix =
    packageManager === 'yarn' ? 'yarn add --dev' : 'npm install --save-dev'

  return new Promise((resolve, reject) => {
    exec(`${prefix} ${name}`, { silent: true }, function(code, out, err) {
      resolve()
    })
  })
}

function setupCommitHook(originalPkg) {
  let pkg = clone(originalPkg)

  const path = ['lint-staged', '*.js']
  const config = get(pkg, path) || []

  const stageConfig = uniq(config.concat(['prettier --write', 'git add']))
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

function createPrettierConf(conf) {
  return fs.writeFile('.prettierrc', conf)
}

const tasks = new Listr([
  {
    title: 'Installing Dependencies',
    task: ctx => {
      return new Listr([
        {
          title: 'prettier',
          task: () => installDep(ctx.packageManager, 'prettier')
        },

        {
          title: 'husky',
          task: () => installDep(ctx.packageManager, 'husky')
        },

        {
          title: 'lint-staged',
          task: () => installDep(ctx.packageManager, 'lint-staged')
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
        throw new Error(`Invalid package.json configuration: ${validation}`)
      }
    }
  },
  {
    title: 'Updating package.json',
    task: ctx => {
      return updatePackage(ctx.pkg)
    }
  },
  {
    title: 'Storing your default configuration',
    task: ctx => {
      return createPrettierConf(ctx.prettierConf)
    }
  }
])

const questions = [
  {
    type: 'list',
    name: 'packageManager',
    message: 'Which package manager are you using?',
    choices: () => (hasYarn() ? ['yarn', 'npm'] : ['npm', 'yarn']),
    default: () => (hasYarn() ? 'yarn' : 'npm'),
    validate: choice => {
      if (choice === 'yarn' && !hasYarn()) {
        return false
      }

      return true
    }
  },
  {
    type: 'editor',
    name: 'prettierConf',
    message: "Let's choose your defaults for prettier",
    default: `# .prettierrc
# Use this file to define your defaults for prettier
# For a list of all available options:
# https://github.com/prettier/prettier#basic-configuration
printWidth: 80
singleQuote: true
semi: false
`
  }
]

module.exports = function run() {
  console.log(
    `Hi 👋 ! ${chalk.dim("Let's make your code")} ${chalk.bold('prettier')}!`
  )
  return inquirer
    .prompt(questions)
    .then(anwsers => {
      return tasks.run(anwsers)
    })
    .then(() => console.log(`You're all set!  💅🏻`))
    .catch(err => console.error(err))
}
