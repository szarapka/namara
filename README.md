Namara
======

[![npm version](https://badge.fury.io/js/namara.svg)](http://badge.fury.io/js/namara)

The unofficial node.js client for the Namara Open Data service. [namara.io](http://namara.io)

## Installation

```bash
npm install namara
```

## Usage

### Instantiation

You need a valid API key in order to access Namara (you can find it in your My Account details on namara.io).

```javascript
var Namara = require('namara');

var namara = new Namara('{YOUR_API_KEY}');
```

You can also optionally enable debug mode by passing a second argument:

```javascript
var namara = new Namara('{YOUR_API_KEY}', true);
```

### Getting Data

To make a basic request to the Namara API you can call `get` on your instantiated object and pass it the ID of the dataset you want and the ID of the version of the data set:

```javascript
namara.get('18b854e3-66bd-4a00-afba-8eabfc54f524', 'en-2')
.then(function (data) {
  console.log(data);
})
.error(function (e) {
  // Depending on how Namara feels you may need e.message
  // or e.error for a readable message.
  console.log('Stop Breaking Shit, idiot: ' + e.error);
});
```

(All `get` requests return [promises](https://promisesaplus.com/) by default.)

Without a third options argument passed, this will return data with the Namara default offset (0) and limit (10) applied. To specify options, you can pass an options argument:

```javascript
var options = {
  offset: 0,
  limit: 150
};

namara.get('18b854e3-66bd-4a00-afba-8eabfc54f524', 'en-2', options)
.then(function (data) {
  console.log(data);
})
.error(function (e) {
  console.log('Stop Breaking Shit, idiot: ' + e.error);
});
```

If you'd like to use a callback instead, the following is supported:

```javascript
namara.get('18b854e3-66bd-4a00-afba-8eabfc54f524', 'en-2', options, function (err, data) {
  if(err) console.log(err);
  ...
});
```

You can also pass the callback as the third argument:

```javascript
namara.get('18b854e3-66bd-4a00-afba-8eabfc54f524', 'en-2', function (err, data) {
  if(err) console.log(err);
  ...
});
```

### Options

All [Namara data options](http://namara.io/#/api) are supported.

**Basic options**

```javascript
var options = {
  select: 'p0,p1',
  where: 'p0 = 100 AND nearby(p3, 43.25, -123.1, 10km)',
  offset: 0,
  limit: 10,
}
```

**Aggregation options**
Only one aggregation option can be specified in a request, in the case of this example, all options are illustrated, but passing more than one in the options object will throw an error.

```javascript
var options = {
  offset: 0,
  limit: 10,
  aggregation: {
    sum: 'p0',
    avg: 'p0',
    min: 'p0',
    max: 'p0',
    count: '*',
    geocluster: 'p3, 10',
    geobounds: 'p3'
  }
}
```

## License

The MIT License (MIT)

Copyright (c) 2015 Scott Szarapka

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
