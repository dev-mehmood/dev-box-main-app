

require('dotenv').config();
const firebaseKey = require("firebase-key");
const fs = require('fs');
const path = require('path');
let { schema, model } = require('../model/importmap.model');
const { promiseImpl } = require('ejs');
const cache = require('./cache')

module.exports = {
  decodeImports: (data) => {
    const imports = {}
   
    for (const [key, value] of Object.entries(data.imports)) {
      
      imports[firebaseKey.decode(key)] = value;
    }
    return {mode: data.mode, imports}
  },
  encodeImports: (data) => {
    const imports = {}
   
    for (const [key, value] of Object.entries(data.imports)) {
     
      imports[firebaseKey.encode(key)] = value;
    }
    return {mode: data.mode, imports}
  },
  decodeKey: (key) => {
    return firebaseKey.decode(key)
  },
  encodeKey: (key) => {
    return firebaseKey.encode(key);
  },


  seed: async (mode) => {
    try {

      let data = await model.find({ mode }).exec();
      if (!data.length) {
        // create three seeds
       
        
        await createSeed(mode)
        
        return true;
      } else {
        data.forEach(({ _doc }) => {
          // decode returns to normal
          // save in cache
          cache.set(_doc.mode, module.exports.decodeImports(_doc))
          
        })
        return true;
      }

    } catch (e) {
      throw Error(e);
    }

    function createSeed(mode) {
      return new Promise((_re, _rj) => {
        const imported = JSON.parse(fs.readFileSync(path.join(__dirname, '..', `import-map.seed-${mode}.json`), 'utf8'));
        const imports = {};
        // set in in-memory cache
        cache.set(mode, imported);
        for (const [key, value] of Object.entries(imported.imports)) {

          imports[firebaseKey.encode(key)] = value;
        }

        data = {mode, imports }
        // save importmaps in database
        const importMap = new model(data)

        importMap.save(function (err) {
          if (err) _rj(err);
          cache.set()
          _re(true)
          // saved!
        });
      })

    }
  }
};
