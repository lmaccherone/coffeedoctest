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
