function mapValues (obj, f) {
  const res = {};
  Object.keys(obj).forEach(key => {
    res[key] = f(obj[key], key)
  });
  return res
}

function namespace (module, types) {
  return mapValues(types, (names, type) => {
    return mapValues(names, name => {
      return module + ':' + type + ':' + name
    })
  })
}

/**
 * Usage:
 *
 *
```javascript
 // Define mutation types
 const types = namespace('product', {
   getters: {
     all: 'ALL'
   },
   actions: {
     fetch: 'FETCH'
   },
   mutations: {
     add: 'ADD',
     remove: 'REMOVE',
     filter: 'FILTER',
     sort: 'SORT'
   }
 })

 // output
 console.log(types);
```
 *
 */

export default { namespace };
