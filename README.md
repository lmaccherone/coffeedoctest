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
use your library/API/tool/etc. But if the examples are wrong, it's sorta like labeling the map with 
"promised land" right over the spot where it should say, "there be dragons".

**coffeedoctest** is a way to test your documentation with your code... to make sure the map matches reality.

I'm building upon Omar Khan's coffedoc tool and using the same conventions.

## Usage ##

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
        
