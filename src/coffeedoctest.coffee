###
# coffeedoctest #
Copyright (c) Lawrence S. Maccherone, Jr., 2012

> It's not about testing your code with your documentation, but more the other way around.
> Make sure that the examples in your documentation are current with your code.

Credits:

* **coffeedoc** by Omar Khan (http://omarkhan) starting point for coffeedoctest
* **showdown.js** for extracting code blocks from markdown
###

# Imports
fs = require('fs')
path = require('path')
{spawn, exec} = require('child_process')
showdown = require(__dirname + '/../vendor/showdown_codeextractor').Showdown
functions = require(__dirname + '/functions')
parsers = require(__dirname + '/parsers')

# Command line options
OPTIONS =
    '--commonjs    ': 'Use if target scripts use CommonJS for module loading (default)'
    '--requirejs   ': 'Use if target scripts use RequireJS for module loading'
    '--readme      ': 'Use if you want it to run tests in your README.md file'
    '--clean       ': 'Deletes temporary files even if there is an error'

help = ->
    ### Show help message and exit ###
    console.log('Usage: coffeedoctest [options] [targets]')
    console.log('   or: coffeedoctest . (scans all .coffee files from the current directory and down)\n')
    console.log('Options:')
    for flag, description of OPTIONS
        console.log('    ' + flag + ': ' + description)
    process.exit()

opts = process.argv[2...process.argv.length]
if opts.length == 0 then help()

outputdir = 'coffeedoctest_temp'
readme = false
parser = null
noErrors = true
forceClean = false
if process.platform == "win32"
  pathDelimiter = '\\'
else
  pathDelimiter = '/'

while opts[0]? and opts[0].substr(0, 1) == '-'
    o = opts.shift()
    switch o
        when '-h', '--help'
            help()
        when '--commonjs'
            parser = new parsers.CommonJSParser()
        when '--requirejs'
            parser = new parsers.RequireJSParser()
        when '--readme'
            readme = true
        when '--clean'
            forceClean = true

if not parser?
    parser = new parsers.CommonJSParser()
    
if opts.length == 0 and not readme
    opts = ['.']

test = (testFileName, expectedResultsArray, resultsContextArray) ->
  ###
  Helper function to run the test and check the output
  ###
  command = 'coffee ' + testFileName
  exec(command, (error, stdout, stderr) ->
    if stderr.length > 0
      console.log("Stderr exec'ing command '#{command}'...\n" + stderr)
    if error?
      console.log('exec error: ' + error)
    actualResultsArray = stdout.split('\n')
    for expectedResult, i in expectedResultsArray
      actualResult = actualResultsArray[i]
      if trim(actualResult) != trim(expectedResult)
        if noErrors
          noErrors = false
          console.log('\n*** ERRORS FOUND IN YOUR DOCUMENTATION ***')
        console.log("\nActual does not match expected when running #{testFileName}")
        console.log('Expected: ' + expectedResult)
        console.log('Actual  : ' + actualResult)
        console.log('Near...')
        console.log(resultsContextArray[i])
  )
  
trim = (val) ->
  return if String::trim? then val.trim() else val.replace(/^\s+|\s+$/g, "")

extractCode = (obj, codeArray) ->
    ###
    Helper function that pulls code blocks out of the markdown and pushes them onto codeArray
    ###
    if obj.docstring
        codeBlock = showdown.extractCodeBlocks(obj.docstring)
        codeArray.push(codeBlock)
    return null
    
    
rm = (target) ->
    if fs.statSync(target).isDirectory()
        rm(path.join(target, p)) for p in fs.readdirSync(target)
        fs.rmdirSync(target)
    else
        fs.unlinkSync(target)
        
cleanOutputDir = (outputdir) ->
    if path.existsSync(outputdir)
        rm(outputdir)

# clean output before trying to find .coffee files
cleanOutputDir(outputdir)



# Get README.md file paths
readmeFilenames = []
if readme
    rootFilenames = fs.readdirSync('.')
    readmeFilenames = (r for r in rootFilenames when r.toLowerCase() == 'readme.md')

# Get source file paths
getSourceFiles = (target, a) ->
    if not a?
        a = []
    if path.extname(target) == '.coffee'
        a.push(target)
    else if fs.statSync(target).isDirectory() and target != outputdir
        getSourceFiles(path.join(target, p), a) for p in fs.readdirSync(target)

sources = []    
getSourceFiles(o, sources) for o in opts

if sources.length > 0 or readmeFilenames.length > 0
    # Make output directory
    fs.mkdirSync(outputdir, '755')
    
    # Write package.json
    packageJSONFileName = './package.json'
    packageJSONFileContents = fs.readFileSync(packageJSONFileName, 'utf-8')
    packageJSON = JSON.parse(packageJSONFileContents)
    packageJSON.main = '../' + packageJSON.main
    outputPackageJSON = path.join(outputdir, 'package.json')
    fs.writeFileSync(outputPackageJSON, JSON.stringify(packageJSON))


if readmeFilenames.length > 0
    for readmeFilename, idx in readmeFilenames
        readmeFile = fs.readFileSync(readmeFilename, 'utf-8')
        
        # Extract the code from the source
        codeArray = []
        extractCode({docstring:readmeFile}, codeArray)

        # Write to file
        if codeArray.length > 0
          # Write the file
          testFile = codeArray.join('\n')
          testFileName = path.join(outputdir, readmeFilename + '_coffeedoctest.coffee')
          fs.writeFileSync(testFileName, testFile)
          
          # Separate the expected results and save it
          expectedResultsArray = []
          resultsContextArray = []
          lines = testFile.split('\n')
          for line, i in lines
            trimmedLine = trim(line)
            if trimmedLine.substr(0, 1) == '#'
              expectedResultsArray.push(trimmedLine.replace(/^#\s*/g, ''))
              resultsContextArray.push('    ' + lines[Math.max(0, i-4)...i+1].join('\n    '))
          expectedResultsFilename = path.join(outputdir, readmeFilename + '_expectedresults.txt')
          
          # Run the file capturing its output
          test(testFileName, expectedResultsArray, resultsContextArray)

if sources.length > 0
    modules = []       
    
    # Iterate over source scripts
    source_names = (s.replace(/\.coffee$/, '') for s in sources)
    for source, idx in sources
        script = fs.readFileSync(source, 'utf-8')

        # Fetch documentation information
        documentation =
            filename: source_names[idx]
            module_name: path.basename(source)
            module: functions.documentModule(script, parser)

        # Check for classes inheriting from classes in other modules
        for cls in documentation.module.classes when cls.parent
            clspath = cls.parent.split('.')
            if clspath.length > 1
                prefix = clspath.shift()
                if prefix of documentation.module.deps
                    module_path = documentation.module.deps[prefix]
                    if path.dirname(source) + '/' + module_path in source_names
                        cls.parent_module = module_path
                        cls.parent_name = clspath.join('.')
        
        # Extract the code from the source
        codeArray = []
        extractCode(documentation.module, codeArray)
        for c in documentation.module.classes
            extractCode(c, codeArray)
            extractCode(m, codeArray) for m in c.staticmethods
            extractCode(m, codeArray) for m in c.instancemethods
        extractCode(f, codeArray) for f in documentation.module.functions

        # Write to file
        if codeArray.length > 0
          # If source is in a subfolder, make a matching subfolder in outputdir
          if path.basename(source) != source
              docpath = outputdir
              sourcepath = source.split(pathDelimiter)
              for dir in sourcepath[0...sourcepath.length - 1]
                  docpath = path.join(docpath, dir)
                  if not path.existsSync(docpath)
                      fs.mkdirSync(docpath, '755')


          # Write the file
          testFile = codeArray.join('\n')
          testFileName = path.join(outputdir, documentation.filename + '_coffeedoctest.coffee')
          fs.writeFileSync(testFileName, testFile)
          
          # Separate the expected results and save it
          expectedResultsArray = []
          resultsContextArray = []
          lines = testFile.split('\n')
          for line, i in lines
            trimmedLine = trim(line)
            if trimmedLine.substr(0, 1) == '#'
              expectedResultsArray.push(trimmedLine.replace(/^#\s*/g, ''))
              resultsContextArray.push('    ' + lines[Math.max(0, i-4)...i+1].join('\n    '))
          expectedResultsFilename = path.join(outputdir, documentation.filename + '_expectedresults.txt')
#           expectedResultsFile = expectedResultsArray.join('\n')
#           fs.writeFileSync(expectedResultsFilename, expectedResultsFile)
          
          # Run the file capturing its output
          test(testFileName, expectedResultsArray, resultsContextArray)
          
        # Save to modules array for the index page
        modules.push(documentation)

    process.on('exit', () ->   
      if noErrors
        console.log('No documentation errors found')
      if noErrors or forceClean
        cleanOutputDir(outputdir)
    )
else if not readme
  console.log('No source files found')
            