var Promise = require('bluebird');
var http    = require('http');

/**
 * Default HTTP Options for the Namara API.
 * @type Object
 */
var OPTS = {
  host: 'api.namara.io',
  port: 80,
  prefix: '/v0/data_sets/',
  method: 'GET',
  headers: {
    'User-Agent': 'Namara-Node/0.2.0'
  }
};

/**
 * Acceptable API options for Validation.
 * @type Object
 */
var acceptableOptions = {
  general: ['select','where','offset','limit',],
  aggregation: ['sum','avg','min','max','count','geocluster','geobounds']
};

/**
 * Constructor
 * @param string    apiKey    Namara API key.
 * @param boolean   debug     Enable debug mode when true.
 */
function Namara (apiKey, debug) {
  this.apiKey = apiKey !== null ? apiKey : null;
  this.debug  = debug !== null ? debug : false;
  if (this.apiKey === null) this.apiKey = process.env.NAMARA_APIKEY;
}

/**
 * Get
 * Makes a request for a dataset from the Namara API.
 * @param  string   dataset   ID of the dataset you want to get.
 * @param  string   version   Dataset version (en-0, en-1, etc.).
 * @param  object   options   http://namara.io/#/api
 * @param  function callback  Optional callback function.
 * @return promise
 */
Namara.prototype.get = function (dataset, version, options, callback) {
  var that = this;            // Preserve State
  var useCallback = false;    // By default we prefer promises.
  var req;

  // Allow callback to be passed as third argument
  if (typeof options === undefined) {
    options = false;
  } else {
    if (typeof options === 'function') {
      callback = options;
      options = false;
    }
  }

  if (callback && typeof callback === 'function') useCallback = true;

  // Let's return a promise
  return new Promise(function (resolve, reject) {


    // Setup Base Path
    OPTS.path = '' + OPTS.prefix + dataset + '/data/' + version + '?api_key=' + that.apiKey;

    // If we have options - do stuff with them
    if (options) {

      // Check for aggregations
      if (options.aggregation && Object.keys(options.aggregation).length == 1) {
        OPTS.path = '' + OPTS.prefix + dataset + '/data/' + version + '/aggregation?api_key=' + that.apiKey;
        var prop = Object.getOwnPropertyNames(options.aggregation);
        var name = prop[0];
        if(acceptableOptions.aggregation.indexOf(name) > -1) {
          var value = Object.getOwnPropertyDescriptor(options.aggregation, name);
          OPTS.path += '&operation=' + name + '(' + value.value + ')';
          delete options.aggregation;
        } else {
          throw new Error('Invalid aggregation option.');
        }
      } else if (options.aggregation && Object.keys(options.aggregation).length > 1) {
        throw new Error('Multiple aggregations are not supported.');
      }

      var props = Object.getOwnPropertyNames(options);
      props.forEach(function (name) {
        if(acceptableOptions.general.indexOf(name) > -1) {
          var value = Object.getOwnPropertyDescriptor(options, name);
          OPTS.path += '&' + name + '=' + value.value;
        } else {
          throw new Error('Invalid option.');
        }
      });
    }

    if (that.debug) {
      console.log('REQUEST: http://' + OPTS.host + OPTS.path);
    }

    req = http.request(OPTS, function (res) {
      var json = '';

      if (that.debug) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
      }
      res.setEncoding('utf8');

      res.on('data', function (d) {
        if (that.debug) {
          console.log('BODY: ' + d);
        }
        return json += d;
      });

      return res.on('end', function () {
        if (res.statusCode !== 200) {
          if (that.debug) console.log('NAMARA ERROR: ' + json);
          if (useCallback) {
            return callback(JSON.parase(json));
          } else {
            return reject(JSON.parse(json));
          }
        } else {
          json = JSON.parse(json);
          if (useCallback) {
            return callback(null, json);
          } else {
            return resolve(json);
          }
        }
      });
    });

    req.on('error', function (e) {
      if (that.debug) console.log('Error: ' + e.message);
      if (useCallback) {
        return callback(e);
      } else {
        return reject(e);
      }
    });

    req.end();
  });
};

module.exports = Namara;
