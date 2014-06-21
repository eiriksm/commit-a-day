var should = require('should');
var http = require('http');
var requireDir = require('require-dir');
var util = require('util');

var c = require('..').init;
var plugins = requireDir('../plugins');

describe('App export and init', function() {
  it('Should export a function', function() {
    c.should.be.an.instanceOf(Function);
  });
  it('Should throw an error if passing in empty config.', function(done) {
    c(null, function(e) {
      e.message.should.equal('This is a no username found Error.');
      done();
    });
  });

  // Test that all plugins export a function with two parameters.
  Object.keys(plugins).forEach(function(n) {
    var desc = util.format('Should export a correct plugin for plugin "%s"', n);
    it(desc, function() {
      plugins[n].should.be.an.instanceOf(Function);
      plugins[n].length.should.equal(2);
    });
  });
});

describe('Init function', function() {
  // Start a server to serve the requests.
  var url = 'http://localhost:9876/users/%s/repos';

  var serverResponse = function(req, res) {
    res.end(JSON.stringify({ok: 'OK'}));
  };

  var s = require('http').createServer(function(req, res) {
    return serverResponse(req, res);
  });
  it('Should get connection refused on request when not listening', function(done) {
    c({url: url, user: 'eiriksm'}, function(e, r) {
      e.code.should.equal('ECONNREFUSED');
      done();
    });
  });
  it('Should init and return no repos found error when no repos are found', function(done) {
    s.listen(9876);
    c({url: url, user: 'eiriksm'}, function(e, r) {
      e.message.should.equal('No repos found.');
      done();
    });
  });
  it('Should init and loop through repos when given a good response', function(done) {
    serverResponse = function(req, res) {
      res.end(JSON.stringify([
        {
          name: 'test repo',
          fork: false,
          full_name: 'localhost/test_repo'
        }
      ]));
    };
    c({url: url, user: 'eiriksm'}, function(e, r) {
      e.message.should.equal('No more tips to show!');
      done();
    });
  });

  it('Should return something more useful when we also return a package json', function(done) {
    serverResponse = function(req, res) {
      if (req.url === '/colors') {
        // Just sending back a version of the registry at some point.
        res.end(JSON.stringify({"_id":"colors","_rev":"102-b651a59de1d753e4a27b35610415e786","name":"colors","description":"get colors in your node.js console like what","dist-tags":{"latest":"0.6.2"},"versions":{"0.3.0":{"name":"colors","description":"get colors in your node.js console like what","version":"0.3.0","author":{"name":"Marak Squires"},"repository":{"type":"git","url":"http://github.com/Marak/colors.js.git"},"engine":["node >=0.1.90"],"main":"colors","_id":"colors@0.3.0","engines":{"node":"*"},"_nodeSupported":true,"_npmVersion":"0.2.7-2","_nodeVersion":"v0.3.1-pre","dist":{"tarball":"http://registry.npmjs.org/colors/-/colors-0.3.0.tgz","shasum":"c247d64d34db0ca4dc8e43f3ecd6da98d0af94e7"},"directories":{}},"0.5.0":{"name":"colors","description":"get colors in your node.js console like what","version":"0.5.0","author":{"name":"Marak Squires"},"repository":{"type":"git","url":"git://github.com/Marak/colors.js.git"},"engine":["node >=0.1.90"],"main":"colors","_id":"colors@0.5.0","engines":{"node":"*"},"_engineSupported":true,"_npmVersion":"0.3.14","_nodeVersion":"v0.5.0-pre","directories":{},"files":[""],"_defaultsLoaded":true,"dist":{"shasum":"ac3ed125fcd8ccbb939b796117bf05d5f15c3e67","tarball":"http://registry.npmjs.org/colors/-/colors-0.5.0.tgz"}},"0.5.1":{"name":"colors","description":"get colors in your node.js console like what","version":"0.5.1","author":{"name":"Marak Squires"},"repository":{"type":"git","url":"git://github.com/Marak/colors.js.git"},"engines":{"node":">=0.1.90"},"main":"colors","_npmJsonOpts":{"file":"/Users/maraksquires/.npm/colors/0.5.1/package/package.json","wscript":false,"contributors":false,"serverjs":false},"_id":"colors@0.5.1","dependencies":{},"devDependencies":{},"_engineSupported":true,"_npmVersion":"1.0.30","_nodeVersion":"v0.4.10","_defaultsLoaded":true,"dist":{"shasum":"7d0023eaeb154e8ee9fce75dcb923d0ed1667774","tarball":"http://registry.npmjs.org/colors/-/colors-0.5.1.tgz"},"maintainers":[{"name":"marak","email":"marak.squires@gmail.com"}],"directories":{}},"0.6.0":{"name":"colors","description":"get colors in your node.js console like what","version":"0.6.0","author":{"name":"Marak Squires"},"repository":{"type":"git","url":"git://github.com/Marak/colors.js.git"},"engines":{"node":">=0.1.90"},"main":"colors","_npmUser":{"name":"marak","email":"marak.squires@gmail.com"},"_id":"colors@0.6.0","dependencies":{},"devDependencies":{},"_engineSupported":true,"_npmVersion":"1.0.106","_nodeVersion":"v0.4.12","_defaultsLoaded":true,"dist":{"shasum":"07ec10d8ac4f5a2e78f8d820e3e7832b3b463cad","tarball":"http://registry.npmjs.org/colors/-/colors-0.6.0.tgz"},"maintainers":[{"name":"marak","email":"marak.squires@gmail.com"}],"directories":{}},"0.6.0-1":{"name":"colors","description":"get colors in your node.js console like what","version":"0.6.0-1","author":{"name":"Marak Squires"},"repository":{"type":"git","url":"git://github.com/Marak/colors.js.git"},"engines":{"node":">=0.1.90"},"main":"colors","_npmUser":{"name":"marak","email":"marak.squires@gmail.com"},"_id":"colors@0.6.0-1","dependencies":{},"devDependencies":{},"_engineSupported":true,"_npmVersion":"1.0.106","_nodeVersion":"v0.4.12","_defaultsLoaded":true,"dist":{"shasum":"6dbb68ceb8bc60f2b313dcc5ce1599f06d19e67a","tarball":"http://registry.npmjs.org/colors/-/colors-0.6.0-1.tgz"},"maintainers":[{"name":"marak","email":"marak.squires@gmail.com"}],"directories":{}},"0.6.1":{"name":"colors","description":"get colors in your node.js console like what","version":"0.6.1","author":{"name":"Marak Squires"},"homepage":"https://github.com/Marak/colors.js","bugs":{"url":"https://github.com/Marak/colors.js/issues"},"keywords":["ansi","terminal","colors"],"repository":{"type":"git","url":"http://github.com/Marak/colors.js.git"},"engines":{"node":">=0.1.90"},"main":"colors","_id":"colors@0.6.1","dist":{"shasum":"59c7799f6c91e0e15802980a98ed138b3c78f4e9","tarball":"http://registry.npmjs.org/colors/-/colors-0.6.1.tgz"},"_from":".","_npmVersion":"1.2.30","_npmUser":{"name":"marak","email":"marak.squires@gmail.com"},"maintainers":[{"name":"marak","email":"marak.squires@gmail.com"}],"directories":{}},"0.6.2":{"name":"colors","description":"get colors in your node.js console like what","version":"0.6.2","author":{"name":"Marak Squires"},"homepage":"https://github.com/Marak/colors.js","bugs":{"url":"https://github.com/Marak/colors.js/issues"},"keywords":["ansi","terminal","colors"],"repository":{"type":"git","url":"http://github.com/Marak/colors.js.git"},"engines":{"node":">=0.1.90"},"main":"colors","_id":"colors@0.6.2","dist":{"shasum":"2423fe6678ac0c5dae8852e5d0e5be08c997abcc","tarball":"http://registry.npmjs.org/colors/-/colors-0.6.2.tgz"},"_from":".","_npmVersion":"1.2.30","_npmUser":{"name":"marak","email":"marak.squires@gmail.com"},"maintainers":[{"name":"marak","email":"marak.squires@gmail.com"}],"directories":{}}},"maintainers":[{"name":"marak","email":"marak.squires@gmail.com"}],"author":{"name":"Marak Squires"},"repository":{"type":"git","url":"http://github.com/Marak/colors.js.git"},"time":{"modified":"2014-02-11T19:25:41.136Z","created":"2011-03-15T10:12:18.245Z","0.3.0":"2011-03-15T10:12:18.245Z","0.5.0":"2011-03-15T10:12:18.245Z","0.5.1":"2011-09-25T13:04:44.328Z","0.6.0":"2011-12-09T11:32:57.649Z","0.6.0-1":"2011-12-09T12:35:05.501Z","0.6.1":"2013-07-26T05:49:48.513Z","0.6.2":"2013-08-21T23:14:55.906Z"},"users":{"avianflu":true,"pid":true,"vasc":true,"dodo":true,"matthiasg":true,"kevinohara80":true,"blakmatrix":true,"fgribreau":true,"kennethjor":true,"divanvisagie":true,"megadrive":true,"evanlucas":true,"rwillrich":true,"dbrockman":true,"eins78":true,"maxmaximov":true,"zonetti":true,"leesei":true,"paulj":true,"cmilhench":true,"chilts":true,"moonpyk":true,"netroy":true,"victorquinn":true,"lexa":true,"making3":true,"suziam":true,"tigefa":true,"pana":true,"spekkionu":true,"simon.turvey":true,"noopkat":true,"jonathanmelville":true,"phette23":true,"putaoshu":true,"dannynemer":true,"timur.shemsedinov":true,"ettalea":true,"jacques":true,"imdsm":true,"jasonwbsg":true,"alivesay":true,"tengisb":true,"apache2046":true,"cilindrox":true,"tarcio":true,"sayanee":true,"kerry95":true,"davidwbradford":true,"funroll":true,"newblt123":true,"starak":true,"cocopas":true,"magemagic":true,"ubi":true,"andydrew":true,"morishitter":true,"dimoreira":true,"fanchangyong":true,"jimnox":true,"wentworthzheng":true,"humantriangle":true,"bengarrett":true,"chrisyboy53":true,"zeusdeux":true,"owaz":true,"shen-weizhong":true,"scriptnull":true,"chaowi":true,"seldo":true,"edalorzo":true,"afollestad":true,"davidrlee":true,"masonwan":true,"davidchase":true},"readme":"# colors.js - get color and style in your node.js console ( and browser ) like what\u000a\u000a<img src=\"http://i.imgur.com/goJdO.png\" border = \"0\"/>\u000a\u000a\u000a## Installation\u000a\u000a    npm install colors\u000a\u000a## colors and styles!\u000a\u000a- bold\u000a- italic\u000a- underline\u000a- inverse\u000a- yellow\u000a- cyan\u000a- white\u000a- magenta\u000a- green\u000a- red\u000a- grey\u000a- blue\u000a- rainbow\u000a- zebra\u000a- random\u000a\u000a## Usage\u000a\u000a``` js\u000avar colors = require('./colors');\u000a\u000aconsole.log('hello'.green); // outputs green text\u000aconsole.log('i like cake and pies'.underline.red) // outputs red underlined text\u000aconsole.log('inverse the color'.inverse); // inverses the color\u000aconsole.log('OMG Rainbows!'.rainbow); // rainbow (ignores spaces)\u000a```\u000a\u000a# Creating Custom themes\u000a\u000a```js\u000a\u000avar colors = require('colors');\u000a\u000acolors.setTheme({\u000a  silly: 'rainbow',\u000a  input: 'grey',\u000a  verbose: 'cyan',\u000a  prompt: 'grey',\u000a  info: 'green',\u000a  data: 'grey',\u000a  help: 'cyan',\u000a  warn: 'yellow',\u000a  debug: 'blue',\u000a  error: 'red'\u000a});\u000a\u000a// outputs red text\u000aconsole.log(\"this is an error\".error);\u000a\u000a// outputs yellow text\u000aconsole.log(\"this is a warning\".warn);\u000a```\u000a\u000a\u000a### Contributors \u000a\u000aMarak (Marak Squires)\u000aAlexis Sellier (cloudhead)\u000ammalecki (Maciej Maâecki)\u000anicoreed (Nico Reed)\u000amorganrallen (Morgan Allen)\u000aJustinCampbell (Justin Campbell)\u000aded (Dustin Diaz)\u000a\u000a\u000a####  , Marak Squires , Justin Campbell, Dustin Diaz (@ded)\u000a","readmeFilename":"ReadMe.md","_attachments":{}}
        ));
        return;
      }
      if (req.url.indexOf('package.json') > 0) {
        res.end(JSON.stringify({
          dependencies: {
            colors: '1'
          },
          devDependencies: {
            colors: '1'
          },
          name: 'something'
        }));
        return;
      }
      res.end(JSON.stringify([
        {
          name: 'test repo',
          fork: false,
          full_name: 'localhost/test_repo',
          default_branch: 'master'
        }
      ]));
    };
    c({url: url, rawurl: url + '.package.json', user: 'eiriksm', npm: {registry: 'http://localhost:9876'}}, function(e, r) {
      e.message.should.equal('No more tips to show!');
      done();
    });
    setTimeout(function() {
      process.stdin.emit('data', 'y' + '\n');
    }, 500);
  });
});
