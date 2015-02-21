var Promise = require('bluebird');
var http    = require('http');

/**
 * Default HTTP Options for the Namara API.
 * @type {Object}
 */
var OPTS = {
    host: 'api.namara.io',
    port: 80,
    prefix: '/v0/data_sets/',
    method: 'GET',
    headers: {
      'User-Agent': 'Namara-Node/0.1.0'
    }
  };

/**
 * Constructor
 * @param string    apiKey    Namara API key.
 * @param boolean   debug     Enable debug mode when true.
 */
function Namara (apiKey, debug) {
  this.apiKey = apiKey !== null ? apiKey : null;
  this.debug  = debug !== null ? debug : false;
  if (this.apiKey === null) {
    this.apiKey = process.env.NAMARA_APIKEY;
  }
}

/**
 * Get
 * Makes a request for a dataset from the Namara API.
 * @param  string   dataset   [description]
 * @param  string   version   [description]
 * @param  object   options   [description]
 * @return promise            [description]
 */
Namara.prototype.get = function (dataset, version, options) {
  var req;

  // TODO: Incorporate Defaults instead of false
  if(typeof options === undefined) {
    options = false;
  }
  // Do validation for dataset, version and options.
  if (this.debug) {
    console.log('Namara: Opening request to http://' + OPTS.host + OPTS.prefix + dataset + '/data/' + version);
    if (options) {
      console.log('Options Specified: ' + options);
    }
  }

  OPTS.path = '' + OPTS.prefix + dataset + '/data/' + version + '?api_key=' + this.apiKey;

  req = http.request(OPTS, function (res) {
    var json;
    res.setEncoding('utf8');
    json = '';

    res.on('data', function (d) {
      return json += d;
    });

    return res.on('end', function () {
      if (res.statusCode !== 200) {
        return console.log('error');
      } else {
        json = JSON.parse(json);
        return console.log(json);
      }
    });
  });

  req.end();

};

module.exports = Namara;
