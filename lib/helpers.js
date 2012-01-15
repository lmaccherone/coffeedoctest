(function() {

  /*
  AST helper functions
  ====================
  
  Useful functions for dealing with the CoffeeScript parse tree.
  */

  var coffeescript;
  var __hasProp = Object.prototype.hasOwnProperty, __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (__hasProp.call(this, i) && this[i] === item) return i; } return -1; };

  coffeescript = require('coffee-script');

  exports.getNodes = function(script) {
    /*
        Generates the AST from coffeescript source code.  Adds a 'type' attribute
        to each node containing the name of the node's constructor, and returns
        the expressions array
    */
    var root_node;
    root_node = coffeescript.nodes(script);
    root_node.traverseChildren(false, function(node) {
      return node.type = node.constructor.name;
    });
    return [].concat(root_node.expressions, root_node);
  };

  exports.getFullName = function(variable) {
    /*
        Given a variable node, returns its full name
    */
    var name, p;
    name = variable.base.value;
    if (variable.properties.length > 0) {
      name += '.' + ((function() {
        var _i, _len, _ref, _results;
        _ref = variable.properties;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          p = _ref[_i];
          _results.push(p.name.value);
        }
        return _results;
      })()).join('.');
    }
    return name;
  };

  exports.getAttr = function(node, path) {
    /*
        Safe function for looking up paths in the AST. If an attribute is
        undefined at any part of the path, an object with is returned with the
        type attribute set to null
    */
    var attr, index, nullObj, _i, _len, _ref;
    path = path.split('.');
    nullObj = {
      type: null
    };
    for (_i = 0, _len = path.length; _i < _len; _i++) {
      attr = path[_i];
      index = null;
      if (__indexOf.call(attr, '[') >= 0) {
        _ref = attr.split('['), attr = _ref[0], index = _ref[1];
        index = index.slice(0, -1);
      }
      node = node[attr];
      if (!(node != null)) return nullObj;
      if (index != null) {
        node = node[parseInt(index)];
        if (!(node != null)) return nullObj;
      }
    }
    return node;
  };

}).call(this);
