# json-crate
📦 minimalistic promise-based json database

json-crate is a super simple json database for quick hacks or when you
need to persist simple json files.

## Features

- Fetch specific properties from a JSON file
- Write/Update properties to a JSON file


## Installation
```
$ npm install json-crate
```

## Usage
Given a JSON file:
```json
{
  "bakery": {
    "bread": [
      "sourdough", "french baguette"
    ],
    "desert": [
      "blueberry muffins", "chocolate croissant"
    ]
  },
  "household": {
    "cleaning-products": {
      "dish-detergents": [
        "Method Dish Soap Lemon Mint", "Meyers Clean Day Liquid Dish Soap"
      ]
    }
  }
}
```

### Reading JSON data

```javascript
const { loadAt, writeAt } = require("json-crate")

// You can load a specific property
loadAt("./tmp/groceries.json", "bakery.bread").then(bread => {
  console.log(bread)
  // => ["sourdough", "french baguette"]
})

// Load an item in an array
loadAt("./tmp/groceries.json", "bakery.bread[1]").then(bread => {
  console.log(bread)
  // => "french baguette"
})
```

json-crate uses lodash"s [object path](https://lodash.com/docs/4.17.4#get) notation to read and write nested properties in the json file.

### Writing JSON data

You can create new nested properties or update existing ones using the same [object notation](https://lodash.com/docs/4.17.4#set) as before.

```javascript
writeAt("./tmp/groceries.json", "frozen.ice-cream", [
  "chocolate chip cookie",
  "french vanilla"
])
```

Will update our `groceries.json` file with:
```json
{
  "bakery": {
    "bread": [
      "sourdough", "french baguette"
    ],
    "desert": [
      "blueberry muffins", "chocolate croissant"
    ]
  },
  "household": {
    "cleaning-products": {
      "dish-detergents": [
        "Method Dish Soap Lemon Mint", "Meyers Clean Day Liquid Dish Soap"
      ]
    }
  },
  "frozen": {
    "ice-cream": [
      "chocolate chip cookie",
      "french vanilla"
    ]
  }
}
```

## Notes

You can think of `json-crate` as a couple of convenience wrappers for dealing with simple objects you may want to persist.

This library is not intended for production usage and does not provide any data consistency guarantees such as concurrent access, locking of any kind or indexing.

Some great use-cases for `json-crate`:
- test fixtures
- configuration files
- managing environment variables

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/nettofarah/json-crate. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Code of Conduct](https://github.com/nettofarah/json-crate/blob/master/CODE_OF_CONDUCT.md).

To run the specs check out the repo and follow these steps:

```bash
$ yarn install
$ yarn test
```

## License

The module is available as open source under the terms of the MIT License.
