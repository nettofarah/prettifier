const globby = require('globby')
const IGNORE_LIST = ['!.git', '!node_modules/**']

module.exports = function(input) {
  const paths = [].concat(input).concat(IGNORE_LIST)
  console.log(input)

  globby(paths).then(files => {
    console.log(files)
  })
}
