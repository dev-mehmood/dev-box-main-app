const mongoose = require('mongoose')
require('dotenv').config();
const firebaseKey = require("firebase-key");
const fs = require('fs');
const path = require('path');

const Schema = mongoose.Schema;
let isDbReady = false;

const ImportMapSchema = new Schema({
  imports: {
    type: Object
  },
  mode: {
    type: String
  }

});

const ImportMapModel = mongoose.model('import-map', ImportMapSchema);
const cache = require('../services/cache')
const uri = process.env.IMPORT_MAPS_DB_URI;
mongoose.connect(uri, { useNewUrlParser: true })
mongoose.connection.on('error', error => console.log(error));
mongoose.Promise = global.Promise;
mongoose.connection.on("open", function (ref) {
  isDbReady = true;
  console.log("Connected to mongo server.");

})

module.exports = {
  decodeImports: (data) => {
    const imports = {}
    let decoded = ''
    for (const [key, value] of Object.entries(data.imports)) {
      decoded = firebaseKey.decode(key)
      imports[decoded] = value;
    }
    return imports;
  },
  encodeImports: (data) => {
    const imports = {}
    let decoded = ''
    for (const [key, value] of Object.entries(data.imports)) {
      decoded = firebaseKey.encode(key)
      imports[decoded] = value;
    }
    return imports;
  },
  decodeKey: (key) => {
    return firebaseKey.decode(key)
  },
  encodeKey: (key) => {
    return firebaseKey.encode(key);
  },
  ImportMapModel,
  seed: (mode = 'prod') => {

    const clear = setInterval(async () => {
      if (isDbReady) {
        clearInterval(clear);
        let data;
        try {
          data = await ImportMapModel.find({ mode}).exec();
        } catch (e) {
          throw Error("Import-map.json seed fetch error");
        }

        if (!data.length) {
          // create three seeds
          ['prod','stage','review'].forEach((mod=>{
            createSeed(mod)
          }))
         
        } else {

          data.forEach(({_doc})=>{
            data.imports = module.exports.decodeImports(_doc)
            cache.set(_doc.mode, _doc)
            console.log(cache.get(_doc.mode))
          })
        }
      }

    }, 500);

    function createSeed(mode){
      const imported = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'import-map.seed.json'), 'utf8'));
      const imports = {}
      let encoded = ''
      for (const [key, value] of Object.entries(imported.imports)) {
        encoded = firebaseKey.encode(key);
        imports[encoded] = value;
      }
      
      data = {
        mode,
        imports
      }
      const importMap = new ImportMapModel(data)

      importMap.save(function (err) {
        if (err) return handleError(err);
        // saved!
      });
    }
  }
};
