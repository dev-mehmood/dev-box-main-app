
/**
 * Creating the Routes
    Now that we have middleware for handling registration and login, let’s create routes that’ll use this middleware.
 */
const express = require('express');
const fs = require('fs')
const passport = require('passport');

const { encodeKey, decodeKey, decodeImports, encodeImports } = require('../services/helper')
const { model: ImportMapModel } = require('../model/importmap.model')
const cache = require('../services/cache');
const router = express.Router();


function deleteTempFile(path) {
    try {
        fs.unlinkSync(path)
        //file removed
    } catch (err) {
        console.error(err)
    }
}

router.get('/import-map.json', async (req, res, next) => {
    // const cache = require('../services/cache')
    let query = req.query || {};
    if (!query.mode) query.mode = 'stage'
    res.status(200).send({ imports: cache.get([query.mode]).imports })
   
});

router.patch('/import-map.json', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    // const cache = require('../services/cache');
    let body = req.body || {};
    if (!body) return res.status(400).send({ success: false, message: 'No data found' });
    if (!body.imports) return res.status(400).send({ success: false, message: 'data.imports is undefined' });

    body.mode = body.mode || 'stage'

    const imports = {}
    for (const [key, value] of Object.entries(body.imports)) {
        // encodekey converts to raw values accepted by firebase or mongoos for properites
        imports[encodeKey(key)] = value;
    }

    let data = { mode: body.mode,imports } // already endcoded and ready for db

    if (body.delete || body.deleteAll) {
        // delete all imports or some records
        data = cache.get(body.mode);
        if (body.deleteAll) {

            await ImportMapModel.findOneAndRemove({ mode: body.mode });
            cache.set(body.mode, null)

        } else {

            for (const [key, value] of Object.entries(data.imports)) {
                if (key in encodeImports(body).imports) {
                    delete data.imports[key];
                }
            }

            update(data)
            
        }

    } else if (!cache.get(body.mode)) {
        // if data is new and is not present in the cache
        const data_ = await ImportMapModel.find({ mode: body.mode }).exec();

        if (!data_) {

            save(data);

        } else {

            data.imports = { ...data_.doc.imports, ...data.imports };
            update(data)
            
        }

    } else {

        data.imports = { ...encodeImports(cache.get(body.mode)), ...data.imports };
        update(data)
       
    }
    function save( data) {

        const importMap = new ImportMapModel(data)
        importMap.save(function (err) {
            if (err) return handleError(err);
            cache.set(data.mode, { mode: data.mode, imports: body.imports });
            res.status(200).json({ success: true })
        });
    }
    function update(data) {
        ImportMapModel.update({ mode: body.mode }, data, (err, raw) => {
            cache.set(data.mode, decodeImports(data));
            res.status(200).json({ success: true })
        })
    }
});

module.exports = router;