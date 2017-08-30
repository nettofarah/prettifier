const fs = require('fs-promise')
const { get, set, isUndefined } = require('lodash')
const mkdirp = require('mkdirp')
const getDirName = require('path').dirname

function loadAt(filePath, jsonPath) {
  return fs.readJson(filePath).then(function(json) {
    if (isUndefined(jsonPath)) {
      return json
    }

    const value = get(json, jsonPath)
    if (!isUndefined(value)) {
      return value
    } else {
      throw new Error('Invalid JSON Path')
    }
  })
}

function writeAt(filePath, jsonPath, value) {
  mkdirp.sync(getDirName(filePath))

  return fs
    .readJson(filePath)
    .then(function(json) {
      set(json, jsonPath, value)
      return fs.writeJson(filePath, json)
    })
    .catch(function(error) {
      let json = {}
      set(json, jsonPath, value)
      return fs.writeJson(filePath, json)
    })
}

module.exports = {
  loadAt: loadAt,
  writeAt: writeAt
}
