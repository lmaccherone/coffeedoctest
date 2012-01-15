(function() {

  /*
  # CoffeeDocTest #
  
  > It's not about testing your code with your documentation, but more the other way around.
  > Make sure that the examples in your documentation are current with your code.
  
  Credits:
  
  * **coffeedoc** starting point for coffeedoctest
  * **showdown.js** for extracting code blocks from markdown
  */

  var OPTIONS, allSources, c, cleanOutputDir, cls, clspath, codeArray, dir, docpath, documentation, exec, expectedResultsArray, expectedResultsFilename, extractCode, f, forceClean, fs, functions, getSourceFiles, help, i, idx, line, lines, m, module_path, modules, noErrors, o, opts, outputdir, parser, parsers, path, pathDelimiter, prefix, readme, requirePath, resultsContextArray, rm, s, script, scriptCopyFilename, showdown, source, source_names, sourcepath, sources, spawn, test, testFile, testFileName, trim, trimmedLine, _i, _j, _k, _l, _len, _len10, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _n, _o, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
  var __hasProp = Object.prototype.hasOwnProperty, __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (__hasProp.call(this, i) && this[i] === item) return i; } return -1; };

  fs = require('fs');

  path = require('path');

  _ref = require('child_process'), spawn = _ref.spawn, exec = _ref.exec;

  showdown = require(__dirname + '/../vendor/showdown_codeextractor').Showdown;

  functions = require(__dirname + '/functions');

  parsers = require(__dirname + '/parsers');

  OPTIONS = {
    '--commonjs    ': 'Use if target scripts use CommonJS for module loading (default)',
    '--requirejs   ': 'Use if target scripts use RequireJS for module loading',
    '--readme      ': 'Use if you want it to run tests in your README.md file',
    '--clean       ': 'Deletes temporary files even if there is an error',
    '--requirepath ': 'Specifies "require" search root (default "./")'
  };

  help = function() {
    /* Show help message and exit
    */
    var description, flag;
    console.log('Usage: coffeedoctest [options] [targets]');
    console.log('   or: coffeedoctest . (scans all .coffee files from the current directory and down)\n');
    console.log('Options:');
    for (flag in OPTIONS) {
      description = OPTIONS[flag];
      console.log('    ' + flag + ': ' + description);
    }
    return process.exit();
  };

  opts = process.argv.slice(2, process.argv.length);

  if (opts.length === 0) help();

  outputdir = 'coffeedoctest_temp';

  readme = false;

  parser = null;

  noErrors = true;

  forceClean = false;

  if (process.platform === "win32") {
    pathDelimiter = '\\';
  } else {
    pathDelimiter = '/';
  }

  requirePath = '.' + pathDelimiter;

  while ((opts[0] != null) && opts[0].substr(0, 1) === '-') {
    o = opts.shift();
    switch (o) {
      case '-h':
      case '--help':
        help();
        break;
      case '--commonjs':
        parser = new parsers.CommonJSParser();
        break;
      case '--requirejs':
        parser = new parsers.RequireJSParser();
        break;
      case '--readme':
        readme = true;
        break;
      case '--clean':
        forceClean = true;
        break;
      case '--requirepath':
        requirePath = opts.shift();
    }
  }

  if (!(parser != null)) parser = new parsers.CommonJSParser();

  if (opts.length === 0) opts = ['.'];

  test = function(testFileName, expectedResultsArray, resultsContextArray) {
    /*
      Helper function to run the test and check the output
    */
    var command;
    command = 'coffee ' + testFileName;
    return exec(command, function(error, stdout, stderr) {
      var actualResult, actualResultsArray, expectedResult, i, _len, _results;
      if (stderr.length > 0) {
        console.log(("Stderr exec'ing command '" + command + "'...\n") + stderr);
      }
      if (error != null) console.log('exec error: ' + error);
      actualResultsArray = stdout.split('\n');
      _results = [];
      for (i = 0, _len = expectedResultsArray.length; i < _len; i++) {
        expectedResult = expectedResultsArray[i];
        actualResult = actualResultsArray[i];
        if (trim(actualResult) !== trim(expectedResult)) {
          if (noErrors) {
            noErrors = false;
            console.log('\n*** ERRORS FOUND IN YOUR DOCUMENTATION ***');
          }
          console.log("\nActual does not match expected when running " + testFileName);
          console.log('Expected: ' + expectedResult);
          console.log('Actual  : ' + actualResult);
          console.log('Near...');
          _results.push(console.log(resultsContextArray[i]));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    });
  };

  trim = function(val) {
    if (String.prototype.trim != null) {
      return val.trim();
    } else {
      return val.replace(/^\s+|\s+$/g, "");
    }
  };

  extractCode = function(obj, codeArray) {
    /*
        Helper function that pulls code blocks out of the markdown and pushes them onto codeArray
    */
    var codeBlock;
    if (obj.docstring) {
      codeBlock = showdown.extractCodeBlocks(obj.docstring);
      codeArray.push(codeBlock);
    }
    return null;
  };

  rm = function(target) {
    var p, _i, _len, _ref2;
    if (fs.statSync(target).isDirectory()) {
      _ref2 = fs.readdirSync(target);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        p = _ref2[_i];
        rm(path.join(target, p));
      }
      return fs.rmdirSync(target);
    } else {
      return fs.unlinkSync(target);
    }
  };

  cleanOutputDir = function(outputdir) {
    if (path.existsSync(outputdir)) return rm(outputdir);
  };

  cleanOutputDir(outputdir);

  getSourceFiles = function(target, a) {
    var p, _i, _len, _ref2, _results;
    if (!(a != null)) a = [];
    if (path.extname(target) === '.coffee') {
      return a.push(target);
    } else if (fs.statSync(target).isDirectory()) {
      _ref2 = fs.readdirSync(target);
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        p = _ref2[_i];
        _results.push(getSourceFiles(path.join(target, p), a));
      }
      return _results;
    }
  };

  sources = [];

  for (_i = 0, _len = opts.length; _i < _len; _i++) {
    o = opts[_i];
    getSourceFiles(o, sources);
  }

  if (sources.length > 0) {
    modules = [];
    fs.mkdirSync(outputdir, '755');
    fs.mkdirSync(path.join(outputdir, 'node_modules'), '755');
    allSources = [];
    getSourceFiles(requirePath, allSources);
    for (idx = 0, _len2 = allSources.length; idx < _len2; idx++) {
      source = allSources[idx];
      script = fs.readFileSync(source, 'utf-8');
      scriptCopyFilename = path.join(outputdir, 'node_modules', path.basename(source));
      if (path.existsSync(scriptCopyFilename)) {
        console.log("*** WARNING ***");
        console.log("  file " + (path.basename(source)) + " shows up more than once below " + requirePath + ". We're using a random one for all 'require' statements.");
      }
      fs.writeFileSync(scriptCopyFilename, script);
    }
    source_names = (function() {
      var _j, _len3, _results;
      _results = [];
      for (_j = 0, _len3 = sources.length; _j < _len3; _j++) {
        s = sources[_j];
        _results.push(s.replace(/\.coffee$/, ''));
      }
      return _results;
    })();
    for (idx = 0, _len3 = sources.length; idx < _len3; idx++) {
      source = sources[idx];
      script = fs.readFileSync(source, 'utf-8');
      documentation = {
        filename: source_names[idx],
        module_name: path.basename(source),
        module: functions.documentModule(script, parser)
      };
      _ref2 = documentation.module.classes;
      for (_j = 0, _len4 = _ref2.length; _j < _len4; _j++) {
        cls = _ref2[_j];
        if (!cls.parent) continue;
        clspath = cls.parent.split('.');
        if (clspath.length > 1) {
          prefix = clspath.shift();
          if (prefix in documentation.module.deps) {
            module_path = documentation.module.deps[prefix];
            if (_ref3 = path.dirname(source) + '/' + module_path, __indexOf.call(source_names, _ref3) >= 0) {
              cls.parent_module = module_path;
              cls.parent_name = clspath.join('.');
            }
          }
        }
      }
      codeArray = [];
      extractCode(documentation.module, codeArray);
      _ref4 = documentation.module.classes;
      for (_k = 0, _len5 = _ref4.length; _k < _len5; _k++) {
        c = _ref4[_k];
        extractCode(c, codeArray);
        _ref5 = c.staticmethods;
        for (_l = 0, _len6 = _ref5.length; _l < _len6; _l++) {
          m = _ref5[_l];
          extractCode(m, codeArray);
        }
        _ref6 = c.instancemethods;
        for (_m = 0, _len7 = _ref6.length; _m < _len7; _m++) {
          m = _ref6[_m];
          extractCode(m, codeArray);
        }
      }
      _ref7 = documentation.module.functions;
      for (_n = 0, _len8 = _ref7.length; _n < _len8; _n++) {
        f = _ref7[_n];
        extractCode(f, codeArray);
      }
      if (codeArray.length > 0) {
        if (path.basename(source) !== source) {
          docpath = outputdir;
          sourcepath = source.split(pathDelimiter);
          _ref8 = sourcepath.slice(0, (sourcepath.length - 1));
          for (_o = 0, _len9 = _ref8.length; _o < _len9; _o++) {
            dir = _ref8[_o];
            docpath = path.join(docpath, dir);
            if (!path.existsSync(docpath)) fs.mkdirSync(docpath, '755');
          }
        }
        testFile = codeArray.join('\n');
        testFileName = path.join(outputdir, documentation.filename + '_coffeedoctest.coffee');
        fs.writeFileSync(testFileName, testFile);
        expectedResultsArray = [];
        resultsContextArray = [];
        lines = testFile.split('\n');
        for (i = 0, _len10 = lines.length; i < _len10; i++) {
          line = lines[i];
          trimmedLine = trim(line);
          if (trimmedLine.substr(0, 1) === '#') {
            expectedResultsArray.push(trimmedLine.replace(/^#\s*/g, ''));
            resultsContextArray.push('    ' + lines.slice(i - 4, (i + 1)).join('\n    '));
          }
        }
        expectedResultsFilename = path.join(outputdir, documentation.filename + '_expectedresults.txt');
        test(testFileName, expectedResultsArray, resultsContextArray);
      }
      modules.push(documentation);
    }
    process.on('exit', function() {
      if (noErrors) console.log('No documentation errors found');
      if (noErrors || forceClean) return cleanOutputDir(outputdir);
    });
  } else {
    console.log('No source files found');
  }

}).call(this);
