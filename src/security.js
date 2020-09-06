//https://medium.com/@nodepractices/were-under-attack-23-node-js-security-best-practices-e33c146cb87d

// rate limiter
//https://www.npmjs.com/package/express-rate-limit
rateLimit = require("express-rate-limit");
exports.limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});


/**
 * 11. Support blacklisting JWT tokens
 * https://www.digitalocean.com/community/tutorials/api-authentication-with-json-web-tokensjwt-and-passport
 */



const blacklist = require('express-jwt-blacklist');

blacklist.configure({
  tokenId: 'jti',
  strict: true,
  store: {

    type: 'memcached',
    host: '127.0.0.1',
    port: 11211,
    keyPrefix: 'mywebapp:',
    options: {
      timeout: 1000
    }
  }
});

// app.use(jwt({
//   secret: 'my-secret',
//   isRevoked: blacklist.isRevoked
// }));


// app.get('/logout', (req, res) => {
//   blacklist.revoke(req.user)
//   res.sendStatus(200);
// });

/**
 * app.use(limiter); 
 * app.use("/api/", apiLimiter);
 
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // start blocking after 5 requests
  message:
    "Too many accounts created from this IP, please try again after an hour"
});
app.post("/create-account", createAccountLimiter, function(req, res) {
  //...
});
 */

// use string input sanitization to prevent sql injection attack
//https://stackoverflow.com/questions/46718772/how-i-can-sanitize-my-input-values-in-node-js

// prevent xss (cross-site scripting)
exports.helmet = require("helmet");
  //app.use(helmet());

/**
 * Avoid using the Node.js crypto library for handling passwords, use Bcrypt
 *
 */

/**
 * https://github.com/component/escape-html
 */

/**
 * Sanitization
 * https://flaviocopes.com/express-sanitize-input/
 * https://github.com/component/escape-html
 * https://lockmedown.com/5-steps-handling-untrusted-node-js-data/
 */
