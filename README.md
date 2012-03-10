# coffeedoctest #
Copyright (c) Lawrence S. Maccherone, Jr., 2012

> It's less about testing your code with your documentation, but more the other way around.
> Make sure that the examples in your documentation stay current with your code.

Credits:

* [**coffeedoc**](https://github.com/omarkhan/coffeedoc) by [Omar Khan](http://omarkhan.me) starting point for coffeedoctest
* **showdown.js** for extracting code blocks from markdown

If you've spent any time working in Python, then you are probably familiar with 
[doctest](http://docs.python.org/release/2.5.2/lib/module-doctest.html). The examples you add to document
your project are like a map to the secret treasure that your users will find when they are able to easily
use your library/API/tool/etc. But if the examples are wrong, it's like labeling the map with 
"promised land" right over the spot where it should say, "there be dragons".

**coffeedoctest** is a way to test your documentation with your code... to make sure the map matches the terrain.

I'm building upon Omar Khan's awesome [coffedoc](https://github.com/omarkhan/coffeedoc) tool and using the 
same conventions. The text within multiline comments is interpreted as markdown markup. Any code blocks (each line 
that starts with 4 or more spaces) within this markdown is pulled out as "test" code. Any single line comments 
within these code blocks are treated as your expected output. When this example code runs, it should generate 
the results shown in the single line comments.

## Example ##

Let's say you have this awesome little library

    ###
    Super square
    
    Usage:
        
        square = require('square').square
        console.log(square(5))
        # 36
        
    Not only will it square 5 but it will square other numbers.
    
        console.log(square(4))
        # 16
    ###
    exports.square = (n) -> n * n   
    
and you run coffeedoctest

    coffeedoctest square
    
you should see the following output

    *** ERRORS FOUND IN YOUR DOCUMENTATION ***
    
    Actual does not match expected when running coffeedoctest_temp/square_coffeedoctest.coffee
    Expected: 36
    Actual  : 25
    Near...
        square = require('square').square
        console.log(square(5))
        # 36

Notice how you are able to sprinkle non-test narrative in your markdown and it is ignored. Markdown
code blocks in all of the properly-positioned multi-line comments found in the 
module (file) are  concatenated into one test as if there was no intervening narrative or production 
code. Following coffeedoc convention, the proper place for these is either at the top of the module or
between the declaration and body of a class, function, etc. Each module (file) is tested
independently.

Note that coffeedoctest will not attempt to test codeblocks that are found within ordered or unordered
lists. If you want to put some examples in that you don't want tested, you can use this behavior.

## Usage ##

If you type `coffeedoctest` with no options or `coffeedoctest -h`, you'll get the help.

    Usage: coffeedoctest [options] [targets]
       or: coffeedoctest . (scans all .coffee files from the current directory and down)
    
    Options:
        --commonjs    : Use if target scripts use CommonJS for module loading (default)
        --requirejs   : Use if target scripts use RequireJS for module loading
        --readme      : Use if you want it to run tests in your README.md file
        --clean       : Deletes temporary files even if there is an error
        --requirepath : Specifies "require" search root (default "./")
        
**coffeedoctest** will create a modified version of your package.json file in the coffeedoctest temporary 
working directory. This makes it possible for your example code to do simple `require`s so you don't 
clutter your example code with relative paths that may not apply to your users' usage.

A typical usage might look like this:

    coffeedoctest --readme src

## Installation ##

    sudo npm install -g coffeedoctest
    