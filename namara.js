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
    'User-Agent': 'Namara-Node/0.1.0'
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
  var that = this;            // Preserve State

  if (typeof options === undefined) {
    options = false;
  }

  // Setup Base Path
  OPTS.path = '' + OPTS.prefix + dataset + '/data/' + version + '?api_key=' + this.apiKey;

  // If we have options - do stuff with them
  if (options) {

    // Check for aggregations
    if (options.aggregation && Object.keys(options.aggregation).length == 1) {
      OPTS.path = '' + OPTS.prefix + dataset + '/data/' + version + '/aggregation';
      var prop = Object.getOwnPropertyNames(options.aggregation);
      var name = prop[0];
      if(acceptableOptions.aggregation.indexOf(name) > -1) {
        var value = Object.getOwnPropertyDescriptor(options.aggregation, name);
        OPTS.path += '?' + name + '(' + value.value + ')&api_key=' + this.apiKey;
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

  if (this.debug) {
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
        return console.log('error');
      } else {
        json = JSON.parse(json);
        return console.log(json);
      }
    });
  });

  req.on('error', function (e) {
    console.log('Error: ' + e.message);
  });

  req.end();

};

module.exports = Namara;
