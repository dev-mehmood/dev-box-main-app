'use strict';

/**
 * Simple in-memory cache
 * NOTE: Not recommended for production
 */

var cache = {};

module.exports = {
    set: function (key, value) {
        cache[key] = value
    },
    get: function (key) {
        return cache[key]
    }
};
