# coffeedoctest #
Copyright (c) Lawrence S. Maccherone, Jr., 2012

Original copyright Omar Khan http://omarkhan

> It's not about testing your code with your documentation, but more the other way around.
> Make sure that the examples in your documentation are current with your code.

Credits:

* **coffeedoc** starting point for coffeedoctest
* **showdown.js** for extracting code blocks from markdown

If you come from the Python world, you are familiar with this concept. The examples you add to document
your project are like a map to the secret treasure that your users will find when they are able to easily
use your library/API/tool/etc. But if the examples are wrong, it's like labeling the map with 
"promised land" right over the spot where it should say, "there be dragons".

**coffeedoctest** is a way to test your documentation with your code... to make sure the map matches reality.

I'm building upon Omar Khan's coffedoc tool and using the same conventions. The text within multiline comments
are treated as markdown markup. Any code blocks (each line starts with 4 or more spaces spaces) within this 
markdown is pulled out as a "test". Any single line comments within these code blocks are treated as your
expected output. When this example code runs, it should generate the results shown in the single line
comments.

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
        
If you type `coffeedoctest` with no options or `coffeedoctest -h`, you'll get the help.

    Usage: coffeedoctest [options] [targets]
       or: coffeedoctest . (scans all .coffee files from the current directory and down)
    
    Options:
        --commonjs    : Use if target scripts use CommonJS for module loading (default)
        --requirejs   : Use if target scripts use RequireJS for module loading
        --readme      : Use if you want it to run tests in your README.md file
        --clean       : Deletes temporary files even if there is an error
        --requirepath : Specifies "require" search root (default "./")
        
**coffeetestdoc** will copy needed `.coffee` files into a `node_modules` folder within the the coffeedoctest temporary 
working directory. This makes it possible for your example code to do simple `require`s so you don't 
clutter your example code with relative paths that may not apply to your users' usage.

The `--requirepath <folder with modules your examples require>` option will allow you to specify a subset of your 
project tree to go into this temporary node_modules folder. If you do not specify a `--requirepath` it will copy 
all `.coffee` files it finds from the current directory down. 

        

        
