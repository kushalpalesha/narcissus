// This file was automatically generated; DO NOT EDIT.
/************************************************************************
 Copyright (c) 2011 The Mozilla Foundation.
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are
 met:

 Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.

 Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 ************************************************************************/
(function(global) {
    "use strict";



    /************************************************************************
     *  src/snapshot.js
     ************************************************************************/

//@line 1 "src/snapshot.js"
    /*
     * We want to be sure that we only use the built-in versions of standard
     * functions and methods like Object.create and Array.prototype.pop.
     * So here we make snapshots of all the system objects, and then define
     * utility functions that use them.
     *
     * It is an error if any of the built-in methods are used anywhere else
     * in dom.js after this initial snapshot.
     *
     * The utilities defined here use a functional syntax rather than the
     * OO syntax of the JS builtins.  Instead of a.map(f), we call map(a, f)
     * for example.
     *
     * See ../test/monkey.js for code that patches all the built-in
     * functions and methods to test whether we avoid using them.
     */

    function shallow_frozen_copy(o) {
      var r = {};
      Object.getOwnPropertyNames(o).forEach(function(n) {
        Object.defineProperty(r, n, Object.getOwnPropertyDescriptor(o, n));
      });
      return Object.freeze(r);
    }

    const undefined = void 0,

      // Copy the original state of constructor functions
      // This is not a complete list. I've left out error types I'm unlikely
      // to ever throw.

      Array = global.Array,
      Boolean = global.Boolean,
      Date = global.Date,
      Error = global.Error,
      Function = global.Function,
      Number = global.Number,
      Object = global.Object,
      RangeError = global.RangeError,
      RegExp = global.RegExp,
      String = global.String,
      TypeError = global.TypeError,
      WeakMap = global.WeakMap;

// callbind parameterizes the binding of `this`
// [].map(callback) -> map([], callback)
    const callbind = Function.prototype.call.bind.bind(Function.prototype.call);


// String and array generics are not defined in Node, so define them now
// if needed
    if (!String.indexOf) {
      Object.getOwnPropertyNames(String.prototype).forEach(function(m) {
        if (typeof String.prototype[m] !== "function") return;
        if (m === "length" || m === "constructor") return;
        String[m] = callbind(String.prototype[m]);
      });
    }

    if (!Array.forEach) {
      Object.getOwnPropertyNames(Array.prototype).forEach(function(m) {
        if (typeof Array.prototype[m] !== "function") return;
        if (m === "length" || m === "constructor") return;
        Array[m] = callbind(Array.prototype[m]);
      });
    }


    const
      // Some global functions.
      // Note that in strict mode we're not allowed to create new identifiers
      // named eval.  But if we give eval any other name then it does a
      // global eval instead of a local eval. I shouldn't ever need to use it,
      // so just omit it here.
      parseInt = global.parseInt,
      parseFloat = global.parseFloat,
      isNaN = global.isNaN,
      isFinite = global.isFinite,

      // Snapshot objects that hold a lot of static methods
      // We also want to make a snapshot of the static methods of Object, Array,
      // and String. (Firefox defines useful "Array generics" and "String
      // generics" that are quite helpful to us).  Since we've already bound
      // the names Object, Array, and String, we use O, A, and S as shorthand
      // notation for these frequently-accessed sets of methods.
      JSON = shallow_frozen_copy(global.JSON),
      Math = shallow_frozen_copy(global.Math),
      Proxy = shallow_frozen_copy(global.Proxy),
      O = shallow_frozen_copy(Object),
      A = shallow_frozen_copy(Array),
      S = shallow_frozen_copy(String),

      // Copy some individual static methods from types that don't
      // define very many.
      now = Date.now,

      // Note that it is never safe to invoke a method of a built-in
      // object except in code that is going to run right now. The
      // functions defined below provide a safe alternative, but mandate
      // a functional style of programming rather than an OO style.

      // Functions
      // call(f, o, args...)
      call = callbind(Function.prototype.call),
      // apply(f, o, [args])
      apply = callbind(Function.prototype.apply),
      // bind(f, o)
      bind = callbind(Function.prototype.bind),

      // WeakMap functions
      wmget = callbind(WeakMap.prototype.get),
      wmset = callbind(WeakMap.prototype.set),

      // Object functions
      hasOwnProperty = callbind(Object.prototype.hasOwnProperty),

      // Array functions are all defined as generics like A.pop, but its
      // convenient to give the most commonly-used ones unqualified
      // names.  The less-commonly used functions (and those that have
      // name collisions like indexOf, lastIndexOf and slice) can be
      // accessed on the A or S objects.
      concat = A.concat || callbind(Array.prototype.concat),
      every = A.every || callbind(Array.prototype.every),
      // Note lowercase e
      foreach = A.forEach || callbind(Array.prototype.forEach),
      isArray = A.isArray || callbind(Array.prototype.isArray),
      join = A.join || callbind(Array.prototype.join),
      map = A.map || callbind(Array.prototype.map),
      push = A.push || callbind(Array.prototype.push),
      pop = A.pop || callbind(Array.prototype.pop),
      unshift = A.unshift || callbind(Array.prototype.unshift),
      reduce = A.reduce || callbind(Array.prototype.reduce),
      sort = A.sort || callbind(Array.prototype.sort),
      filter = A.filter || callbind(Array.prototype.filter),
      splice = A.splice || callbind(Array.prototype.splice),

      // Ditto for the String generic functions
      fromCharCode = S.fromCharCode || callbind(String.prototype.fromCharCode),
      match = S.match || callbind(String.prototype.match),
      replace = S.replace || callbind(String.prototype.replace),
      search = S.search || callbind(String.prototype.search),
      split = S.split || callbind(String.prototype.split),
      substring = S.substring || callbind(String.prototype.substring),
      toLowerCase = S.toLowerCase || callbind(String.prototype.toLowerCase),
      toUpperCase = S.toUpperCase || callbind(String.prototype.toUpperCase),
      trim = S.trim || callbind(String.prototype.trim),

      // One more array-related function
      pushAll = Function.prototype.apply.bind(Array.prototype.push),

      // RegExp functions, too
      exec = callbind(RegExp.prototype.exec),
      test = callbind(RegExp.prototype.test)

    ;

// These are all unique and have their uses, particularly for formatting.
// Also, only when accessing directly from primitive wrapper (string/number) is
// the native version assured to be used.
    const toString = Object.freeze({
      // `[].join(',')`
      Array: callbind(Array.prototype.toString),
      // 'true' or 'false'
      Boolean: callbind(Boolean.prototype.toString),
      // "Sat Dec 10 2011 23:40:56 GMT-0500 (US Eastern Standard Time)"
      Date: callbind(Date.prototype.toString),
      // Works generically, `e.name + ' ' + e.message`
      Error: callbind(Error.prototype.toString),
      // unmodified source in V8, normalized in spidermonkey
      Function: callbind(Function.prototype.toString),
      // Works generically, '[object InternalClass]'
      Object: callbind(Object.prototype.toString),
      // input must be number, has optional radix parameter
      Number: callbind(Number.prototype.toString),
      // RegExp('^\s+', 'g').toString() -> '/\s+/g'
      RegExp: callbind(RegExp.prototype.toString),
      // input must be string
      String: callbind(String.prototype.toString)
    });


    /************************************************************************
     *  src/globals.js
     ************************************************************************/

//@line 1 "src/globals.js"
// These constants and variables aren't really globals.  They're all within
// the closure added by the Makefile, so they don't affect the global
// environment.  But they are visible everywhere within dom.js

// Namespaces
    const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
    const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
    const XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
    const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
    const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
    const XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";

// Anything I want to define lazily using defineLazyProperty above has
// to be a property of something; it can't just be a local variable.
// So these objects are holders for lazy properties.
    const impl = {}; // implementation construtors defined here
    const idl = {};  // interface constructors defined here


// Sometimes we need to know the document of the current script.
// So this global is the <script> element that's running if there is one.
    var currentlyExecutingScript = null;

    // Map from nodeIf to facetedValue.
    var facetedValueMap = {};


    /************************************************************************
     *  src/utils.js
     ************************************************************************/

//@line 1 "src/utils.js"
// Utility functions and other globals used throughout dom.js

    function assert(expr, msg) {
      if (!expr) {
        throw new Error("Assertion failed: " + (msg || "") + "\n" + new Error().stack);
      }
    }

// For stuff that I haven't implemented yet
    function nyi() {
      var e = new Error();
      var where = split(e.stack, "\n")[1];
      e.name = "NotYetImplemented";
      e.message = where;
      throw e;
    }

// Called by deprecated functions, etc.
    function warn(msg) {
      if (global.console) console.warn(msg);
      else if (global.print) {
        print("WARNING: " + msg);
      }
    }

// Currently this is only used to report errors when running scripts
    function error(msg) {
      if (global.console)
        if (global.console.error)
          console.error(msg);
      else if (global.print) {
        print("ERROR: " + msg);
      }
    }

// Utility functions that return property descriptors
    function constant(v) { return { value: v }; }
    function attribute(get, set) {
      if (set)
        return { get: get, set: set};
      else
        return { get: get };
    }

// some functions that do very simple stuff
// Note that their names begin with f.
// This is good for things like attribute(fnull,fnoop)
    function fnull() { return null; }
    function ftrue() { return true; }
    function ffalse() { return false; }
    function fnoop() { /* do nothing */ }

    const readonlyPropDesc = {writable:false,enumerable:true,configurable: true};
    const hiddenPropDesc = {writable: true,enumerable: false,configurable: true};
    const constantPropDesc = {writable: false,enumerable: true,configurable: false};
    const hiddenConstantPropDesc = {
      writable: false, enumerable: false, configurable: false
    };

// Set o.p to v, but make the property read-only
    function defineReadonlyProp(o,p,v) {
      readonlyPropDesc.value = v;
      O.defineProperty(o, p, readonlyPropDesc);
    }

// Set o.p to v, but make the property non-enumerable
    function defineHiddenProp(o,p,v) {
      hiddenPropDesc.value = v;
      O.defineProperty(o, p, hiddenPropDesc);
    }

// Set o.p to v, and make it constant
    function defineConstantProp(o,p,v) {
      constantPropDesc.value = v;
      O.defineProperty(o, p, constantPropDesc);
    }

// Set o.p to v, and make it constant and non-enumerable
    function defineHiddenConstantProp(o,p,v) {
      hiddenConstantPropDesc.value = v;
      O.defineProperty(o, p, hiddenConstantPropDesc);
    }

//
// Define a property p of the object o whose value is the return value of f().
// But don't invoke f() until the property is actually used for the first time.
// The property will be writeable, enumerable and configurable.
// If the property is made read-only before it is used, then it will throw
// an exception when used.
// Based on Andreas's AddResolveHook function.
//
    function defineLazyProperty(o, p, f, hidden, readonly) {
      O.defineProperty(o, p, {
        get: function() {            // When the property is first retrieved
          var realval = f();       // compute its actual value
          O.defineProperty(o, p, { // Store that value
            value: realval,
            writable: !readonly,
            enumerable: !hidden,
            configurable: true
          });
          return realval;          // And return the computed value
        },
        set: readonly ? undefined : function(newval) {
          // If the property is writable and is set before being read,
          // just replace the value and f() will never be invoked

          // Remove the line below when this bug is fixed:
          // https://bugzilla.mozilla.org/show_bug.cgi?id=703157
          delete o[p];

          O.defineProperty(o, p, {
            value: newval,
            writable: !readonly,
            enumerable: !hidden,
            configurable: true
          });
        },
        enumerable: !hidden,
        configurable: true
      });
    }


// Compare two nodes based on their document order. This function is intended
// to be passed to sort(). Assumes that the array being sorted does not
// contain duplicates.  And that all nodes are connected and comparable.
// Clever code by ppk via jeresig.
    function documentOrder(n,m) {
      return 3 - (n.compareDocumentPosition(m) & 6);
    }

// Like String.trim(), but uses HTML's definition of whitespace
// instead of using Unicode's definition of whitespace.
    function htmlTrim(s) {
      return s.replace(/^[ \t\n\r\f]+|[ \t\n\r\f]+$/g, "");
    }


    /************************************************************************
     *  src/wrapmap.js
     ************************************************************************/

//@line 1 "src/wrapmap.js"
// dom.js uses two kinds of tree node objects.  nodes (with a
// lowercase n) are the internal data structures that hold the actual
// document data. They are implemented by the files in impl/* Nodes
// (with a capital N) are the public objects that implement DOM
// interfaces and do not have any properties other than the accessor
// properties and methods defined by the DOM.  They are implemented by
// the files in idl/*
//
// Every Node must have a node to hold its actual data.
// But nodes can exist without any corresponding Node: Nodes are created
// as needed, when scripts use the DOM API to inspect the document tree.
//
// Since Node objects can't have properties, the mapping from Node to node
// is done with a WeakMap.  The mapping from node to Node is simpler:
// if a Node exists for the node, it is simply set on a property of the node.
//
// The methods in this file manage the mapping between nodes and Nodes
//

    var idlToImplMap = new WeakMap(), lastkey = {}, lastvalue = undefined;

// Return the implementation object for the DOM Node n
// This method will throw a TypeError if n is
// null, undefined, a primitive, or an object with no mapping.
// This provides basic error checking for methods like Node.appendChild().
// XXX: We used to throw NOT_FOUND_ERR here, but ms2ger's tests
// expect TypeError
    function unwrap(n) {
      // Simple optimization
      // If I ever remove or alter mappings, then this won't be valid anymore.
      if (n === lastkey)
        return lastvalue;

      try {
        var impl = wmget(idlToImplMap, n);

        // This happens if someone passes a bogus object to
        // appendChild, for example.
        if (!impl) NotFoundError();

        lastkey = n;
        lastvalue = impl;
        return impl;
      }
      catch(e) {
        // If n was null or not an object the WeakMap will raise a TypeError
        // TypeError might be the best thing to propagate, but there is also
        // some precendent for raising a DOMException with code
        // NOT_FOUND_ERR;
        throw TypeError();
      }
    }

    function unwrapOrNull(n) {
      return n
        ? unwrap(n)
        : null;
    }

// Return the interface object (a DOM node) for the implementation object n,
// creating it if necessary. Implementation objects define the type
// of wrapper they require by defining an _idlName property. Most classes
// do this on their prototype.  For childNodes and attributes arrays,
// we have to define _idlName directly on the array objects, however.
    function wrap(n) {
      if (n === null) return null;

      if (n === undefined)
        throw new Error("Can't wrap undefined property");

      // If n doesn't have a wrapper already, create one.
      if (!n._idl) {
        var typename = n._idlName;
        if (!typename)
          throw Error("Implementation object does not define _idlName");
        var type = idl[typename];
        if (!type)
          throw Error("Unknown idl type " + typename);

        n._idl = type.factory(n);       // Create the wrapper
        wmset(idlToImplMap, n._idl, n); // Remember it for unwrap()
      }

      return n._idl;
    }




    /************************************************************************
     *  src/xmlnames.js
     ************************************************************************/

//@line 1 "src/xmlnames.js"
// This grammar is from the XML and XML Namespace specs. It specifies whether
// a string (such as an element or attribute name) is a valid Name or QName.
//
// Name            ::=          NameStartChar (NameChar)*
// NameStartChar   ::=          ":" | [A-Z] | "_" | [a-z] |
//                              [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] |
//                              [#x370-#x37D] | [#x37F-#x1FFF] |
//                              [#x200C-#x200D] | [#x2070-#x218F] |
//                              [#x2C00-#x2FEF] | [#x3001-#xD7FF] |
//                              [#xF900-#xFDCF] | [#xFDF0-#xFFFD] |
//                              [#x10000-#xEFFFF]
//
// NameChar        ::=          NameStartChar | "-" | "." | [0-9] |
//                                 #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//
// QName           ::=          PrefixedName| UnprefixedName
// PrefixedName    ::=          Prefix ':' LocalPart
// UnprefixedName  ::=          LocalPart
// Prefix          ::=          NCName
// LocalPart       ::=          NCName
// NCName          ::=          Name - (Char* ':' Char*)
//                              # An XML Name, minus the ":"
//
    const xml = (function() {

      // Most names will be ASCII only. Try matching against simple regexps first
      var simplename = /^[_:A-Za-z][-.:\w]+$/;
      var simpleqname = /^([_A-Za-z][-.\w]+|[_A-Za-z][-.\w]+:[_A-Za-z][-.\w]+)$/

      // If the regular expressions above fail, try more complex ones that work
      // for any identifiers using codepoints from the Unicode BMP
      var ncnamestartchars = "_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02ff\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD";
      var ncnamechars = "-._A-Za-z0-9\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02ff\u0300-\u037D\u037F-\u1FFF\u200C\u200D\u203f\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD";

      var ncname = "[" + ncnamestartchars + "][" + ncnamechars + "]*";
      var namestartchars = ncnamestartchars + ":";
      var namechars = ncnamechars + ":";
      var name = new RegExp("^[" + namestartchars + "]" +
        "[" + namechars + "]*$");
      var qname = new RegExp("^(" + ncname + "|" +
        ncname + ":" + ncname + ")$");

      // XML says that these characters are also legal:
      // [#x10000-#xEFFFF].  So if the patterns above fail, and the
      // target string includes surrogates, then try the following
      // patterns that allow surrogates and then run an extra validation
      // step to make sure that the surrogates are in valid pairs and in
      // the right range.  Note that since the characters \uf0000 to \u1f0000
      // are not allowed, it means that the high surrogate can only go up to
      // \uDB7f instead of \uDBFF.
      var hassurrogates = /[\uD800-\uDB7F\uDC00-\uDFFF]/;
      var surrogatechars = /[\uD800-\uDB7F\uDC00-\uDFFF]/g;
      var surrogatepairs = /[\uD800-\uDB7F][\uDC00-\uDFFF]/g;

      // Modify the variables above to allow surrogates
      ncnamestartchars += "\uD800-\uDB7F\uDC00-\uDFFF";
      ncnamechars += "\uD800-\uDB7F\uDC00-\uDFFF";
      ncname = "[" + ncnamestartchars + "][" + ncnamechars + "]*";
      namestartchars = ncnamestartchars + ":";
      namechars = ncnamechars + ":";

      // Build another set of regexps that include surrogates
      var surrogatename = new RegExp("^[" + namestartchars + "]" +
        "[" + namechars + "]*$");
      var surrogateqname = new RegExp("^(" + ncname + "|" +
        ncname + ":" + ncname + ")$");

      function isValidName(s) {
        if (test(simplename, s)) return true;  // Plain ASCII
        if (test(name, s)) return true;        // Unicode BMP

        // Maybe the tests above failed because s includes surrogate pairs
        // Most likely, though, they failed for some more basic syntax problem
        if (!test(hassurrogates, s)) return false;

        // Is the string a valid name if we allow surrogates?
        if (!test(surrogatename, s)) return false;

        // Finally, are the surrogates all correctly paired up?
        var chars = match(s, surrogatechars), pairs = match(s, surrogatepairs);
        return pairs != null && 2*pairs.length === chars.length;
      }


      function isValidQName(s) {
        if (test(simpleqname, s)) return true;  // Plain ASCII
        if (test(qname, s)) return true;        // Unicode BMP

        if (!test(hassurrogates, s)) return false;
        if (!test(surrogateqname, s)) return false;
        var chars = match(s, surrogatechars), pairs = match(s, surrogatepairs);
        return pairs != null && 2*pairs.length === chars.length;
      }

      return {isValidName: isValidName, isValidQName: isValidQName};
    }());



    /************************************************************************
     *  src/idl.js
     ************************************************************************/

//@line 1 "src/idl.js"
// This file defines functions for satisfying the requirements of WebIDL
// See also ../tools/idl2domjs

// WebIDL requires value conversions in various places.

// Convert x to an unsigned long and return it
// WebIDL currently says to use ES ToUint32() unless there is a [Clamp]
// attribute on the operation.  We can invoke the ToUint32 operation
// with the >>> operator.
//
    function toULong(x) {
      return x >>> 0;  // The >>> operator does ToUint32
    }

    function toLong(x) {
      return x & 0xFFFFFFFF; // This should do ToInt32
    }

    function toUShort(x) {
      return (x >>> 0) & 0xFFFF;  // Convert to uint32, and then truncate.
    }

// Convert the value x to a number, and raise an exception if
// it is NaN or infinite. This is not actually part of WebIDL:
// HTML mandates this check "except where otherwise specified".
// I'll probably want to change the idl type of attributes or
// arguments for which NaN and infinite values are allowed, if
// there are any
    function toDouble(x) {
      var v = Number(x)
      if (!isFinite(v)) NotSupportedError(x + " is not a finite float.");
      return v;
    }

    function undef2null(x) { return x === undefined ? null : x; }

// Convert x to a string as with the String() conversion function.
// But if x is null, return the empty string insead of "null".
// If a WebIDL method argument is just DOMString, convert with String()
// But if it is [TreatNullAs=EmptyString] DOMString then use this function.
    function StringOrEmpty(x) {
      return (x === null) ? "" : String(x);
    }

    function StringOrNull(x) {
      return (x === null) ? null : String(x);
    }

    function OptionalStringOrNull(x) {
      return x === null || x === undefined ? null : String(x);
    }

    function OptionaltoLong(x){
      return x === undefined ? undefined : toLong(x);
    }

    function OptionalBoolean(x) {
      return (x === undefined) ? undefined : Boolean(x);
    }

    function OptionalObject(x) {
      return (x === undefined) ? undefined : Object(x);
    }

    function toCallback(x) {
      var t = typeof x;
      if (t === "function" || t === "object") return x;
      else throw TypeError("Expected callback; got: " + x);
    }

    function toCallbackOrNull(x) {
      return (x === null) ? null : toCallback(x);
    }

// This constructor takes a single object as its argument and looks for
// the following properties of that object:
//
//    name         // The name of the interface
//    superclass   // The superclass constructor
//    proxyHandler // The proxy handler constructor, if one is needed
//    constants    // constants defined by the interface
//    members      // interface attributes and methods
//    constructor  // optional public constructor.
//
// It returns a new object with the following properties:
//   publicInterface // The public interface to be placed in the global scope
//                   // The input constructor or a synthetic no-op one.
//   prototype       // The prototype object for the interface
//                   // Also available as publicInterface.prototype
//   factory         // A factory function for creating an instance
//
    function IDLInterface(o) {
      var name = o.name || "";
      var superclass = o.superclass;
      var proxyFactory = o.proxyFactory;
      var constants = o.constants || {};
      var members = o.members || {};
      var prototype, interfaceObject;

      // Set up the prototype object
      prototype = superclass ? O.create(superclass.prototype) : {};

      if (hasOwnProperty(o, "constructor")) {
        interfaceObject = o.constructor;
      }
      else {
        // The interface object is supposed to work with instanceof, but is
        // not supposed to be callable.  We can't conform to both requirements
        // so we make the interface object a function that throws when called.
        interfaceObject = function() {
          throw new TypeError(name + " is not (supposed to be) a function");
        };
      }

      // WebIDL says that the interface object has this prototype property
      interfaceObject.prototype = prototype;
      // Make it read-only
      O.defineProperty(interfaceObject, "prototype", { writable: false });
      // XXX: the line below works in spidermonkey, but not in node.
      // probably related the fact that prototype already exists and
      // is writable but non-configurable?
      //  defineHiddenConstantProp(interfaceObject, "prototype", prototype);

      // WebIDL also says that the prototype points back to the interface object
      // instead of the real constructor.
      defineHiddenProp(prototype, "constructor", interfaceObject);

      // Constants must be defined on both the prototype and interface objects
      // And they must read-only and non-configurable
      for(var c in constants) {
        var value = constants[c];
        defineConstantProp(prototype, c, value);
        defineConstantProp(interfaceObject, c, value);
      }

      // Now copy attributes and methods onto the prototype object.
      // Members should just be an ordinary object.  Attributes should be
      // defined with getters and setters. Methods should be regular properties.
      // This will mean that the members will all be enumerable, configurable
      // and writable (unless there is no setter) as they are supposed to be.
      for(var m in members) {
        // Get the property descriptor of the member
        var desc = O.getOwnPropertyDescriptor(members, m);

        // Now copy the property to the prototype object
        O.defineProperty(prototype, m, desc);
      }

      // If the interface does not already define a toString method, add one.
      // This will help to make debugging easier.
      //
      // XXX: I'm not sure if this is legal according to WebIDL and DOM Core.
      // XXX Maybe I could move it down to an object on the prototype chain
      // above Object.prototype.  But then I'd need some way to determine
      // the type name.  Maybe the name of the public "constructor" function?
      // But then I'd have to create that function with eval, I think.
      if (!hasOwnProperty(members, "toString")) {
        prototype.toString = function() { return "[object " + name + "]"; };
      }

      // Now set up the fields of this object
      this.prototype = prototype;
      this.publicInterface = interfaceObject;
      this.factory = proxyFactory
        ? proxyFactory
        : O.create.bind(Object, prototype, {});
    }




    /************************************************************************
     *  src/domcore.js
     ************************************************************************/

//@line 1 "src/domcore.js"
//
// DO NOT EDIT.
// This file was generated by idl2domjs from src/idl/domcore.idl
//


//
// Interface Event
//

// Constants defined by Event
    const CAPTURING_PHASE = 1;
    const AT_TARGET = 2;
    const BUBBLING_PHASE = 3;

    defineLazyProperty(global, "Event", function() {
      return idl.Event.publicInterface;
    }, true);

    defineLazyProperty(idl, "Event", function() {
      return new IDLInterface({
        name: "Event",
        constructor: function Event(
          type,
          eventInitDict)
        {
          return wrap(new impl.Event(
            String(type),
            OptionalEventInit(eventInitDict)));
        },
        constants: {
          CAPTURING_PHASE: CAPTURING_PHASE,
          AT_TARGET: AT_TARGET,
          BUBBLING_PHASE: BUBBLING_PHASE,
        },
        members: {
          get type() {
            return unwrap(this).type;
          },

          get target() {
            return wrap(unwrap(this).target);
          },

          get currentTarget() {
            return wrap(unwrap(this).currentTarget);
          },

          get eventPhase() {
            return unwrap(this).eventPhase;
          },

          stopPropagation: function stopPropagation() {
            unwrap(this).stopPropagation();
          },

          stopImmediatePropagation: function stopImmediatePropagation() {
            unwrap(this).stopImmediatePropagation();
          },

          get bubbles() {
            return unwrap(this).bubbles;
          },

          get cancelable() {
            return unwrap(this).cancelable;
          },

          preventDefault: function preventDefault() {
            unwrap(this).preventDefault();
          },

          get defaultPrevented() {
            return unwrap(this).defaultPrevented;
          },

          get isTrusted() {
            return unwrap(this).isTrusted;
          },

          get timeStamp() {
            return unwrap(this).timeStamp;
          },

          initEvent: function initEvent(
            type,
            bubbles,
            cancelable)
          {
            unwrap(this).initEvent(
              String(type),
              Boolean(bubbles),
              Boolean(cancelable));
          },

        },
      });
    });

//
// Dictionary EventInit
//

    function EventInit(o) {
      var rv = O.create(EventInit.prototype);
      if ('bubbles' in o) rv['bubbles'] = Boolean(o['bubbles']);
      if ('cancelable' in o) rv['cancelable'] = Boolean(o['cancelable']);
      return rv;
    }
    function OptionalEventInit(o) {
      return (o === undefined) ? undefined : EventInit(o);
    }
    EventInit.prototype = {};

//
// Interface CustomEvent
//

    defineLazyProperty(global, "CustomEvent", function() {
      return idl.CustomEvent.publicInterface;
    }, true);

    defineLazyProperty(idl, "CustomEvent", function() {
      return new IDLInterface({
        name: "CustomEvent",
        superclass: idl.Event,
        constructor: function CustomEvent(
          type,
          eventInitDict)
        {
          return wrap(new impl.CustomEvent(
            String(type),
            OptionalCustomEventInit(eventInitDict)));
        },
        members: {
          get detail() {
            return unwrap(this).detail;
          },

        },
      });
    });

//
// Dictionary CustomEventInit
//

    function CustomEventInit(o) {
      var rv = O.create(CustomEventInit.prototype);
      if ('bubbles' in o) rv['bubbles'] = Boolean(o['bubbles']);
      if ('cancelable' in o) rv['cancelable'] = Boolean(o['cancelable']);
      if ('detail' in o) rv['detail'] = o['detail'];
      return rv;
    }
    function OptionalCustomEventInit(o) {
      return (o === undefined) ? undefined : CustomEventInit(o);
    }
    CustomEventInit.prototype = O.create(EventInit.prototype);

//
// Interface EventTarget
//

    defineLazyProperty(global, "EventTarget", function() {
      return idl.EventTarget.publicInterface;
    }, true);

    defineLazyProperty(idl, "EventTarget", function() {
      return new IDLInterface({
        name: "EventTarget",
        members: {
          addEventListener: function addEventListener(
            type,
            listener,
            capture)
          {
            unwrap(this).addEventListener(
              String(type),
              toCallbackOrNull(listener),
              OptionalBoolean(capture));
          },

          removeEventListener: function removeEventListener(
            type,
            listener,
            capture)
          {
            unwrap(this).removeEventListener(
              String(type),
              toCallbackOrNull(listener),
              OptionalBoolean(capture));
          },

          dispatchEvent: function dispatchEvent(event) {
            return unwrap(this).dispatchEvent(unwrap(event));
          },

        },
      });
    });

//
// Interface Node
//

// Constants defined by Node
    const ELEMENT_NODE = 1;
    const ATTRIBUTE_NODE = 2;
    const TEXT_NODE = 3;
    const CDATA_SECTION_NODE = 4;
    const ENTITY_REFERENCE_NODE = 5;
    const ENTITY_NODE = 6;
    const PROCESSING_INSTRUCTION_NODE = 7;
    const COMMENT_NODE = 8;
    const DOCUMENT_NODE = 9;
    const DOCUMENT_TYPE_NODE = 10;
    const DOCUMENT_FRAGMENT_NODE = 11;
    const NOTATION_NODE = 12;
    const DOCUMENT_POSITION_DISCONNECTED = 0x01;
    const DOCUMENT_POSITION_PRECEDING = 0x02;
    const DOCUMENT_POSITION_FOLLOWING = 0x04;
    const DOCUMENT_POSITION_CONTAINS = 0x08;
    const DOCUMENT_POSITION_CONTAINED_BY = 0x10;
    const DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 0x20;

    defineLazyProperty(global, "Node", function() {
      return idl.Node.publicInterface;
    }, true);

    defineLazyProperty(idl, "Node", function() {
      return new IDLInterface({
        name: "Node",
        superclass: idl.EventTarget,
        constants: {
          ELEMENT_NODE: ELEMENT_NODE,
          ATTRIBUTE_NODE: ATTRIBUTE_NODE,
          TEXT_NODE: TEXT_NODE,
          CDATA_SECTION_NODE: CDATA_SECTION_NODE,
          ENTITY_REFERENCE_NODE: ENTITY_REFERENCE_NODE,
          ENTITY_NODE: ENTITY_NODE,
          PROCESSING_INSTRUCTION_NODE: PROCESSING_INSTRUCTION_NODE,
          COMMENT_NODE: COMMENT_NODE,
          DOCUMENT_NODE: DOCUMENT_NODE,
          DOCUMENT_TYPE_NODE: DOCUMENT_TYPE_NODE,
          DOCUMENT_FRAGMENT_NODE: DOCUMENT_FRAGMENT_NODE,
          NOTATION_NODE: NOTATION_NODE,
          DOCUMENT_POSITION_DISCONNECTED: DOCUMENT_POSITION_DISCONNECTED,
          DOCUMENT_POSITION_PRECEDING: DOCUMENT_POSITION_PRECEDING,
          DOCUMENT_POSITION_FOLLOWING: DOCUMENT_POSITION_FOLLOWING,
          DOCUMENT_POSITION_CONTAINS: DOCUMENT_POSITION_CONTAINS,
          DOCUMENT_POSITION_CONTAINED_BY: DOCUMENT_POSITION_CONTAINED_BY,
          DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC,
        },
        members: {
          get nodeType() {
            return unwrap(this).nodeType;
          },

          get nodeName() {
            return unwrap(this).nodeName;
          },

          get baseURI() {
            return unwrap(this).baseURI;
          },

          get ownerDocument() {
            return wrap(unwrap(this).ownerDocument);
          },

          get parentNode() {
            return wrap(unwrap(this).parentNode);
          },

          get parentElement() {
            return wrap(unwrap(this).parentElement);
          },

          hasChildNodes: function hasChildNodes() {
            return unwrap(this).hasChildNodes();
          },

          get childNodes() {
            return wrap(unwrap(this).childNodes);
          },

          get firstChild() {
            return wrap(unwrap(this).firstChild);
          },

          get lastChild() {
            return wrap(unwrap(this).lastChild);
          },

          get previousSibling() {
            return wrap(unwrap(this).previousSibling);
          },

          get nextSibling() {
            return wrap(unwrap(this).nextSibling);
          },

          compareDocumentPosition: function compareDocumentPosition(other) {
            return unwrap(this).compareDocumentPosition(unwrap(other));
          },

          get nodeValue() {
            return unwrap(this).nodeValue;
          },
          set nodeValue(newval) {
            unwrap(this).nodeValue = StringOrNull(newval);
          },

          get textContent() {
            return unwrap(this).textContent;
          },
          set textContent(newval) {
            unwrap(this).textContent = StringOrNull(newval);
          },

          insertBefore: function insertBefore(
            newChild,
            refChild)
          {
            return wrap(unwrap(this).insertBefore(
              unwrap(newChild),
              unwrapOrNull(refChild)));
          },

          replaceChild: function replaceChild(
            newChild,
            oldChild)
          {
            return wrap(unwrap(this).replaceChild(
              unwrap(newChild),
              unwrap(oldChild)));
          },

          removeChild: function removeChild(oldChild) {
            return wrap(unwrap(this).removeChild(unwrap(oldChild)));
          },

          appendChild: function appendChild(newChild) {
            return wrap(unwrap(this).appendChild(unwrap(newChild)));
          },

          cloneNode: function cloneNode(deep) {
            return wrap(unwrap(this).cloneNode(Boolean(deep)));
          },

          isSameNode: function isSameNode(node) {
            return unwrap(this).isSameNode(unwrapOrNull(node));
          },

          isEqualNode: function isEqualNode(node) {
            return unwrap(this).isEqualNode(unwrapOrNull(node));
          },

          lookupPrefix: function lookupPrefix(namespace) {
            return unwrap(this).lookupPrefix(StringOrEmpty(namespace));
          },

          lookupNamespaceURI: function lookupNamespaceURI(prefix) {
            return unwrap(this).lookupNamespaceURI(StringOrNull(prefix));
          },

          isDefaultNamespace: function isDefaultNamespace(namespace) {
            return unwrap(this).isDefaultNamespace(StringOrEmpty(namespace));
          },

        },
      });
    });

//
// Interface DocumentFragment
//

    defineLazyProperty(global, "DocumentFragment", function() {
      return idl.DocumentFragment.publicInterface;
    }, true);

    defineLazyProperty(idl, "DocumentFragment", function() {
      return new IDLInterface({
        name: "DocumentFragment",
        superclass: idl.Node,
        members: {
        },
      });
    });

//
// Interface Document
//

    defineLazyProperty(global, "Document", function() {
      return idl.Document.publicInterface;
    }, true);

    defineLazyProperty(idl, "Document", function() {
      return new IDLInterface({
        name: "Document",
        superclass: idl.Node,
        members: {
          _setMutationHandler: function _setMutationHandler(handler) {
            unwrap(this)._setMutationHandler(toCallback(handler));
          },

          _dispatchRendererEvent: function _dispatchRendererEvent(
            target,
            type,
            details)
          {
            unwrap(this)._dispatchRendererEvent(
              toULong(target),
              String(type),
              EventInit(details));
          },

          get implementation() {
            return wrap(unwrap(this).implementation);
          },

          get documentURI() {
            return unwrap(this).documentURI;
          },
          set documentURI(newval) {
            unwrap(this).documentURI = String(newval);
          },

          get compatMode() {
            return unwrap(this).compatMode;
          },

          get doctype() {
            return wrap(unwrap(this).doctype);
          },

          get documentElement() {
            return wrap(unwrap(this).documentElement);
          },

          getElementsByTagName: function getElementsByTagName(qualifiedName) {
            return wrap(unwrap(this).getElementsByTagName(String(qualifiedName)));
          },

          getElementsByTagNameNS: function getElementsByTagNameNS(
            namespace,
            localName)
          {
            return wrap(unwrap(this).getElementsByTagNameNS(
              String(namespace),
              String(localName)));
          },

          getElementsByClassName: function getElementsByClassName(classNames) {
            return wrap(unwrap(this).getElementsByClassName(String(classNames)));
          },

          getElementById: function getElementById(elementId) {
            return wrap(unwrap(this).getElementById(String(elementId)));
          },

          createElement: function createElement(localName) {
            return wrap(unwrap(this).createElement(StringOrEmpty(localName)));
          },

          createElementNS: function createElementNS(
            namespace,
            qualifiedName)
          {
            return wrap(unwrap(this).createElementNS(
              String(namespace),
              String(qualifiedName)));
          },

          createDocumentFragment: function createDocumentFragment() {
            return wrap(unwrap(this).createDocumentFragment());
          },

          createTextNode: function createTextNode(data) {
            var dataString = data;
            var dataIsFaceted = isFaceted(data);
            if (dataIsFaceted) {
              dataString = window.policyEnv.concretize(null, data);
            }
            var textNode = unwrap(this).createTextNode(String(dataString));
            if (dataIsFaceted) facetedValueMap[textNode] = data;
            return wrap(textNode);
          },

          createComment: function createComment(data) {
            return wrap(unwrap(this).createComment(String(data)));
          },

          createProcessingInstruction: function createProcessingInstruction(
            target,
            data)
          {
            return wrap(unwrap(this).createProcessingInstruction(
              String(target),
              String(data)));
          },

          importNode: function importNode(
            node,
            deep)
          {
            return wrap(unwrap(this).importNode(
              unwrap(node),
              Boolean(deep)));
          },

          adoptNode: function adoptNode(node) {
            return wrap(unwrap(this).adoptNode(unwrap(node)));
          },

          createEvent: function createEvent(eventInterfaceName) {
            return wrap(unwrap(this).createEvent(String(eventInterfaceName)));
          },

          get URL() {
            return unwrap(this).URL;
          },

          get domain() {
            return unwrap(this).domain;
          },
          set domain(newval) {
            unwrap(this).domain = String(newval);
          },

          get referrer() {
            return unwrap(this).referrer;
          },

          get cookie() {
            return unwrap(this).cookie;
          },
          set cookie(newval) {
            unwrap(this).cookie = String(newval);
          },

          get lastModified() {
            return unwrap(this).lastModified;
          },

          get readyState() {
            return unwrap(this).readyState;
          },

          get title() {
            return unwrap(this).title;
          },
          set title(newval) {
            unwrap(this).title = String(newval);
          },

          get dir() {
            return unwrap(this).dir;
          },
          set dir(newval) {
            unwrap(this).dir = String(newval);
          },

          get body() {
            return wrap(unwrap(this).body);
          },
          set body(newval) {
            unwrap(this).body = unwrapOrNull(newval);
          },

          get head() {
            return wrap(unwrap(this).head);
          },

          get images() {
            return wrap(unwrap(this).images);
          },

          get embeds() {
            return wrap(unwrap(this).embeds);
          },

          get plugins() {
            return wrap(unwrap(this).plugins);
          },

          get links() {
            return wrap(unwrap(this).links);
          },

          get forms() {
            return wrap(unwrap(this).forms);
          },

          get scripts() {
            return wrap(unwrap(this).scripts);
          },

          getElementsByName: function getElementsByName(elementName) {
            return wrap(unwrap(this).getElementsByName(String(elementName)));
          },

          get innerHTML() {
            return unwrap(this).innerHTML;
          },
          set innerHTML(newval) {
            unwrap(this).innerHTML = String(newval);
          },

          write: function write(text /*...*/) {
            var context = unwrap(this);
            var args = [];
            for(var i = 0; i < arguments.length; i++) {
              push(args, String(arguments[i]));
            }
            apply(context.write, context, args);
          },

          writeln: function writeln(text /*...*/) {
            var context = unwrap(this);
            var args = [];
            for(var i = 0; i < arguments.length; i++) {
              push(args, String(arguments[i]));
            }
            apply(context.writeln, context, args);
          },

          get defaultView() {
            return wrap(unwrap(this).defaultView);
          },

          get onabort() {
            return unwrap(this).onabort;
          },
          set onabort(newval) {
            unwrap(this).onabort = toCallbackOrNull(newval);
          },

          get onblur() {
            return unwrap(this).onblur;
          },
          set onblur(newval) {
            unwrap(this).onblur = toCallbackOrNull(newval);
          },

          get oncanplay() {
            return unwrap(this).oncanplay;
          },
          set oncanplay(newval) {
            unwrap(this).oncanplay = toCallbackOrNull(newval);
          },

          get oncanplaythrough() {
            return unwrap(this).oncanplaythrough;
          },
          set oncanplaythrough(newval) {
            unwrap(this).oncanplaythrough = toCallbackOrNull(newval);
          },

          get onchange() {
            return unwrap(this).onchange;
          },
          set onchange(newval) {
            unwrap(this).onchange = toCallbackOrNull(newval);
          },

          get onclick() {
            return unwrap(this).onclick;
          },
          set onclick(newval) {
            unwrap(this).onclick = toCallbackOrNull(newval);
          },

          get oncontextmenu() {
            return unwrap(this).oncontextmenu;
          },
          set oncontextmenu(newval) {
            unwrap(this).oncontextmenu = toCallbackOrNull(newval);
          },

          get oncuechange() {
            return unwrap(this).oncuechange;
          },
          set oncuechange(newval) {
            unwrap(this).oncuechange = toCallbackOrNull(newval);
          },

          get ondblclick() {
            return unwrap(this).ondblclick;
          },
          set ondblclick(newval) {
            unwrap(this).ondblclick = toCallbackOrNull(newval);
          },

          get ondrag() {
            return unwrap(this).ondrag;
          },
          set ondrag(newval) {
            unwrap(this).ondrag = toCallbackOrNull(newval);
          },

          get ondragend() {
            return unwrap(this).ondragend;
          },
          set ondragend(newval) {
            unwrap(this).ondragend = toCallbackOrNull(newval);
          },

          get ondragenter() {
            return unwrap(this).ondragenter;
          },
          set ondragenter(newval) {
            unwrap(this).ondragenter = toCallbackOrNull(newval);
          },

          get ondragleave() {
            return unwrap(this).ondragleave;
          },
          set ondragleave(newval) {
            unwrap(this).ondragleave = toCallbackOrNull(newval);
          },

          get ondragover() {
            return unwrap(this).ondragover;
          },
          set ondragover(newval) {
            unwrap(this).ondragover = toCallbackOrNull(newval);
          },

          get ondragstart() {
            return unwrap(this).ondragstart;
          },
          set ondragstart(newval) {
            unwrap(this).ondragstart = toCallbackOrNull(newval);
          },

          get ondrop() {
            return unwrap(this).ondrop;
          },
          set ondrop(newval) {
            unwrap(this).ondrop = toCallbackOrNull(newval);
          },

          get ondurationchange() {
            return unwrap(this).ondurationchange;
          },
          set ondurationchange(newval) {
            unwrap(this).ondurationchange = toCallbackOrNull(newval);
          },

          get onemptied() {
            return unwrap(this).onemptied;
          },
          set onemptied(newval) {
            unwrap(this).onemptied = toCallbackOrNull(newval);
          },

          get onended() {
            return unwrap(this).onended;
          },
          set onended(newval) {
            unwrap(this).onended = toCallbackOrNull(newval);
          },

          get onerror() {
            return unwrap(this).onerror;
          },
          set onerror(newval) {
            unwrap(this).onerror = toCallbackOrNull(newval);
          },

          get onfocus() {
            return unwrap(this).onfocus;
          },
          set onfocus(newval) {
            unwrap(this).onfocus = toCallbackOrNull(newval);
          },

          get oninput() {
            return unwrap(this).oninput;
          },
          set oninput(newval) {
            unwrap(this).oninput = toCallbackOrNull(newval);
          },

          get oninvalid() {
            return unwrap(this).oninvalid;
          },
          set oninvalid(newval) {
            unwrap(this).oninvalid = toCallbackOrNull(newval);
          },

          get onkeydown() {
            return unwrap(this).onkeydown;
          },
          set onkeydown(newval) {
            unwrap(this).onkeydown = toCallbackOrNull(newval);
          },

          get onkeypress() {
            return unwrap(this).onkeypress;
          },
          set onkeypress(newval) {
            unwrap(this).onkeypress = toCallbackOrNull(newval);
          },

          get onkeyup() {
            return unwrap(this).onkeyup;
          },
          set onkeyup(newval) {
            unwrap(this).onkeyup = toCallbackOrNull(newval);
          },

          get onload() {
            return unwrap(this).onload;
          },
          set onload(newval) {
            unwrap(this).onload = toCallbackOrNull(newval);
          },

          get onloadeddata() {
            return unwrap(this).onloadeddata;
          },
          set onloadeddata(newval) {
            unwrap(this).onloadeddata = toCallbackOrNull(newval);
          },

          get onloadedmetadata() {
            return unwrap(this).onloadedmetadata;
          },
          set onloadedmetadata(newval) {
            unwrap(this).onloadedmetadata = toCallbackOrNull(newval);
          },

          get onloadstart() {
            return unwrap(this).onloadstart;
          },
          set onloadstart(newval) {
            unwrap(this).onloadstart = toCallbackOrNull(newval);
          },

          get onmousedown() {
            return unwrap(this).onmousedown;
          },
          set onmousedown(newval) {
            unwrap(this).onmousedown = toCallbackOrNull(newval);
          },

          get onmousemove() {
            return unwrap(this).onmousemove;
          },
          set onmousemove(newval) {
            unwrap(this).onmousemove = toCallbackOrNull(newval);
          },

          get onmouseout() {
            return unwrap(this).onmouseout;
          },
          set onmouseout(newval) {
            unwrap(this).onmouseout = toCallbackOrNull(newval);
          },

          get onmouseover() {
            return unwrap(this).onmouseover;
          },
          set onmouseover(newval) {
            unwrap(this).onmouseover = toCallbackOrNull(newval);
          },

          get onmouseup() {
            return unwrap(this).onmouseup;
          },
          set onmouseup(newval) {
            unwrap(this).onmouseup = toCallbackOrNull(newval);
          },

          get onmousewheel() {
            return unwrap(this).onmousewheel;
          },
          set onmousewheel(newval) {
            unwrap(this).onmousewheel = toCallbackOrNull(newval);
          },

          get onpause() {
            return unwrap(this).onpause;
          },
          set onpause(newval) {
            unwrap(this).onpause = toCallbackOrNull(newval);
          },

          get onplay() {
            return unwrap(this).onplay;
          },
          set onplay(newval) {
            unwrap(this).onplay = toCallbackOrNull(newval);
          },

          get onplaying() {
            return unwrap(this).onplaying;
          },
          set onplaying(newval) {
            unwrap(this).onplaying = toCallbackOrNull(newval);
          },

          get onprogress() {
            return unwrap(this).onprogress;
          },
          set onprogress(newval) {
            unwrap(this).onprogress = toCallbackOrNull(newval);
          },

          get onratechange() {
            return unwrap(this).onratechange;
          },
          set onratechange(newval) {
            unwrap(this).onratechange = toCallbackOrNull(newval);
          },

          get onreadystatechange() {
            return unwrap(this).onreadystatechange;
          },
          set onreadystatechange(newval) {
            unwrap(this).onreadystatechange = toCallbackOrNull(newval);
          },

          get onreset() {
            return unwrap(this).onreset;
          },
          set onreset(newval) {
            unwrap(this).onreset = toCallbackOrNull(newval);
          },

          get onscroll() {
            return unwrap(this).onscroll;
          },
          set onscroll(newval) {
            unwrap(this).onscroll = toCallbackOrNull(newval);
          },

          get onseeked() {
            return unwrap(this).onseeked;
          },
          set onseeked(newval) {
            unwrap(this).onseeked = toCallbackOrNull(newval);
          },

          get onseeking() {
            return unwrap(this).onseeking;
          },
          set onseeking(newval) {
            unwrap(this).onseeking = toCallbackOrNull(newval);
          },

          get onselect() {
            return unwrap(this).onselect;
          },
          set onselect(newval) {
            unwrap(this).onselect = toCallbackOrNull(newval);
          },

          get onshow() {
            return unwrap(this).onshow;
          },
          set onshow(newval) {
            unwrap(this).onshow = toCallbackOrNull(newval);
          },

          get onstalled() {
            return unwrap(this).onstalled;
          },
          set onstalled(newval) {
            unwrap(this).onstalled = toCallbackOrNull(newval);
          },

          get onsubmit() {
            return unwrap(this).onsubmit;
          },
          set onsubmit(newval) {
            unwrap(this).onsubmit = toCallbackOrNull(newval);
          },

          get onsuspend() {
            return unwrap(this).onsuspend;
          },
          set onsuspend(newval) {
            unwrap(this).onsuspend = toCallbackOrNull(newval);
          },

          get ontimeupdate() {
            return unwrap(this).ontimeupdate;
          },
          set ontimeupdate(newval) {
            unwrap(this).ontimeupdate = toCallbackOrNull(newval);
          },

          get onvolumechange() {
            return unwrap(this).onvolumechange;
          },
          set onvolumechange(newval) {
            unwrap(this).onvolumechange = toCallbackOrNull(newval);
          },

          get onwaiting() {
            return unwrap(this).onwaiting;
          },
          set onwaiting(newval) {
            unwrap(this).onwaiting = toCallbackOrNull(newval);
          },

        },
      });
    });

//
// Interface DOMImplementation
//

    defineLazyProperty(global, "DOMImplementation", function() {
      return idl.DOMImplementation.publicInterface;
    }, true);

    defineLazyProperty(idl, "DOMImplementation", function() {
      return new IDLInterface({
        name: "DOMImplementation",
        members: {
          hasFeature: function hasFeature(
            feature,
            version)
          {
            return unwrap(this).hasFeature(
              String(feature),
              StringOrEmpty(version));
          },

          createDocumentType: function createDocumentType(
            qualifiedName,
            publicId,
            systemId)
          {
            return wrap(unwrap(this).createDocumentType(
              StringOrEmpty(qualifiedName),
              String(publicId),
              String(systemId)));
          },

          createDocument: function createDocument(
            namespace,
            qualifiedName,
            doctype)
          {
            return wrap(unwrap(this).createDocument(
              StringOrEmpty(namespace),
              StringOrEmpty(qualifiedName),
              unwrapOrNull(doctype)));
          },

          createHTMLDocument: function createHTMLDocument(title) {
            return wrap(unwrap(this).createHTMLDocument(String(title)));
          },

          mozSetOutputMutationHandler: function mozSetOutputMutationHandler(
            doc,
            handler)
          {
            unwrap(this).mozSetOutputMutationHandler(
              unwrap(doc),
              toCallback(handler));
          },

          mozGetInputMutationHandler: function mozGetInputMutationHandler(doc) {
            return unwrap(this).mozGetInputMutationHandler(unwrap(doc));
          },

          get mozHTMLParser() {
            return unwrap(this).mozHTMLParser;
          },

        },
      });
    });

//
// Interface Element
//

    defineLazyProperty(global, "Element", function() {
      return idl.Element.publicInterface;
    }, true);

    defineLazyProperty(idl, "Element", function() {
      return new IDLInterface({
        name: "Element",
        superclass: idl.Node,
        members: {
          get namespaceURI() {
            return unwrap(this).namespaceURI;
          },

          get prefix() {
            return unwrap(this).prefix;
          },

          get localName() {
            return unwrap(this).localName;
          },

          get tagName() {
            return unwrap(this).tagName;
          },

          get attributes() {
            return wrap(unwrap(this).attributes);
          },

          getAttribute: function getAttribute(qualifiedName) {
            return unwrap(this).getAttribute(String(qualifiedName));
          },

          getAttributeNS: function getAttributeNS(
            namespace,
            localName)
          {
            return unwrap(this).getAttributeNS(
              String(namespace),
              String(localName));
          },

          setAttribute: function setAttribute(
            qualifiedName,
            value)
          {
            var valueString = value;
            if (isFaceted(value)) {
              valueString = window.policyEnv.concretize(null, value);
              facetedValueMap[this.id + qualifiedName] = value;
            }
            unwrap(this).setAttribute(
              String(qualifiedName),
              String(valueString));
          },

          setAttributeNS: function setAttributeNS(
            namespace,
            qualifiedName,
            value)
          {
            unwrap(this).setAttributeNS(
              String(namespace),
              String(qualifiedName),
              String(value));
          },

          removeAttribute: function removeAttribute(qualifiedName) {
            unwrap(this).removeAttribute(String(qualifiedName));
          },

          removeAttributeNS: function removeAttributeNS(
            namespace,
            localName)
          {
            unwrap(this).removeAttributeNS(
              String(namespace),
              String(localName));
          },

          hasAttribute: function hasAttribute(qualifiedName) {
            return unwrap(this).hasAttribute(String(qualifiedName));
          },

          hasAttributeNS: function hasAttributeNS(
            namespace,
            localName)
          {
            return unwrap(this).hasAttributeNS(
              String(namespace),
              String(localName));
          },

          getElementsByTagName: function getElementsByTagName(qualifiedName) {
            return wrap(unwrap(this).getElementsByTagName(String(qualifiedName)));
          },

          getElementsByTagNameNS: function getElementsByTagNameNS(
            namespace,
            localName)
          {
            return wrap(unwrap(this).getElementsByTagNameNS(
              String(namespace),
              String(localName)));
          },

          getElementsByClassName: function getElementsByClassName(classNames) {
            return wrap(unwrap(this).getElementsByClassName(String(classNames)));
          },

          get children() {
            return wrap(unwrap(this).children);
          },

          get firstElementChild() {
            return wrap(unwrap(this).firstElementChild);
          },

          get lastElementChild() {
            return wrap(unwrap(this).lastElementChild);
          },

          get previousElementSibling() {
            return wrap(unwrap(this).previousElementSibling);
          },

          get nextElementSibling() {
            return wrap(unwrap(this).nextElementSibling);
          },

          get childElementCount() {
            return unwrap(this).childElementCount;
          },

        },
      });
    });

//
// Interface Attr
//

    defineLazyProperty(global, "Attr", function() {
      return idl.Attr.publicInterface;
    }, true);

    defineLazyProperty(idl, "Attr", function() {
      return new IDLInterface({
        name: "Attr",
        members: {
          get namespaceURI() {
            return unwrap(this).namespaceURI;
          },

          get prefix() {
            return unwrap(this).prefix;
          },

          get localName() {
            return unwrap(this).localName;
          },

          get name() {
            return unwrap(this).name;
          },

          get value() {
            return unwrap(this).value;
          },
          set value(newval) {
            unwrap(this).value = String(newval);
          },

        },
      });
    });

//
// Interface DocumentType
//

    defineLazyProperty(global, "DocumentType", function() {
      return idl.DocumentType.publicInterface;
    }, true);

    defineLazyProperty(idl, "DocumentType", function() {
      return new IDLInterface({
        name: "DocumentType",
        superclass: idl.Node,
        members: {
          get name() {
            return unwrap(this).name;
          },

          get publicId() {
            return unwrap(this).publicId;
          },

          get systemId() {
            return unwrap(this).systemId;
          },

        },
      });
    });

//
// Interface ProcessingInstruction
//

    defineLazyProperty(global, "ProcessingInstruction", function() {
      return idl.ProcessingInstruction.publicInterface;
    }, true);

    defineLazyProperty(idl, "ProcessingInstruction", function() {
      return new IDLInterface({
        name: "ProcessingInstruction",
        superclass: idl.Node,
        members: {
          get target() {
            return unwrap(this).target;
          },

          get data() {
            return unwrap(this).data;
          },
          set data(newval) {
            unwrap(this).data = String(newval);
          },

        },
      });
    });

//
// Interface CharacterData
//

    defineLazyProperty(global, "CharacterData", function() {
      return idl.CharacterData.publicInterface;
    }, true);

    defineLazyProperty(idl, "CharacterData", function() {
      return new IDLInterface({
        name: "CharacterData",
        superclass: idl.Node,
        members: {
          get data() {
            return unwrap(this).data;
          },
          set data(newval) {
            unwrap(this).data = StringOrEmpty(newval);
          },

          get length() {
            return unwrap(this).length;
          },

          substringData: function substringData(
            offset,
            count)
          {
            return unwrap(this).substringData(
              toULong(offset),
              toULong(count));
          },

          appendData: function appendData(data) {
            unwrap(this).appendData(String(data));
          },

          insertData: function insertData(
            offset,
            data)
          {
            unwrap(this).insertData(
              toULong(offset),
              String(data));
          },

          deleteData: function deleteData(
            offset,
            count)
          {
            unwrap(this).deleteData(
              toULong(offset),
              toULong(count));
          },

          replaceData: function replaceData(
            offset,
            count,
            data)
          {
            unwrap(this).replaceData(
              toULong(offset),
              toULong(count),
              String(data));
          },

        },
      });
    });

//
// Interface Text
//

    defineLazyProperty(global, "Text", function() {
      return idl.Text.publicInterface;
    }, true);

    defineLazyProperty(idl, "Text", function() {
      return new IDLInterface({
        name: "Text",
        superclass: idl.CharacterData,
        members: {
          splitText: function splitText(offset) {
            return wrap(unwrap(this).splitText(toULong(offset)));
          },

          get wholeText() {
            return unwrap(this).wholeText;
          },

          replaceWholeText: function replaceWholeText(data) {
            return wrap(unwrap(this).replaceWholeText(String(data)));
          },

        },
      });
    });

//
// Interface Comment
//

    defineLazyProperty(global, "Comment", function() {
      return idl.Comment.publicInterface;
    }, true);

    defineLazyProperty(idl, "Comment", function() {
      return new IDLInterface({
        name: "Comment",
        superclass: idl.CharacterData,
        members: {
        },
      });
    });

//
// Interface NodeList
//

    defineLazyProperty(global, "NodeList", function() {
      return idl.NodeList.publicInterface;
    }, true);

    defineLazyProperty(idl, "NodeList", function() {
      return new IDLInterface({
        name: "NodeList",
        proxyFactory: NodeListProxy,
        members: {
          item: function item(index) {
            return wrap(unwrap(this).item(toULong(index)));
          },

          get length() {
            return unwrap(this).length;
          },

        },
      });
    });

//
// Interface HTMLCollection
//

    defineLazyProperty(global, "HTMLCollection", function() {
      return idl.HTMLCollection.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLCollection", function() {
      return new IDLInterface({
        name: "HTMLCollection",
        proxyFactory: HTMLCollectionProxy,
        members: {
          get length() {
            return unwrap(this).length;
          },

          item: function item(index) {
            return wrap(unwrap(this).item(toULong(index)));
          },

          namedItem: function namedItem(name) {
            return wrap(unwrap(this).namedItem(String(name)));
          },

        },
      });
    });

//
// Interface DOMStringList
//

    defineLazyProperty(global, "DOMStringList", function() {
      return idl.DOMStringList.publicInterface;
    }, true);

    defineLazyProperty(idl, "DOMStringList", function() {
      return new IDLInterface({
        name: "DOMStringList",
        proxyFactory: DOMStringListProxy,
        members: {
          get length() {
            return unwrap(this).length;
          },

          item: function item(index) {
            return unwrap(this).item(toULong(index));
          },

          contains: function contains(string) {
            return unwrap(this).contains(String(string));
          },

        },
      });
    });

//
// Interface DOMTokenList
//

    defineLazyProperty(global, "DOMTokenList", function() {
      return idl.DOMTokenList.publicInterface;
    }, true);

    defineLazyProperty(idl, "DOMTokenList", function() {
      return new IDLInterface({
        name: "DOMTokenList",
        proxyFactory: DOMTokenListProxy,
        members: {
          get length() {
            return unwrap(this).length;
          },

          item: function item(index) {
            return unwrap(this).item(toULong(index));
          },

          contains: function contains(token) {
            return unwrap(this).contains(String(token));
          },

          add: function add(token) {
            unwrap(this).add(String(token));
          },

          remove: function remove(token) {
            unwrap(this).remove(String(token));
          },

          toggle: function toggle(token) {
            return unwrap(this).toggle(String(token));
          },

          toString: function toString() {
            return unwrap(this).toString();
          },

        },
      });
    });

//
// Interface DOMSettableTokenList
//

    defineLazyProperty(global, "DOMSettableTokenList", function() {
      return idl.DOMSettableTokenList.publicInterface;
    }, true);

    defineLazyProperty(idl, "DOMSettableTokenList", function() {
      return new IDLInterface({
        name: "DOMSettableTokenList",
        superclass: idl.DOMTokenList,
        members: {
          get value() {
            return unwrap(this).value;
          },
          set value(newval) {
            unwrap(this).value = String(newval);
          },

        },
      });
    });

    defineLazyProperty(idl, "AttrArray", function() {
      return new IDLInterface({
        name: "AttrArray",
        proxyFactory: AttrArrayProxy,
      });
    });



    /************************************************************************
     *  src/events.js
     ************************************************************************/

//@line 1 "src/events.js"
//
// DO NOT EDIT.
// This file was generated by idl2domjs from src/idl/events.idl
//


//
// Interface UIEvent
//

    defineLazyProperty(global, "UIEvent", function() {
      return idl.UIEvent.publicInterface;
    }, true);

    defineLazyProperty(idl, "UIEvent", function() {
      return new IDLInterface({
        name: "UIEvent",
        superclass: idl.Event,
        members: {
          get view() {
            return wrap(unwrap(this).view);
          },

          get detail() {
            return unwrap(this).detail;
          },

          initUIEvent: function initUIEvent(
            typeArg,
            canBubbleArg,
            cancelableArg,
            viewArg,
            detailArg)
          {
            unwrap(this).initUIEvent(
              String(typeArg),
              Boolean(canBubbleArg),
              Boolean(cancelableArg),
              unwrap(viewArg),
              toLong(detailArg));
          },

        },
      });
    });

//
// Interface MouseEvent
//

    defineLazyProperty(global, "MouseEvent", function() {
      return idl.MouseEvent.publicInterface;
    }, true);

    defineLazyProperty(idl, "MouseEvent", function() {
      return new IDLInterface({
        name: "MouseEvent",
        superclass: idl.UIEvent,
        members: {
          get screenX() {
            return unwrap(this).screenX;
          },

          get screenY() {
            return unwrap(this).screenY;
          },

          get clientX() {
            return unwrap(this).clientX;
          },

          get clientY() {
            return unwrap(this).clientY;
          },

          get ctrlKey() {
            return unwrap(this).ctrlKey;
          },

          get shiftKey() {
            return unwrap(this).shiftKey;
          },

          get altKey() {
            return unwrap(this).altKey;
          },

          get metaKey() {
            return unwrap(this).metaKey;
          },

          get button() {
            return unwrap(this).button;
          },

          get buttons() {
            return unwrap(this).buttons;
          },

          get relatedTarget() {
            return wrap(unwrap(this).relatedTarget);
          },

          initMouseEvent: function initMouseEvent(
            typeArg,
            canBubbleArg,
            cancelableArg,
            viewArg,
            detailArg,
            screenXArg,
            screenYArg,
            clientXArg,
            clientYArg,
            ctrlKeyArg,
            altKeyArg,
            shiftKeyArg,
            metaKeyArg,
            buttonArg,
            relatedTargetArg)
          {
            unwrap(this).initMouseEvent(
              String(typeArg),
              Boolean(canBubbleArg),
              Boolean(cancelableArg),
              unwrap(viewArg),
              toLong(detailArg),
              toLong(screenXArg),
              toLong(screenYArg),
              toLong(clientXArg),
              toLong(clientYArg),
              Boolean(ctrlKeyArg),
              Boolean(altKeyArg),
              Boolean(shiftKeyArg),
              Boolean(metaKeyArg),
              toUShort(buttonArg),
              unwrap(relatedTargetArg));
          },

          getModifierState: function getModifierState(keyArg) {
            return unwrap(this).getModifierState(String(keyArg));
          },

        },
      });
    });



    /************************************************************************
     *  src/htmlelts.js
     ************************************************************************/

//@line 1 "src/htmlelts.js"
//
// DO NOT EDIT.
// This file was generated by idl2domjs from src/idl/htmlelts.idl
//


//
// Interface HTMLFormControlsCollection
//

    defineLazyProperty(global, "HTMLFormControlsCollection", function() {
      return idl.HTMLFormControlsCollection.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLFormControlsCollection", function() {
      return new IDLInterface({
        name: "HTMLFormControlsCollection",
        superclass: idl.HTMLCollection,
        proxyFactory: HTMLFormControlsCollectionProxy,
        members: {
          namedItem: function namedItem(name) {
            return unwrap(this).namedItem(String(name));
          },

        },
      });
    });

//
// Interface RadioNodeList
//

    defineLazyProperty(global, "RadioNodeList", function() {
      return idl.RadioNodeList.publicInterface;
    }, true);

    defineLazyProperty(idl, "RadioNodeList", function() {
      return new IDLInterface({
        name: "RadioNodeList",
        superclass: idl.NodeList,
        members: {
          get value() {
            return unwrap(this).value;
          },
          set value(newval) {
            unwrap(this).value = String(newval);
          },

        },
      });
    });

//
// Interface HTMLOptionsCollection
//

    defineLazyProperty(global, "HTMLOptionsCollection", function() {
      return idl.HTMLOptionsCollection.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLOptionsCollection", function() {
      return new IDLInterface({
        name: "HTMLOptionsCollection",
        superclass: idl.HTMLCollection,
        proxyFactory: HTMLOptionsCollectionProxy,
        members: {
          get length() {
            return unwrap(this).length;
          },
          set length(newval) {
            unwrap(this).length = toULong(newval);
          },

          namedItem: function namedItem(name) {
            return unwrap(this).namedItem(String(name));
          },

          remove: function remove(index) {
            unwrap(this).remove(toLong(index));
          },

          get selectedIndex() {
            return unwrap(this).selectedIndex;
          },
          set selectedIndex(newval) {
            unwrap(this).selectedIndex = toLong(newval);
          },

        },
      });
    });

//
// Interface HTMLPropertiesCollection
//

    defineLazyProperty(global, "HTMLPropertiesCollection", function() {
      return idl.HTMLPropertiesCollection.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLPropertiesCollection", function() {
      return new IDLInterface({
        name: "HTMLPropertiesCollection",
        superclass: idl.HTMLCollection,
        proxyFactory: HTMLPropertiesCollectionProxy,
        members: {
          namedItem: function namedItem(name) {
            return wrap(unwrap(this).namedItem(String(name)));
          },

          get names() {
            return wrap(unwrap(this).names);
          },

        },
      });
    });

//
// Interface PropertyNodeList
//

    defineLazyProperty(global, "PropertyNodeList", function() {
      return idl.PropertyNodeList.publicInterface;
    }, true);

    defineLazyProperty(idl, "PropertyNodeList", function() {
      return new IDLInterface({
        name: "PropertyNodeList",
        superclass: idl.NodeList,
        members: {
          getValues: function getValues() {
            return wrap(unwrap(this).getValues());
          },

        },
      });
    });

//
// Interface DOMStringMap
//

    defineLazyProperty(global, "DOMStringMap", function() {
      return idl.DOMStringMap.publicInterface;
    }, true);

    defineLazyProperty(idl, "DOMStringMap", function() {
      return new IDLInterface({
        name: "DOMStringMap",
        proxyFactory: DOMStringMapProxy,
        members: {
        },
      });
    });

//
// Interface DOMElementMap
//

    defineLazyProperty(global, "DOMElementMap", function() {
      return idl.DOMElementMap.publicInterface;
    }, true);

    defineLazyProperty(idl, "DOMElementMap", function() {
      return new IDLInterface({
        name: "DOMElementMap",
        proxyFactory: DOMElementMapProxy,
        members: {
        },
      });
    });

//
// Interface CSSStyleDeclaration
//

    defineLazyProperty(global, "CSSStyleDeclaration", function() {
      return idl.CSSStyleDeclaration.publicInterface;
    }, true);

    defineLazyProperty(idl, "CSSStyleDeclaration", function() {
      return new IDLInterface({
        name: "CSSStyleDeclaration",
        members: {
          get cssText() {
            return unwrap(this).cssText;
          },
          set cssText(newval) {
            unwrap(this).cssText = String(newval);
          },

          get length() {
            return unwrap(this).length;
          },

          item: function item(index) {
            return unwrap(this).item(toULong(index));
          },

          getPropertyValue: function getPropertyValue(property) {
            return unwrap(this).getPropertyValue(String(property));
          },

          getPropertyPriority: function getPropertyPriority(property) {
            return unwrap(this).getPropertyPriority(String(property));
          },

          setProperty: function setProperty(
            property,
            value,
            priority)
          {
            unwrap(this).setProperty(
              String(property),
              String(value),
              OptionalString(priority));
          },

          removeProperty: function removeProperty(property) {
            return unwrap(this).removeProperty(String(property));
          },

          get background() {
            return unwrap(this).background;
          },
          set background(newval) {
            unwrap(this).background = String(newval);
          },

          get backgroundAttachment() {
            return unwrap(this).backgroundAttachment;
          },
          set backgroundAttachment(newval) {
            unwrap(this).backgroundAttachment = String(newval);
          },

          get backgroundColor() {
            return unwrap(this).backgroundColor;
          },
          set backgroundColor(newval) {
            unwrap(this).backgroundColor = String(newval);
          },

          get backgroundImage() {
            return unwrap(this).backgroundImage;
          },
          set backgroundImage(newval) {
            unwrap(this).backgroundImage = String(newval);
          },

          get backgroundPosition() {
            return unwrap(this).backgroundPosition;
          },
          set backgroundPosition(newval) {
            unwrap(this).backgroundPosition = String(newval);
          },

          get backgroundRepeat() {
            return unwrap(this).backgroundRepeat;
          },
          set backgroundRepeat(newval) {
            unwrap(this).backgroundRepeat = String(newval);
          },

          get border() {
            return unwrap(this).border;
          },
          set border(newval) {
            unwrap(this).border = String(newval);
          },

          get borderCollapse() {
            return unwrap(this).borderCollapse;
          },
          set borderCollapse(newval) {
            unwrap(this).borderCollapse = String(newval);
          },

          get borderColor() {
            return unwrap(this).borderColor;
          },
          set borderColor(newval) {
            unwrap(this).borderColor = String(newval);
          },

          get borderSpacing() {
            return unwrap(this).borderSpacing;
          },
          set borderSpacing(newval) {
            unwrap(this).borderSpacing = String(newval);
          },

          get borderStyle() {
            return unwrap(this).borderStyle;
          },
          set borderStyle(newval) {
            unwrap(this).borderStyle = String(newval);
          },

          get borderTop() {
            return unwrap(this).borderTop;
          },
          set borderTop(newval) {
            unwrap(this).borderTop = String(newval);
          },

          get borderRight() {
            return unwrap(this).borderRight;
          },
          set borderRight(newval) {
            unwrap(this).borderRight = String(newval);
          },

          get borderBottom() {
            return unwrap(this).borderBottom;
          },
          set borderBottom(newval) {
            unwrap(this).borderBottom = String(newval);
          },

          get borderLeft() {
            return unwrap(this).borderLeft;
          },
          set borderLeft(newval) {
            unwrap(this).borderLeft = String(newval);
          },

          get borderTopColor() {
            return unwrap(this).borderTopColor;
          },
          set borderTopColor(newval) {
            unwrap(this).borderTopColor = String(newval);
          },

          get borderRightColor() {
            return unwrap(this).borderRightColor;
          },
          set borderRightColor(newval) {
            unwrap(this).borderRightColor = String(newval);
          },

          get borderBottomColor() {
            return unwrap(this).borderBottomColor;
          },
          set borderBottomColor(newval) {
            unwrap(this).borderBottomColor = String(newval);
          },

          get borderLeftColor() {
            return unwrap(this).borderLeftColor;
          },
          set borderLeftColor(newval) {
            unwrap(this).borderLeftColor = String(newval);
          },

          get borderTopStyle() {
            return unwrap(this).borderTopStyle;
          },
          set borderTopStyle(newval) {
            unwrap(this).borderTopStyle = String(newval);
          },

          get borderRightStyle() {
            return unwrap(this).borderRightStyle;
          },
          set borderRightStyle(newval) {
            unwrap(this).borderRightStyle = String(newval);
          },

          get borderBottomStyle() {
            return unwrap(this).borderBottomStyle;
          },
          set borderBottomStyle(newval) {
            unwrap(this).borderBottomStyle = String(newval);
          },

          get borderLeftStyle() {
            return unwrap(this).borderLeftStyle;
          },
          set borderLeftStyle(newval) {
            unwrap(this).borderLeftStyle = String(newval);
          },

          get borderTopWidth() {
            return unwrap(this).borderTopWidth;
          },
          set borderTopWidth(newval) {
            unwrap(this).borderTopWidth = String(newval);
          },

          get borderRightWidth() {
            return unwrap(this).borderRightWidth;
          },
          set borderRightWidth(newval) {
            unwrap(this).borderRightWidth = String(newval);
          },

          get borderBottomWidth() {
            return unwrap(this).borderBottomWidth;
          },
          set borderBottomWidth(newval) {
            unwrap(this).borderBottomWidth = String(newval);
          },

          get borderLeftWidth() {
            return unwrap(this).borderLeftWidth;
          },
          set borderLeftWidth(newval) {
            unwrap(this).borderLeftWidth = String(newval);
          },

          get borderWidth() {
            return unwrap(this).borderWidth;
          },
          set borderWidth(newval) {
            unwrap(this).borderWidth = String(newval);
          },

          get bottom() {
            return unwrap(this).bottom;
          },
          set bottom(newval) {
            unwrap(this).bottom = String(newval);
          },

          get captionSide() {
            return unwrap(this).captionSide;
          },
          set captionSide(newval) {
            unwrap(this).captionSide = String(newval);
          },

          get clear() {
            return unwrap(this).clear;
          },
          set clear(newval) {
            unwrap(this).clear = String(newval);
          },

          get clip() {
            return unwrap(this).clip;
          },
          set clip(newval) {
            unwrap(this).clip = String(newval);
          },

          get color() {
            return unwrap(this).color;
          },
          set color(newval) {
            unwrap(this).color = String(newval);
          },

          get content() {
            return unwrap(this).content;
          },
          set content(newval) {
            unwrap(this).content = String(newval);
          },

          get counterIncrement() {
            return unwrap(this).counterIncrement;
          },
          set counterIncrement(newval) {
            unwrap(this).counterIncrement = String(newval);
          },

          get counterReset() {
            return unwrap(this).counterReset;
          },
          set counterReset(newval) {
            unwrap(this).counterReset = String(newval);
          },

          get cursor() {
            return unwrap(this).cursor;
          },
          set cursor(newval) {
            unwrap(this).cursor = String(newval);
          },

          get direction() {
            return unwrap(this).direction;
          },
          set direction(newval) {
            unwrap(this).direction = String(newval);
          },

          get display() {
            return unwrap(this).display;
          },
          set display(newval) {
            unwrap(this).display = String(newval);
          },

          get emptyCells() {
            return unwrap(this).emptyCells;
          },
          set emptyCells(newval) {
            unwrap(this).emptyCells = String(newval);
          },

          get cssFloat() {
            return unwrap(this).cssFloat;
          },
          set cssFloat(newval) {
            unwrap(this).cssFloat = String(newval);
          },

          get font() {
            return unwrap(this).font;
          },
          set font(newval) {
            unwrap(this).font = String(newval);
          },

          get fontFamily() {
            return unwrap(this).fontFamily;
          },
          set fontFamily(newval) {
            unwrap(this).fontFamily = String(newval);
          },

          get fontSize() {
            return unwrap(this).fontSize;
          },
          set fontSize(newval) {
            unwrap(this).fontSize = String(newval);
          },

          get fontSizeAdjust() {
            return unwrap(this).fontSizeAdjust;
          },
          set fontSizeAdjust(newval) {
            unwrap(this).fontSizeAdjust = String(newval);
          },

          get fontStretch() {
            return unwrap(this).fontStretch;
          },
          set fontStretch(newval) {
            unwrap(this).fontStretch = String(newval);
          },

          get fontStyle() {
            return unwrap(this).fontStyle;
          },
          set fontStyle(newval) {
            unwrap(this).fontStyle = String(newval);
          },

          get fontVariant() {
            return unwrap(this).fontVariant;
          },
          set fontVariant(newval) {
            unwrap(this).fontVariant = String(newval);
          },

          get fontWeight() {
            return unwrap(this).fontWeight;
          },
          set fontWeight(newval) {
            unwrap(this).fontWeight = String(newval);
          },

          get height() {
            return unwrap(this).height;
          },
          set height(newval) {
            unwrap(this).height = String(newval);
          },

          get left() {
            return unwrap(this).left;
          },
          set left(newval) {
            unwrap(this).left = String(newval);
          },

          get letterSpacing() {
            return unwrap(this).letterSpacing;
          },
          set letterSpacing(newval) {
            unwrap(this).letterSpacing = String(newval);
          },

          get lineHeight() {
            return unwrap(this).lineHeight;
          },
          set lineHeight(newval) {
            unwrap(this).lineHeight = String(newval);
          },

          get listStyle() {
            return unwrap(this).listStyle;
          },
          set listStyle(newval) {
            unwrap(this).listStyle = String(newval);
          },

          get listStyleImage() {
            return unwrap(this).listStyleImage;
          },
          set listStyleImage(newval) {
            unwrap(this).listStyleImage = String(newval);
          },

          get listStylePosition() {
            return unwrap(this).listStylePosition;
          },
          set listStylePosition(newval) {
            unwrap(this).listStylePosition = String(newval);
          },

          get listStyleType() {
            return unwrap(this).listStyleType;
          },
          set listStyleType(newval) {
            unwrap(this).listStyleType = String(newval);
          },

          get margin() {
            return unwrap(this).margin;
          },
          set margin(newval) {
            unwrap(this).margin = String(newval);
          },

          get marginTop() {
            return unwrap(this).marginTop;
          },
          set marginTop(newval) {
            unwrap(this).marginTop = String(newval);
          },

          get marginRight() {
            return unwrap(this).marginRight;
          },
          set marginRight(newval) {
            unwrap(this).marginRight = String(newval);
          },

          get marginBottom() {
            return unwrap(this).marginBottom;
          },
          set marginBottom(newval) {
            unwrap(this).marginBottom = String(newval);
          },

          get marginLeft() {
            return unwrap(this).marginLeft;
          },
          set marginLeft(newval) {
            unwrap(this).marginLeft = String(newval);
          },

          get markerOffset() {
            return unwrap(this).markerOffset;
          },
          set markerOffset(newval) {
            unwrap(this).markerOffset = String(newval);
          },

          get marks() {
            return unwrap(this).marks;
          },
          set marks(newval) {
            unwrap(this).marks = String(newval);
          },

          get maxHeight() {
            return unwrap(this).maxHeight;
          },
          set maxHeight(newval) {
            unwrap(this).maxHeight = String(newval);
          },

          get maxWidth() {
            return unwrap(this).maxWidth;
          },
          set maxWidth(newval) {
            unwrap(this).maxWidth = String(newval);
          },

          get minHeight() {
            return unwrap(this).minHeight;
          },
          set minHeight(newval) {
            unwrap(this).minHeight = String(newval);
          },

          get minWidth() {
            return unwrap(this).minWidth;
          },
          set minWidth(newval) {
            unwrap(this).minWidth = String(newval);
          },

          get opacity() {
            return unwrap(this).opacity;
          },
          set opacity(newval) {
            unwrap(this).opacity = String(newval);
          },

          get orphans() {
            return unwrap(this).orphans;
          },
          set orphans(newval) {
            unwrap(this).orphans = String(newval);
          },

          get outline() {
            return unwrap(this).outline;
          },
          set outline(newval) {
            unwrap(this).outline = String(newval);
          },

          get outlineColor() {
            return unwrap(this).outlineColor;
          },
          set outlineColor(newval) {
            unwrap(this).outlineColor = String(newval);
          },

          get outlineStyle() {
            return unwrap(this).outlineStyle;
          },
          set outlineStyle(newval) {
            unwrap(this).outlineStyle = String(newval);
          },

          get outlineWidth() {
            return unwrap(this).outlineWidth;
          },
          set outlineWidth(newval) {
            unwrap(this).outlineWidth = String(newval);
          },

          get overflow() {
            return unwrap(this).overflow;
          },
          set overflow(newval) {
            unwrap(this).overflow = String(newval);
          },

          get padding() {
            return unwrap(this).padding;
          },
          set padding(newval) {
            unwrap(this).padding = String(newval);
          },

          get paddingTop() {
            return unwrap(this).paddingTop;
          },
          set paddingTop(newval) {
            unwrap(this).paddingTop = String(newval);
          },

          get paddingRight() {
            return unwrap(this).paddingRight;
          },
          set paddingRight(newval) {
            unwrap(this).paddingRight = String(newval);
          },

          get paddingBottom() {
            return unwrap(this).paddingBottom;
          },
          set paddingBottom(newval) {
            unwrap(this).paddingBottom = String(newval);
          },

          get paddingLeft() {
            return unwrap(this).paddingLeft;
          },
          set paddingLeft(newval) {
            unwrap(this).paddingLeft = String(newval);
          },

          get page() {
            return unwrap(this).page;
          },
          set page(newval) {
            unwrap(this).page = String(newval);
          },

          get pageBreakAfter() {
            return unwrap(this).pageBreakAfter;
          },
          set pageBreakAfter(newval) {
            unwrap(this).pageBreakAfter = String(newval);
          },

          get pageBreakBefore() {
            return unwrap(this).pageBreakBefore;
          },
          set pageBreakBefore(newval) {
            unwrap(this).pageBreakBefore = String(newval);
          },

          get pageBreakInside() {
            return unwrap(this).pageBreakInside;
          },
          set pageBreakInside(newval) {
            unwrap(this).pageBreakInside = String(newval);
          },

          get position() {
            return unwrap(this).position;
          },
          set position(newval) {
            unwrap(this).position = String(newval);
          },

          get quotes() {
            return unwrap(this).quotes;
          },
          set quotes(newval) {
            unwrap(this).quotes = String(newval);
          },

          get right() {
            return unwrap(this).right;
          },
          set right(newval) {
            unwrap(this).right = String(newval);
          },

          get size() {
            return unwrap(this).size;
          },
          set size(newval) {
            unwrap(this).size = String(newval);
          },

          get tableLayout() {
            return unwrap(this).tableLayout;
          },
          set tableLayout(newval) {
            unwrap(this).tableLayout = String(newval);
          },

          get textAlign() {
            return unwrap(this).textAlign;
          },
          set textAlign(newval) {
            unwrap(this).textAlign = String(newval);
          },

          get textDecoration() {
            return unwrap(this).textDecoration;
          },
          set textDecoration(newval) {
            unwrap(this).textDecoration = String(newval);
          },

          get textIndent() {
            return unwrap(this).textIndent;
          },
          set textIndent(newval) {
            unwrap(this).textIndent = String(newval);
          },

          get textShadow() {
            return unwrap(this).textShadow;
          },
          set textShadow(newval) {
            unwrap(this).textShadow = String(newval);
          },

          get textTransform() {
            return unwrap(this).textTransform;
          },
          set textTransform(newval) {
            unwrap(this).textTransform = String(newval);
          },

          get top() {
            return unwrap(this).top;
          },
          set top(newval) {
            unwrap(this).top = String(newval);
          },

          get unicodeBidi() {
            return unwrap(this).unicodeBidi;
          },
          set unicodeBidi(newval) {
            unwrap(this).unicodeBidi = String(newval);
          },

          get verticalAlign() {
            return unwrap(this).verticalAlign;
          },
          set verticalAlign(newval) {
            unwrap(this).verticalAlign = String(newval);
          },

          get visibility() {
            return unwrap(this).visibility;
          },
          set visibility(newval) {
            unwrap(this).visibility = String(newval);
          },

          get whiteSpace() {
            return unwrap(this).whiteSpace;
          },
          set whiteSpace(newval) {
            unwrap(this).whiteSpace = String(newval);
          },

          get widows() {
            return unwrap(this).widows;
          },
          set widows(newval) {
            unwrap(this).widows = String(newval);
          },

          get width() {
            return unwrap(this).width;
          },
          set width(newval) {
            unwrap(this).width = String(newval);
          },

          get wordSpacing() {
            return unwrap(this).wordSpacing;
          },
          set wordSpacing(newval) {
            unwrap(this).wordSpacing = String(newval);
          },

          get zIndex() {
            return unwrap(this).zIndex;
          },
          set zIndex(newval) {
            unwrap(this).zIndex = String(newval);
          },

        },
      });
    });

//
// Interface HTMLElement
//

    defineLazyProperty(global, "HTMLElement", function() {
      return idl.HTMLElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLElement", function() {
      return new IDLInterface({
        name: "HTMLElement",
        superclass: idl.Element,
        members: {
          get innerHTML() {
            //TODO: interesting
            return unwrap(this).innerHTML;
          },
          set innerHTML(newval) {
            unwrap(this).innerHTML = String(newval);
          },

          get outerHTML() {
            return unwrap(this).outerHTML;
          },
          set outerHTML(newval) {
            unwrap(this).outerHTML = String(newval);
          },

          insertAdjacentHTML: function insertAdjacentHTML(
            position,
            text)
          {
            unwrap(this).insertAdjacentHTML(
              String(position),
              String(text));
          },

          get id() {
            return unwrap(this).id;
          },
          set id(newval) {
            unwrap(this).id = String(newval);
          },

          get title() {
            return unwrap(this).title;
          },
          set title(newval) {
            unwrap(this).title = String(newval);
          },

          get lang() {
            return unwrap(this).lang;
          },
          set lang(newval) {
            unwrap(this).lang = String(newval);
          },

          get dir() {
            return unwrap(this).dir;
          },
          set dir(newval) {
            unwrap(this).dir = String(newval);
          },

          get className() {
            return unwrap(this).className;
          },
          set className(newval) {
            unwrap(this).className = String(newval);
          },

          get classList() {
            return wrap(unwrap(this).classList);
          },

          get dataset() {
            return wrap(unwrap(this).dataset);
          },

          get itemScope() {
            return unwrap(this).itemScope;
          },
          set itemScope(newval) {
            unwrap(this).itemScope = Boolean(newval);
          },

          get itemType() {
            return unwrap(this).itemType;
          },
          set itemType(newval) {
            unwrap(this).itemType = String(newval);
          },

          get itemId() {
            return unwrap(this).itemId;
          },
          set itemId(newval) {
            unwrap(this).itemId = String(newval);
          },

          get itemRef() {
            return wrap(unwrap(this).itemRef);
          },

          get itemProp() {
            return wrap(unwrap(this).itemProp);
          },

          get properties() {
            return wrap(unwrap(this).properties);
          },

          get itemValue() {
            return unwrap(this).itemValue;
          },
          set itemValue(newval) {
            unwrap(this).itemValue = newval;
          },

          get hidden() {
            return unwrap(this).hidden;
          },
          set hidden(newval) {
            unwrap(this).hidden = Boolean(newval);
          },

          click: function click() {
            unwrap(this).click();
          },

          get tabIndex() {
            return unwrap(this).tabIndex;
          },
          set tabIndex(newval) {
            unwrap(this).tabIndex = toLong(newval);
          },

          focus: function focus() {
            unwrap(this).focus();
          },

          blur: function blur() {
            unwrap(this).blur();
          },

          get accessKey() {
            return unwrap(this).accessKey;
          },
          set accessKey(newval) {
            unwrap(this).accessKey = String(newval);
          },

          get accessKeyLabel() {
            return unwrap(this).accessKeyLabel;
          },

          get draggable() {
            return unwrap(this).draggable;
          },
          set draggable(newval) {
            unwrap(this).draggable = Boolean(newval);
          },

          get dropzone() {
            return wrap(unwrap(this).dropzone);
          },

          get contentEditable() {
            return unwrap(this).contentEditable;
          },
          set contentEditable(newval) {
            unwrap(this).contentEditable = String(newval);
          },

          get isContentEditable() {
            return unwrap(this).isContentEditable;
          },

          get contextMenu() {
            return wrap(unwrap(this).contextMenu);
          },
          set contextMenu(newval) {
            unwrap(this).contextMenu = unwrapOrNull(newval);
          },

          get spellcheck() {
            return unwrap(this).spellcheck;
          },
          set spellcheck(newval) {
            unwrap(this).spellcheck = Boolean(newval);
          },

          get commandType() {
            return unwrap(this).commandType;
          },

          get commandLabel() {
            return unwrap(this).commandLabel;
          },

          get commandIcon() {
            return unwrap(this).commandIcon;
          },

          get commandHidden() {
            return unwrap(this).commandHidden;
          },

          get commandDisabled() {
            return unwrap(this).commandDisabled;
          },

          get commandChecked() {
            return unwrap(this).commandChecked;
          },

          get style() {
            return wrap(unwrap(this).style);
          },

          get onabort() {
            return unwrap(this).onabort;
          },
          set onabort(newval) {
            unwrap(this).onabort = toCallbackOrNull(newval);
          },

          get onblur() {
            return unwrap(this).onblur;
          },
          set onblur(newval) {
            unwrap(this).onblur = toCallbackOrNull(newval);
          },

          get oncanplay() {
            return unwrap(this).oncanplay;
          },
          set oncanplay(newval) {
            unwrap(this).oncanplay = toCallbackOrNull(newval);
          },

          get oncanplaythrough() {
            return unwrap(this).oncanplaythrough;
          },
          set oncanplaythrough(newval) {
            unwrap(this).oncanplaythrough = toCallbackOrNull(newval);
          },

          get onchange() {
            return unwrap(this).onchange;
          },
          set onchange(newval) {
            unwrap(this).onchange = toCallbackOrNull(newval);
          },

          get onclick() {
            return unwrap(this).onclick;
          },
          set onclick(newval) {
            unwrap(this).onclick = toCallbackOrNull(newval);
          },

          get oncontextmenu() {
            return unwrap(this).oncontextmenu;
          },
          set oncontextmenu(newval) {
            unwrap(this).oncontextmenu = toCallbackOrNull(newval);
          },

          get oncuechange() {
            return unwrap(this).oncuechange;
          },
          set oncuechange(newval) {
            unwrap(this).oncuechange = toCallbackOrNull(newval);
          },

          get ondblclick() {
            return unwrap(this).ondblclick;
          },
          set ondblclick(newval) {
            unwrap(this).ondblclick = toCallbackOrNull(newval);
          },

          get ondrag() {
            return unwrap(this).ondrag;
          },
          set ondrag(newval) {
            unwrap(this).ondrag = toCallbackOrNull(newval);
          },

          get ondragend() {
            return unwrap(this).ondragend;
          },
          set ondragend(newval) {
            unwrap(this).ondragend = toCallbackOrNull(newval);
          },

          get ondragenter() {
            return unwrap(this).ondragenter;
          },
          set ondragenter(newval) {
            unwrap(this).ondragenter = toCallbackOrNull(newval);
          },

          get ondragleave() {
            return unwrap(this).ondragleave;
          },
          set ondragleave(newval) {
            unwrap(this).ondragleave = toCallbackOrNull(newval);
          },

          get ondragover() {
            return unwrap(this).ondragover;
          },
          set ondragover(newval) {
            unwrap(this).ondragover = toCallbackOrNull(newval);
          },

          get ondragstart() {
            return unwrap(this).ondragstart;
          },
          set ondragstart(newval) {
            unwrap(this).ondragstart = toCallbackOrNull(newval);
          },

          get ondrop() {
            return unwrap(this).ondrop;
          },
          set ondrop(newval) {
            unwrap(this).ondrop = toCallbackOrNull(newval);
          },

          get ondurationchange() {
            return unwrap(this).ondurationchange;
          },
          set ondurationchange(newval) {
            unwrap(this).ondurationchange = toCallbackOrNull(newval);
          },

          get onemptied() {
            return unwrap(this).onemptied;
          },
          set onemptied(newval) {
            unwrap(this).onemptied = toCallbackOrNull(newval);
          },

          get onended() {
            return unwrap(this).onended;
          },
          set onended(newval) {
            unwrap(this).onended = toCallbackOrNull(newval);
          },

          get onerror() {
            return unwrap(this).onerror;
          },
          set onerror(newval) {
            unwrap(this).onerror = toCallbackOrNull(newval);
          },

          get onfocus() {
            return unwrap(this).onfocus;
          },
          set onfocus(newval) {
            unwrap(this).onfocus = toCallbackOrNull(newval);
          },

          get oninput() {
            return unwrap(this).oninput;
          },
          set oninput(newval) {
            unwrap(this).oninput = toCallbackOrNull(newval);
          },

          get oninvalid() {
            return unwrap(this).oninvalid;
          },
          set oninvalid(newval) {
            unwrap(this).oninvalid = toCallbackOrNull(newval);
          },

          get onkeydown() {
            return unwrap(this).onkeydown;
          },
          set onkeydown(newval) {
            unwrap(this).onkeydown = toCallbackOrNull(newval);
          },

          get onkeypress() {
            return unwrap(this).onkeypress;
          },
          set onkeypress(newval) {
            unwrap(this).onkeypress = toCallbackOrNull(newval);
          },

          get onkeyup() {
            return unwrap(this).onkeyup;
          },
          set onkeyup(newval) {
            unwrap(this).onkeyup = toCallbackOrNull(newval);
          },

          get onload() {
            return unwrap(this).onload;
          },
          set onload(newval) {
            unwrap(this).onload = toCallbackOrNull(newval);
          },

          get onloadeddata() {
            return unwrap(this).onloadeddata;
          },
          set onloadeddata(newval) {
            unwrap(this).onloadeddata = toCallbackOrNull(newval);
          },

          get onloadedmetadata() {
            return unwrap(this).onloadedmetadata;
          },
          set onloadedmetadata(newval) {
            unwrap(this).onloadedmetadata = toCallbackOrNull(newval);
          },

          get onloadstart() {
            return unwrap(this).onloadstart;
          },
          set onloadstart(newval) {
            unwrap(this).onloadstart = toCallbackOrNull(newval);
          },

          get onmousedown() {
            return unwrap(this).onmousedown;
          },
          set onmousedown(newval) {
            unwrap(this).onmousedown = toCallbackOrNull(newval);
          },

          get onmousemove() {
            return unwrap(this).onmousemove;
          },
          set onmousemove(newval) {
            unwrap(this).onmousemove = toCallbackOrNull(newval);
          },

          get onmouseout() {
            return unwrap(this).onmouseout;
          },
          set onmouseout(newval) {
            unwrap(this).onmouseout = toCallbackOrNull(newval);
          },

          get onmouseover() {
            return unwrap(this).onmouseover;
          },
          set onmouseover(newval) {
            unwrap(this).onmouseover = toCallbackOrNull(newval);
          },

          get onmouseup() {
            return unwrap(this).onmouseup;
          },
          set onmouseup(newval) {
            unwrap(this).onmouseup = toCallbackOrNull(newval);
          },

          get onmousewheel() {
            return unwrap(this).onmousewheel;
          },
          set onmousewheel(newval) {
            unwrap(this).onmousewheel = toCallbackOrNull(newval);
          },

          get onpause() {
            return unwrap(this).onpause;
          },
          set onpause(newval) {
            unwrap(this).onpause = toCallbackOrNull(newval);
          },

          get onplay() {
            return unwrap(this).onplay;
          },
          set onplay(newval) {
            unwrap(this).onplay = toCallbackOrNull(newval);
          },

          get onplaying() {
            return unwrap(this).onplaying;
          },
          set onplaying(newval) {
            unwrap(this).onplaying = toCallbackOrNull(newval);
          },

          get onprogress() {
            return unwrap(this).onprogress;
          },
          set onprogress(newval) {
            unwrap(this).onprogress = toCallbackOrNull(newval);
          },

          get onratechange() {
            return unwrap(this).onratechange;
          },
          set onratechange(newval) {
            unwrap(this).onratechange = toCallbackOrNull(newval);
          },

          get onreadystatechange() {
            return unwrap(this).onreadystatechange;
          },
          set onreadystatechange(newval) {
            unwrap(this).onreadystatechange = toCallbackOrNull(newval);
          },

          get onreset() {
            return unwrap(this).onreset;
          },
          set onreset(newval) {
            unwrap(this).onreset = toCallbackOrNull(newval);
          },

          get onscroll() {
            return unwrap(this).onscroll;
          },
          set onscroll(newval) {
            unwrap(this).onscroll = toCallbackOrNull(newval);
          },

          get onseeked() {
            return unwrap(this).onseeked;
          },
          set onseeked(newval) {
            unwrap(this).onseeked = toCallbackOrNull(newval);
          },

          get onseeking() {
            return unwrap(this).onseeking;
          },
          set onseeking(newval) {
            unwrap(this).onseeking = toCallbackOrNull(newval);
          },

          get onselect() {
            return unwrap(this).onselect;
          },
          set onselect(newval) {
            unwrap(this).onselect = toCallbackOrNull(newval);
          },

          get onshow() {
            return unwrap(this).onshow;
          },
          set onshow(newval) {
            unwrap(this).onshow = toCallbackOrNull(newval);
          },

          get onstalled() {
            return unwrap(this).onstalled;
          },
          set onstalled(newval) {
            unwrap(this).onstalled = toCallbackOrNull(newval);
          },

          get onsubmit() {
            return unwrap(this).onsubmit;
          },
          set onsubmit(newval) {
            unwrap(this).onsubmit = toCallbackOrNull(newval);
          },

          get onsuspend() {
            return unwrap(this).onsuspend;
          },
          set onsuspend(newval) {
            unwrap(this).onsuspend = toCallbackOrNull(newval);
          },

          get ontimeupdate() {
            return unwrap(this).ontimeupdate;
          },
          set ontimeupdate(newval) {
            unwrap(this).ontimeupdate = toCallbackOrNull(newval);
          },

          get onvolumechange() {
            return unwrap(this).onvolumechange;
          },
          set onvolumechange(newval) {
            unwrap(this).onvolumechange = toCallbackOrNull(newval);
          },

          get onwaiting() {
            return unwrap(this).onwaiting;
          },
          set onwaiting(newval) {
            unwrap(this).onwaiting = toCallbackOrNull(newval);
          },

        },
      });
    });

//
// Interface HTMLUnknownElement
//

    defineLazyProperty(global, "HTMLUnknownElement", function() {
      return idl.HTMLUnknownElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLUnknownElement", function() {
      return new IDLInterface({
        name: "HTMLUnknownElement",
        superclass: idl.HTMLElement,
        members: {
        },
      });
    });

//
// Interface HTMLHtmlElement
//

    defineLazyProperty(global, "HTMLHtmlElement", function() {
      return idl.HTMLHtmlElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLHtmlElement", function() {
      return new IDLInterface({
        name: "HTMLHtmlElement",
        superclass: idl.HTMLElement,
        members: {
        },
      });
    });

//
// Interface HTMLHeadElement
//

    defineLazyProperty(global, "HTMLHeadElement", function() {
      return idl.HTMLHeadElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLHeadElement", function() {
      return new IDLInterface({
        name: "HTMLHeadElement",
        superclass: idl.HTMLElement,
        members: {
        },
      });
    });

//
// Interface HTMLTitleElement
//

    defineLazyProperty(global, "HTMLTitleElement", function() {
      return idl.HTMLTitleElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLTitleElement", function() {
      return new IDLInterface({
        name: "HTMLTitleElement",
        superclass: idl.HTMLElement,
        members: {
          get text() {
            return unwrap(this).text;
          },
          set text(newval) {
            unwrap(this).text = String(newval);
          },

        },
      });
    });

//
// Interface HTMLBaseElement
//

    defineLazyProperty(global, "HTMLBaseElement", function() {
      return idl.HTMLBaseElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLBaseElement", function() {
      return new IDLInterface({
        name: "HTMLBaseElement",
        superclass: idl.HTMLElement,
        members: {
          get href() {
            return unwrap(this).href;
          },
          set href(newval) {
            unwrap(this).href = String(newval);
          },

          get target() {
            return unwrap(this).target;
          },
          set target(newval) {
            unwrap(this).target = String(newval);
          },

        },
      });
    });

//
// Interface HTMLLinkElement
//

    defineLazyProperty(global, "HTMLLinkElement", function() {
      return idl.HTMLLinkElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLLinkElement", function() {
      return new IDLInterface({
        name: "HTMLLinkElement",
        superclass: idl.HTMLElement,
        members: {
          get disabled() {
            return unwrap(this).disabled;
          },
          set disabled(newval) {
            unwrap(this).disabled = Boolean(newval);
          },

          get href() {
            return unwrap(this).href;
          },
          set href(newval) {
            unwrap(this).href = String(newval);
          },

          get rel() {
            return unwrap(this).rel;
          },
          set rel(newval) {
            unwrap(this).rel = String(newval);
          },

          get relList() {
            return wrap(unwrap(this).relList);
          },

          get media() {
            return unwrap(this).media;
          },
          set media(newval) {
            unwrap(this).media = String(newval);
          },

          get hreflang() {
            return unwrap(this).hreflang;
          },
          set hreflang(newval) {
            unwrap(this).hreflang = String(newval);
          },

          get type() {
            return unwrap(this).type;
          },
          set type(newval) {
            unwrap(this).type = String(newval);
          },

          get sizes() {
            return wrap(unwrap(this).sizes);
          },

        },
      });
    });

//
// Interface HTMLMetaElement
//

    defineLazyProperty(global, "HTMLMetaElement", function() {
      return idl.HTMLMetaElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLMetaElement", function() {
      return new IDLInterface({
        name: "HTMLMetaElement",
        superclass: idl.HTMLElement,
        members: {
          get name() {
            return unwrap(this).name;
          },
          set name(newval) {
            unwrap(this).name = String(newval);
          },

          get httpEquiv() {
            return unwrap(this).httpEquiv;
          },
          set httpEquiv(newval) {
            unwrap(this).httpEquiv = String(newval);
          },

          get content() {
            return unwrap(this).content;
          },
          set content(newval) {
            unwrap(this).content = String(newval);
          },

        },
      });
    });

//
// Interface HTMLStyleElement
//

    defineLazyProperty(global, "HTMLStyleElement", function() {
      return idl.HTMLStyleElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLStyleElement", function() {
      return new IDLInterface({
        name: "HTMLStyleElement",
        superclass: idl.HTMLElement,
        members: {
          get disabled() {
            return unwrap(this).disabled;
          },
          set disabled(newval) {
            unwrap(this).disabled = Boolean(newval);
          },

          get media() {
            return unwrap(this).media;
          },
          set media(newval) {
            unwrap(this).media = String(newval);
          },

          get type() {
            return unwrap(this).type;
          },
          set type(newval) {
            unwrap(this).type = String(newval);
          },

          get scoped() {
            return unwrap(this).scoped;
          },
          set scoped(newval) {
            unwrap(this).scoped = Boolean(newval);
          },

        },
      });
    });

//
// Interface HTMLScriptElement
//

    defineLazyProperty(global, "HTMLScriptElement", function() {
      return idl.HTMLScriptElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLScriptElement", function() {
      return new IDLInterface({
        name: "HTMLScriptElement",
        superclass: idl.HTMLElement,
        members: {
          get src() {
            return unwrap(this).src;
          },
          set src(newval) {
            unwrap(this).src = String(newval);
          },

          get async() {
            return unwrap(this).async;
          },
          set async(newval) {
            unwrap(this).async = Boolean(newval);
          },

          get defer() {
            return unwrap(this).defer;
          },
          set defer(newval) {
            unwrap(this).defer = Boolean(newval);
          },

          get type() {
            return unwrap(this).type;
          },
          set type(newval) {
            unwrap(this).type = String(newval);
          },

          get charset() {
            return unwrap(this).charset;
          },
          set charset(newval) {
            unwrap(this).charset = String(newval);
          },

          get text() {
            return unwrap(this).text;
          },
          set text(newval) {
            unwrap(this).text = String(newval);
          },

        },
      });
    });

//
// Interface HTMLBodyElement
//

    defineLazyProperty(global, "HTMLBodyElement", function() {
      return idl.HTMLBodyElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLBodyElement", function() {
      return new IDLInterface({
        name: "HTMLBodyElement",
        superclass: idl.HTMLElement,
        members: {
          get onafterprint() {
            return unwrap(this).onafterprint;
          },
          set onafterprint(newval) {
            unwrap(this).onafterprint = toCallbackOrNull(newval);
          },

          get onbeforeprint() {
            return unwrap(this).onbeforeprint;
          },
          set onbeforeprint(newval) {
            unwrap(this).onbeforeprint = toCallbackOrNull(newval);
          },

          get onbeforeunload() {
            return unwrap(this).onbeforeunload;
          },
          set onbeforeunload(newval) {
            unwrap(this).onbeforeunload = toCallbackOrNull(newval);
          },

          get onblur() {
            return unwrap(this).onblur;
          },
          set onblur(newval) {
            unwrap(this).onblur = toCallbackOrNull(newval);
          },

          get onerror() {
            return unwrap(this).onerror;
          },
          set onerror(newval) {
            unwrap(this).onerror = toCallbackOrNull(newval);
          },

          get onfocus() {
            return unwrap(this).onfocus;
          },
          set onfocus(newval) {
            unwrap(this).onfocus = toCallbackOrNull(newval);
          },

          get onhashchange() {
            return unwrap(this).onhashchange;
          },
          set onhashchange(newval) {
            unwrap(this).onhashchange = toCallbackOrNull(newval);
          },

          get onload() {
            return unwrap(this).onload;
          },
          set onload(newval) {
            unwrap(this).onload = toCallbackOrNull(newval);
          },

          get onmessage() {
            return unwrap(this).onmessage;
          },
          set onmessage(newval) {
            unwrap(this).onmessage = toCallbackOrNull(newval);
          },

          get onoffline() {
            return unwrap(this).onoffline;
          },
          set onoffline(newval) {
            unwrap(this).onoffline = toCallbackOrNull(newval);
          },

          get ononline() {
            return unwrap(this).ononline;
          },
          set ononline(newval) {
            unwrap(this).ononline = toCallbackOrNull(newval);
          },

          get onpopstate() {
            return unwrap(this).onpopstate;
          },
          set onpopstate(newval) {
            unwrap(this).onpopstate = toCallbackOrNull(newval);
          },

          get onpagehide() {
            return unwrap(this).onpagehide;
          },
          set onpagehide(newval) {
            unwrap(this).onpagehide = toCallbackOrNull(newval);
          },

          get onpageshow() {
            return unwrap(this).onpageshow;
          },
          set onpageshow(newval) {
            unwrap(this).onpageshow = toCallbackOrNull(newval);
          },

          get onredo() {
            return unwrap(this).onredo;
          },
          set onredo(newval) {
            unwrap(this).onredo = toCallbackOrNull(newval);
          },

          get onresize() {
            return unwrap(this).onresize;
          },
          set onresize(newval) {
            unwrap(this).onresize = toCallbackOrNull(newval);
          },

          get onscroll() {
            return unwrap(this).onscroll;
          },
          set onscroll(newval) {
            unwrap(this).onscroll = toCallbackOrNull(newval);
          },

          get onstorage() {
            return unwrap(this).onstorage;
          },
          set onstorage(newval) {
            unwrap(this).onstorage = toCallbackOrNull(newval);
          },

          get onundo() {
            return unwrap(this).onundo;
          },
          set onundo(newval) {
            unwrap(this).onundo = toCallbackOrNull(newval);
          },

          get onunload() {
            return unwrap(this).onunload;
          },
          set onunload(newval) {
            unwrap(this).onunload = toCallbackOrNull(newval);
          },

        },
      });
    });

//
// Interface HTMLHeadingElement
//

    defineLazyProperty(global, "HTMLHeadingElement", function() {
      return idl.HTMLHeadingElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLHeadingElement", function() {
      return new IDLInterface({
        name: "HTMLHeadingElement",
        superclass: idl.HTMLElement,
        members: {
        },
      });
    });

//
// Interface HTMLParagraphElement
//

    defineLazyProperty(global, "HTMLParagraphElement", function() {
      return idl.HTMLParagraphElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLParagraphElement", function() {
      return new IDLInterface({
        name: "HTMLParagraphElement",
        superclass: idl.HTMLElement,
        members: {
        },
      });
    });

//
// Interface HTMLHRElement
//

    defineLazyProperty(global, "HTMLHRElement", function() {
      return idl.HTMLHRElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLHRElement", function() {
      return new IDLInterface({
        name: "HTMLHRElement",
        superclass: idl.HTMLElement,
        members: {
        },
      });
    });

//
// Interface HTMLPreElement
//

    defineLazyProperty(global, "HTMLPreElement", function() {
      return idl.HTMLPreElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLPreElement", function() {
      return new IDLInterface({
        name: "HTMLPreElement",
        superclass: idl.HTMLElement,
        members: {
        },
      });
    });

//
// Interface HTMLQuoteElement
//

    defineLazyProperty(global, "HTMLQuoteElement", function() {
      return idl.HTMLQuoteElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLQuoteElement", function() {
      return new IDLInterface({
        name: "HTMLQuoteElement",
        superclass: idl.HTMLElement,
        members: {
          get cite() {
            return unwrap(this).cite;
          },
          set cite(newval) {
            unwrap(this).cite = String(newval);
          },

        },
      });
    });

//
// Interface HTMLOListElement
//

    defineLazyProperty(global, "HTMLOListElement", function() {
      return idl.HTMLOListElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLOListElement", function() {
      return new IDLInterface({
        name: "HTMLOListElement",
        superclass: idl.HTMLElement,
        members: {
          get reversed() {
            return unwrap(this).reversed;
          },
          set reversed(newval) {
            unwrap(this).reversed = Boolean(newval);
          },

          get start() {
            return unwrap(this).start;
          },
          set start(newval) {
            unwrap(this).start = toLong(newval);
          },

          get type() {
            return unwrap(this).type;
          },
          set type(newval) {
            unwrap(this).type = String(newval);
          },

        },
      });
    });

//
// Interface HTMLUListElement
//

    defineLazyProperty(global, "HTMLUListElement", function() {
      return idl.HTMLUListElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLUListElement", function() {
      return new IDLInterface({
        name: "HTMLUListElement",
        superclass: idl.HTMLElement,
        members: {
        },
      });
    });

//
// Interface HTMLLIElement
//

    defineLazyProperty(global, "HTMLLIElement", function() {
      return idl.HTMLLIElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLLIElement", function() {
      return new IDLInterface({
        name: "HTMLLIElement",
        superclass: idl.HTMLElement,
        members: {
          get value() {
            return unwrap(this).value;
          },
          set value(newval) {
            unwrap(this).value = toLong(newval);
          },

        },
      });
    });

//
// Interface HTMLDListElement
//

    defineLazyProperty(global, "HTMLDListElement", function() {
      return idl.HTMLDListElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLDListElement", function() {
      return new IDLInterface({
        name: "HTMLDListElement",
        superclass: idl.HTMLElement,
        members: {
        },
      });
    });

//
// Interface HTMLDivElement
//

    defineLazyProperty(global, "HTMLDivElement", function() {
      return idl.HTMLDivElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLDivElement", function() {
      return new IDLInterface({
        name: "HTMLDivElement",
        superclass: idl.HTMLElement,
        members: {
        },
      });
    });

//
// Interface HTMLAnchorElement
//

    defineLazyProperty(global, "HTMLAnchorElement", function() {
      return idl.HTMLAnchorElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLAnchorElement", function() {
      return new IDLInterface({
        name: "HTMLAnchorElement",
        superclass: idl.HTMLElement,
        members: {
          get href() {
            return unwrap(this).href;
          },
          set href(newval) {
            unwrap(this).href = String(newval);
          },

          get target() {
            return unwrap(this).target;
          },
          set target(newval) {
            unwrap(this).target = String(newval);
          },

          get download() {
            return unwrap(this).download;
          },
          set download(newval) {
            unwrap(this).download = String(newval);
          },

          get ping() {
            return unwrap(this).ping;
          },
          set ping(newval) {
            unwrap(this).ping = String(newval);
          },

          get rel() {
            return unwrap(this).rel;
          },
          set rel(newval) {
            unwrap(this).rel = String(newval);
          },

          get relList() {
            return wrap(unwrap(this).relList);
          },

          get media() {
            return unwrap(this).media;
          },
          set media(newval) {
            unwrap(this).media = String(newval);
          },

          get hreflang() {
            return unwrap(this).hreflang;
          },
          set hreflang(newval) {
            unwrap(this).hreflang = String(newval);
          },

          get type() {
            return unwrap(this).type;
          },
          set type(newval) {
            unwrap(this).type = String(newval);
          },

          get text() {
            return unwrap(this).text;
          },
          set text(newval) {
            unwrap(this).text = String(newval);
          },

          get protocol() {
            return unwrap(this).protocol;
          },
          set protocol(newval) {
            unwrap(this).protocol = String(newval);
          },

          get host() {
            return unwrap(this).host;
          },
          set host(newval) {
            unwrap(this).host = String(newval);
          },

          get hostname() {
            return unwrap(this).hostname;
          },
          set hostname(newval) {
            unwrap(this).hostname = String(newval);
          },

          get port() {
            return unwrap(this).port;
          },
          set port(newval) {
            unwrap(this).port = String(newval);
          },

          get pathname() {
            return unwrap(this).pathname;
          },
          set pathname(newval) {
            unwrap(this).pathname = String(newval);
          },

          get search() {
            return unwrap(this).search;
          },
          set search(newval) {
            unwrap(this).search = String(newval);
          },

          get hash() {
            return unwrap(this).hash;
          },
          set hash(newval) {
            unwrap(this).hash = String(newval);
          },

        },
      });
    });

//
// Interface HTMLTimeElement
//

    defineLazyProperty(global, "HTMLTimeElement", function() {
      return idl.HTMLTimeElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLTimeElement", function() {
      return new IDLInterface({
        name: "HTMLTimeElement",
        superclass: idl.HTMLElement,
        members: {
          get dateTime() {
            return unwrap(this).dateTime;
          },
          set dateTime(newval) {
            unwrap(this).dateTime = String(newval);
          },

          get pubDate() {
            return unwrap(this).pubDate;
          },
          set pubDate(newval) {
            unwrap(this).pubDate = Boolean(newval);
          },

          get valueAsDate() {
            return wrap(unwrap(this).valueAsDate);
          },

        },
      });
    });

//
// Interface HTMLSpanElement
//

    defineLazyProperty(global, "HTMLSpanElement", function() {
      return idl.HTMLSpanElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLSpanElement", function() {
      return new IDLInterface({
        name: "HTMLSpanElement",
        superclass: idl.HTMLElement,
        members: {
        },
      });
    });

//
// Interface HTMLBRElement
//

    defineLazyProperty(global, "HTMLBRElement", function() {
      return idl.HTMLBRElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLBRElement", function() {
      return new IDLInterface({
        name: "HTMLBRElement",
        superclass: idl.HTMLElement,
        members: {
        },
      });
    });

//
// Interface HTMLModElement
//

    defineLazyProperty(global, "HTMLModElement", function() {
      return idl.HTMLModElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLModElement", function() {
      return new IDLInterface({
        name: "HTMLModElement",
        superclass: idl.HTMLElement,
        members: {
          get cite() {
            return unwrap(this).cite;
          },
          set cite(newval) {
            unwrap(this).cite = String(newval);
          },

          get dateTime() {
            return unwrap(this).dateTime;
          },
          set dateTime(newval) {
            unwrap(this).dateTime = String(newval);
          },

        },
      });
    });

//
// Interface HTMLImageElement
//

    defineLazyProperty(global, "HTMLImageElement", function() {
      return idl.HTMLImageElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLImageElement", function() {
      return new IDLInterface({
        name: "HTMLImageElement",
        superclass: idl.HTMLElement,
        members: {
          get alt() {
            return unwrap(this).alt;
          },
          set alt(newval) {
            unwrap(this).alt = String(newval);
          },

          get src() {
            return unwrap(this).src;
          },
          set src(newval) {
            unwrap(this).src = String(newval);
          },

          get crossOrigin() {
            return unwrap(this).crossOrigin;
          },
          set crossOrigin(newval) {
            unwrap(this).crossOrigin = String(newval);
          },

          get useMap() {
            return unwrap(this).useMap;
          },
          set useMap(newval) {
            unwrap(this).useMap = String(newval);
          },

          get isMap() {
            return unwrap(this).isMap;
          },
          set isMap(newval) {
            unwrap(this).isMap = Boolean(newval);
          },

          get width() {
            return unwrap(this).width;
          },
          set width(newval) {
            unwrap(this).width = toULong(newval);
          },

          get height() {
            return unwrap(this).height;
          },
          set height(newval) {
            unwrap(this).height = toULong(newval);
          },

          get naturalWidth() {
            return unwrap(this).naturalWidth;
          },

          get naturalHeight() {
            return unwrap(this).naturalHeight;
          },

          get complete() {
            return unwrap(this).complete;
          },

        },
      });
    });

//
// Interface HTMLIFrameElement
//

    defineLazyProperty(global, "HTMLIFrameElement", function() {
      return idl.HTMLIFrameElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLIFrameElement", function() {
      return new IDLInterface({
        name: "HTMLIFrameElement",
        superclass: idl.HTMLElement,
        members: {
          get src() {
            return unwrap(this).src;
          },
          set src(newval) {
            unwrap(this).src = String(newval);
          },

          get srcdoc() {
            return unwrap(this).srcdoc;
          },
          set srcdoc(newval) {
            unwrap(this).srcdoc = String(newval);
          },

          get name() {
            return unwrap(this).name;
          },
          set name(newval) {
            unwrap(this).name = String(newval);
          },

          get sandbox() {
            return wrap(unwrap(this).sandbox);
          },

          get seamless() {
            return unwrap(this).seamless;
          },
          set seamless(newval) {
            unwrap(this).seamless = Boolean(newval);
          },

          get width() {
            return unwrap(this).width;
          },
          set width(newval) {
            unwrap(this).width = String(newval);
          },

          get height() {
            return unwrap(this).height;
          },
          set height(newval) {
            unwrap(this).height = String(newval);
          },

          get contentDocument() {
            return wrap(unwrap(this).contentDocument);
          },

          get contentWindow() {
            return wrap(unwrap(this).contentWindow);
          },

        },
      });
    });

//
// Interface HTMLEmbedElement
//

    defineLazyProperty(global, "HTMLEmbedElement", function() {
      return idl.HTMLEmbedElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLEmbedElement", function() {
      return new IDLInterface({
        name: "HTMLEmbedElement",
        superclass: idl.HTMLElement,
        members: {
          get src() {
            return unwrap(this).src;
          },
          set src(newval) {
            unwrap(this).src = String(newval);
          },

          get type() {
            return unwrap(this).type;
          },
          set type(newval) {
            unwrap(this).type = String(newval);
          },

          get width() {
            return unwrap(this).width;
          },
          set width(newval) {
            unwrap(this).width = String(newval);
          },

          get height() {
            return unwrap(this).height;
          },
          set height(newval) {
            unwrap(this).height = String(newval);
          },

        },
      });
    });

//
// Interface HTMLObjectElement
//

    defineLazyProperty(global, "HTMLObjectElement", function() {
      return idl.HTMLObjectElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLObjectElement", function() {
      return new IDLInterface({
        name: "HTMLObjectElement",
        superclass: idl.HTMLElement,
        members: {
          get data() {
            return unwrap(this).data;
          },
          set data(newval) {
            unwrap(this).data = String(newval);
          },

          get type() {
            return unwrap(this).type;
          },
          set type(newval) {
            unwrap(this).type = String(newval);
          },

          get typeMustMatch() {
            return unwrap(this).typeMustMatch;
          },
          set typeMustMatch(newval) {
            unwrap(this).typeMustMatch = Boolean(newval);
          },

          get name() {
            return unwrap(this).name;
          },
          set name(newval) {
            unwrap(this).name = String(newval);
          },

          get useMap() {
            return unwrap(this).useMap;
          },
          set useMap(newval) {
            unwrap(this).useMap = String(newval);
          },

          get form() {
            return wrap(unwrap(this).form);
          },

          get width() {
            return unwrap(this).width;
          },
          set width(newval) {
            unwrap(this).width = String(newval);
          },

          get height() {
            return unwrap(this).height;
          },
          set height(newval) {
            unwrap(this).height = String(newval);
          },

          get contentDocument() {
            return wrap(unwrap(this).contentDocument);
          },

          get contentWindow() {
            return wrap(unwrap(this).contentWindow);
          },

          get willValidate() {
            return unwrap(this).willValidate;
          },

          get validity() {
            return wrap(unwrap(this).validity);
          },

          get validationMessage() {
            return unwrap(this).validationMessage;
          },

          checkValidity: function checkValidity() {
            return unwrap(this).checkValidity();
          },

          setCustomValidity: function setCustomValidity(error) {
            unwrap(this).setCustomValidity(String(error));
          },

        },
      });
    });

//
// Interface HTMLParamElement
//

    defineLazyProperty(global, "HTMLParamElement", function() {
      return idl.HTMLParamElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLParamElement", function() {
      return new IDLInterface({
        name: "HTMLParamElement",
        superclass: idl.HTMLElement,
        members: {
          get name() {
            return unwrap(this).name;
          },
          set name(newval) {
            unwrap(this).name = String(newval);
          },

          get value() {
            return unwrap(this).value;
          },
          set value(newval) {
            unwrap(this).value = String(newval);
          },

        },
      });
    });

//
// Interface HTMLMediaElement
//

// Constants defined by HTMLMediaElement
    const NETWORK_EMPTY = 0;
    const NETWORK_IDLE = 1;
    const NETWORK_LOADING = 2;
    const NETWORK_NO_SOURCE = 3;
    const HAVE_NOTHING = 0;
    const HAVE_METADATA = 1;
    const HAVE_CURRENT_DATA = 2;
    const HAVE_FUTURE_DATA = 3;
    const HAVE_ENOUGH_DATA = 4;

    defineLazyProperty(global, "HTMLMediaElement", function() {
      return idl.HTMLMediaElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLMediaElement", function() {
      return new IDLInterface({
        name: "HTMLMediaElement",
        superclass: idl.HTMLElement,
        constants: {
          NETWORK_EMPTY: NETWORK_EMPTY,
          NETWORK_IDLE: NETWORK_IDLE,
          NETWORK_LOADING: NETWORK_LOADING,
          NETWORK_NO_SOURCE: NETWORK_NO_SOURCE,
          HAVE_NOTHING: HAVE_NOTHING,
          HAVE_METADATA: HAVE_METADATA,
          HAVE_CURRENT_DATA: HAVE_CURRENT_DATA,
          HAVE_FUTURE_DATA: HAVE_FUTURE_DATA,
          HAVE_ENOUGH_DATA: HAVE_ENOUGH_DATA,
        },
        members: {
          get error() {
            return wrap(unwrap(this).error);
          },

          get src() {
            return unwrap(this).src;
          },
          set src(newval) {
            unwrap(this).src = String(newval);
          },

          get currentSrc() {
            return unwrap(this).currentSrc;
          },

          get crossOrigin() {
            return unwrap(this).crossOrigin;
          },
          set crossOrigin(newval) {
            unwrap(this).crossOrigin = String(newval);
          },

          get networkState() {
            return unwrap(this).networkState;
          },

          get preload() {
            return unwrap(this).preload;
          },
          set preload(newval) {
            unwrap(this).preload = String(newval);
          },

          get buffered() {
            return wrap(unwrap(this).buffered);
          },

          load: function load() {
            unwrap(this).load();
          },

          canPlayType: function canPlayType(type) {
            return unwrap(this).canPlayType(String(type));
          },

          get readyState() {
            return unwrap(this).readyState;
          },

          get seeking() {
            return unwrap(this).seeking;
          },

          get currentTime() {
            return unwrap(this).currentTime;
          },
          set currentTime(newval) {
            unwrap(this).currentTime = toDouble(newval);
          },

          get initialTime() {
            return unwrap(this).initialTime;
          },

          get duration() {
            return unwrap(this).duration;
          },

          get startOffsetTime() {
            return wrap(unwrap(this).startOffsetTime);
          },

          get paused() {
            return unwrap(this).paused;
          },

          get defaultPlaybackRate() {
            return unwrap(this).defaultPlaybackRate;
          },
          set defaultPlaybackRate(newval) {
            unwrap(this).defaultPlaybackRate = toDouble(newval);
          },

          get playbackRate() {
            return unwrap(this).playbackRate;
          },
          set playbackRate(newval) {
            unwrap(this).playbackRate = toDouble(newval);
          },

          get played() {
            return wrap(unwrap(this).played);
          },

          get seekable() {
            return wrap(unwrap(this).seekable);
          },

          get ended() {
            return unwrap(this).ended;
          },

          get autoplay() {
            return unwrap(this).autoplay;
          },
          set autoplay(newval) {
            unwrap(this).autoplay = Boolean(newval);
          },

          get loop() {
            return unwrap(this).loop;
          },
          set loop(newval) {
            unwrap(this).loop = Boolean(newval);
          },

          play: function play() {
            unwrap(this).play();
          },

          pause: function pause() {
            unwrap(this).pause();
          },

          get mediaGroup() {
            return unwrap(this).mediaGroup;
          },
          set mediaGroup(newval) {
            unwrap(this).mediaGroup = String(newval);
          },

          get controller() {
            return wrap(unwrap(this).controller);
          },
          set controller(newval) {
            unwrap(this).controller = unwrapOrNull(newval);
          },

          get controls() {
            return unwrap(this).controls;
          },
          set controls(newval) {
            unwrap(this).controls = Boolean(newval);
          },

          get volume() {
            return unwrap(this).volume;
          },
          set volume(newval) {
            unwrap(this).volume = toDouble(newval);
          },

          get muted() {
            return unwrap(this).muted;
          },
          set muted(newval) {
            unwrap(this).muted = Boolean(newval);
          },

          get defaultMuted() {
            return unwrap(this).defaultMuted;
          },
          set defaultMuted(newval) {
            unwrap(this).defaultMuted = Boolean(newval);
          },

          get audioTracks() {
            return wrap(unwrap(this).audioTracks);
          },

          get videoTracks() {
            return wrap(unwrap(this).videoTracks);
          },

          get textTracks() {
            return wrap(unwrap(this).textTracks);
          },

          addTextTrack: function addTextTrack(
            kind,
            label,
            language)
          {
            return wrap(unwrap(this).addTextTrack(
              String(kind),
              OptionalString(label),
              OptionalString(language)));
          },

        },
      });
    });

//
// Interface HTMLVideoElement
//

    defineLazyProperty(global, "HTMLVideoElement", function() {
      return idl.HTMLVideoElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLVideoElement", function() {
      return new IDLInterface({
        name: "HTMLVideoElement",
        superclass: idl.HTMLMediaElement,
        members: {
          get width() {
            return unwrap(this).width;
          },
          set width(newval) {
            unwrap(this).width = toULong(newval);
          },

          get height() {
            return unwrap(this).height;
          },
          set height(newval) {
            unwrap(this).height = toULong(newval);
          },

          get videoWidth() {
            return unwrap(this).videoWidth;
          },

          get videoHeight() {
            return unwrap(this).videoHeight;
          },

          get poster() {
            return unwrap(this).poster;
          },
          set poster(newval) {
            unwrap(this).poster = String(newval);
          },

        },
      });
    });

//
// Interface HTMLAudioElement
//

    defineLazyProperty(global, "HTMLAudioElement", function() {
      return idl.HTMLAudioElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLAudioElement", function() {
      return new IDLInterface({
        name: "HTMLAudioElement",
        superclass: idl.HTMLMediaElement,
        members: {
        },
      });
    });

//
// Interface HTMLSourceElement
//

    defineLazyProperty(global, "HTMLSourceElement", function() {
      return idl.HTMLSourceElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLSourceElement", function() {
      return new IDLInterface({
        name: "HTMLSourceElement",
        superclass: idl.HTMLElement,
        members: {
          get src() {
            return unwrap(this).src;
          },
          set src(newval) {
            unwrap(this).src = String(newval);
          },

          get type() {
            return unwrap(this).type;
          },
          set type(newval) {
            unwrap(this).type = String(newval);
          },

          get media() {
            return unwrap(this).media;
          },
          set media(newval) {
            unwrap(this).media = String(newval);
          },

        },
      });
    });

//
// Interface HTMLMapElement
//

    defineLazyProperty(global, "HTMLMapElement", function() {
      return idl.HTMLMapElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLMapElement", function() {
      return new IDLInterface({
        name: "HTMLMapElement",
        superclass: idl.HTMLElement,
        members: {
          get name() {
            return unwrap(this).name;
          },
          set name(newval) {
            unwrap(this).name = String(newval);
          },

          get areas() {
            return wrap(unwrap(this).areas);
          },

          get images() {
            return wrap(unwrap(this).images);
          },

        },
      });
    });

//
// Interface HTMLAreaElement
//

    defineLazyProperty(global, "HTMLAreaElement", function() {
      return idl.HTMLAreaElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLAreaElement", function() {
      return new IDLInterface({
        name: "HTMLAreaElement",
        superclass: idl.HTMLElement,
        members: {
          get alt() {
            return unwrap(this).alt;
          },
          set alt(newval) {
            unwrap(this).alt = String(newval);
          },

          get coords() {
            return unwrap(this).coords;
          },
          set coords(newval) {
            unwrap(this).coords = String(newval);
          },

          get shape() {
            return unwrap(this).shape;
          },
          set shape(newval) {
            unwrap(this).shape = String(newval);
          },

          get href() {
            return unwrap(this).href;
          },
          set href(newval) {
            unwrap(this).href = String(newval);
          },

          get target() {
            return unwrap(this).target;
          },
          set target(newval) {
            unwrap(this).target = String(newval);
          },

          get download() {
            return unwrap(this).download;
          },
          set download(newval) {
            unwrap(this).download = String(newval);
          },

          get ping() {
            return unwrap(this).ping;
          },
          set ping(newval) {
            unwrap(this).ping = String(newval);
          },

          get rel() {
            return unwrap(this).rel;
          },
          set rel(newval) {
            unwrap(this).rel = String(newval);
          },

          get relList() {
            return wrap(unwrap(this).relList);
          },

          get media() {
            return unwrap(this).media;
          },
          set media(newval) {
            unwrap(this).media = String(newval);
          },

          get hreflang() {
            return unwrap(this).hreflang;
          },
          set hreflang(newval) {
            unwrap(this).hreflang = String(newval);
          },

          get type() {
            return unwrap(this).type;
          },
          set type(newval) {
            unwrap(this).type = String(newval);
          },

          get protocol() {
            return unwrap(this).protocol;
          },
          set protocol(newval) {
            unwrap(this).protocol = String(newval);
          },

          get host() {
            return unwrap(this).host;
          },
          set host(newval) {
            unwrap(this).host = String(newval);
          },

          get hostname() {
            return unwrap(this).hostname;
          },
          set hostname(newval) {
            unwrap(this).hostname = String(newval);
          },

          get port() {
            return unwrap(this).port;
          },
          set port(newval) {
            unwrap(this).port = String(newval);
          },

          get pathname() {
            return unwrap(this).pathname;
          },
          set pathname(newval) {
            unwrap(this).pathname = String(newval);
          },

          get search() {
            return unwrap(this).search;
          },
          set search(newval) {
            unwrap(this).search = String(newval);
          },

          get hash() {
            return unwrap(this).hash;
          },
          set hash(newval) {
            unwrap(this).hash = String(newval);
          },

        },
      });
    });

//
// Interface HTMLTableElement
//

    defineLazyProperty(global, "HTMLTableElement", function() {
      return idl.HTMLTableElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLTableElement", function() {
      return new IDLInterface({
        name: "HTMLTableElement",
        superclass: idl.HTMLElement,
        members: {
          get caption() {
            return wrap(unwrap(this).caption);
          },
          set caption(newval) {
            unwrap(this).caption = unwrapOrNull(newval);
          },

          createCaption: function createCaption() {
            return wrap(unwrap(this).createCaption());
          },

          deleteCaption: function deleteCaption() {
            unwrap(this).deleteCaption();
          },

          get tHead() {
            return wrap(unwrap(this).tHead);
          },
          set tHead(newval) {
            unwrap(this).tHead = unwrapOrNull(newval);
          },

          createTHead: function createTHead() {
            return wrap(unwrap(this).createTHead());
          },

          deleteTHead: function deleteTHead() {
            unwrap(this).deleteTHead();
          },

          get tFoot() {
            return wrap(unwrap(this).tFoot);
          },
          set tFoot(newval) {
            unwrap(this).tFoot = unwrapOrNull(newval);
          },

          createTFoot: function createTFoot() {
            return wrap(unwrap(this).createTFoot());
          },

          deleteTFoot: function deleteTFoot() {
            unwrap(this).deleteTFoot();
          },

          get tBodies() {
            return wrap(unwrap(this).tBodies);
          },

          createTBody: function createTBody() {
            return wrap(unwrap(this).createTBody());
          },

          get rows() {
            return wrap(unwrap(this).rows);
          },

          insertRow: function insertRow(index) {
            return wrap(unwrap(this).insertRow(OptionaltoLong(index)));
          },

          deleteRow: function deleteRow(index) {
            unwrap(this).deleteRow(toLong(index));
          },

          get border() {
            return unwrap(this).border;
          },
          set border(newval) {
            unwrap(this).border = String(newval);
          },

        },
      });
    });

//
// Interface HTMLTableCaptionElement
//

    defineLazyProperty(global, "HTMLTableCaptionElement", function() {
      return idl.HTMLTableCaptionElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLTableCaptionElement", function() {
      return new IDLInterface({
        name: "HTMLTableCaptionElement",
        superclass: idl.HTMLElement,
        members: {
        },
      });
    });

//
// Interface HTMLTableColElement
//

    defineLazyProperty(global, "HTMLTableColElement", function() {
      return idl.HTMLTableColElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLTableColElement", function() {
      return new IDLInterface({
        name: "HTMLTableColElement",
        superclass: idl.HTMLElement,
        members: {
          get span() {
            return unwrap(this).span;
          },
          set span(newval) {
            unwrap(this).span = toULong(newval);
          },

        },
      });
    });

//
// Interface HTMLTableSectionElement
//

    defineLazyProperty(global, "HTMLTableSectionElement", function() {
      return idl.HTMLTableSectionElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLTableSectionElement", function() {
      return new IDLInterface({
        name: "HTMLTableSectionElement",
        superclass: idl.HTMLElement,
        members: {
          get rows() {
            return wrap(unwrap(this).rows);
          },

          insertRow: function insertRow(index) {
            return wrap(unwrap(this).insertRow(OptionaltoLong(index)));
          },

          deleteRow: function deleteRow(index) {
            unwrap(this).deleteRow(toLong(index));
          },

        },
      });
    });

//
// Interface HTMLTableRowElement
//

    defineLazyProperty(global, "HTMLTableRowElement", function() {
      return idl.HTMLTableRowElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLTableRowElement", function() {
      return new IDLInterface({
        name: "HTMLTableRowElement",
        superclass: idl.HTMLElement,
        members: {
          get rowIndex() {
            return unwrap(this).rowIndex;
          },

          get sectionRowIndex() {
            return unwrap(this).sectionRowIndex;
          },

          get cells() {
            return wrap(unwrap(this).cells);
          },

          insertCell: function insertCell(index) {
            return wrap(unwrap(this).insertCell(OptionaltoLong(index)));
          },

          deleteCell: function deleteCell(index) {
            unwrap(this).deleteCell(toLong(index));
          },

        },
      });
    });

//
// Interface HTMLTableDataCellElement
//

    defineLazyProperty(global, "HTMLTableDataCellElement", function() {
      return idl.HTMLTableDataCellElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLTableDataCellElement", function() {
      return new IDLInterface({
        name: "HTMLTableDataCellElement",
        superclass: idl.HTMLTableCellElement,
        members: {
        },
      });
    });

//
// Interface HTMLTableHeaderCellElement
//

    defineLazyProperty(global, "HTMLTableHeaderCellElement", function() {
      return idl.HTMLTableHeaderCellElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLTableHeaderCellElement", function() {
      return new IDLInterface({
        name: "HTMLTableHeaderCellElement",
        superclass: idl.HTMLTableCellElement,
        members: {
          get scope() {
            return unwrap(this).scope;
          },
          set scope(newval) {
            unwrap(this).scope = String(newval);
          },

        },
      });
    });

//
// Interface HTMLTableCellElement
//

    defineLazyProperty(global, "HTMLTableCellElement", function() {
      return idl.HTMLTableCellElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLTableCellElement", function() {
      return new IDLInterface({
        name: "HTMLTableCellElement",
        superclass: idl.HTMLElement,
        members: {
          get colSpan() {
            return unwrap(this).colSpan;
          },
          set colSpan(newval) {
            unwrap(this).colSpan = toULong(newval);
          },

          get rowSpan() {
            return unwrap(this).rowSpan;
          },
          set rowSpan(newval) {
            unwrap(this).rowSpan = toULong(newval);
          },

          get headers() {
            return wrap(unwrap(this).headers);
          },

          get cellIndex() {
            return unwrap(this).cellIndex;
          },

        },
      });
    });

//
// Interface HTMLFormElement
//

    defineLazyProperty(global, "HTMLFormElement", function() {
      return idl.HTMLFormElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLFormElement", function() {
      return new IDLInterface({
        name: "HTMLFormElement",
        superclass: idl.HTMLElement,
        members: {
          get acceptCharset() {
            return unwrap(this).acceptCharset;
          },
          set acceptCharset(newval) {
            unwrap(this).acceptCharset = String(newval);
          },

          get action() {
            return unwrap(this).action;
          },
          set action(newval) {
            unwrap(this).action = String(newval);
          },

          get autocomplete() {
            return unwrap(this).autocomplete;
          },
          set autocomplete(newval) {
            unwrap(this).autocomplete = String(newval);
          },

          get enctype() {
            return unwrap(this).enctype;
          },
          set enctype(newval) {
            unwrap(this).enctype = String(newval);
          },

          get encoding() {
            return unwrap(this).encoding;
          },
          set encoding(newval) {
            unwrap(this).encoding = String(newval);
          },

          get method() {
            return unwrap(this).method;
          },
          set method(newval) {
            unwrap(this).method = String(newval);
          },

          get name() {
            return unwrap(this).name;
          },
          set name(newval) {
            unwrap(this).name = String(newval);
          },

          get noValidate() {
            return unwrap(this).noValidate;
          },
          set noValidate(newval) {
            unwrap(this).noValidate = Boolean(newval);
          },

          get target() {
            return unwrap(this).target;
          },
          set target(newval) {
            unwrap(this).target = String(newval);
          },

          get elements() {
            return wrap(unwrap(this).elements);
          },

          get length() {
            return unwrap(this).length;
          },

          submit: function submit() {
            unwrap(this).submit();
          },

          reset: function reset() {
            unwrap(this).reset();
          },

          checkValidity: function checkValidity() {
            return unwrap(this).checkValidity();
          },

        },
      });
    });

//
// Interface HTMLFieldSetElement
//

    defineLazyProperty(global, "HTMLFieldSetElement", function() {
      return idl.HTMLFieldSetElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLFieldSetElement", function() {
      return new IDLInterface({
        name: "HTMLFieldSetElement",
        superclass: idl.HTMLElement,
        members: {
          get disabled() {
            return unwrap(this).disabled;
          },
          set disabled(newval) {
            unwrap(this).disabled = Boolean(newval);
          },

          get form() {
            return wrap(unwrap(this).form);
          },

          get name() {
            return unwrap(this).name;
          },
          set name(newval) {
            unwrap(this).name = String(newval);
          },

          get type() {
            return unwrap(this).type;
          },

          get elements() {
            return wrap(unwrap(this).elements);
          },

          get willValidate() {
            return unwrap(this).willValidate;
          },

          get validity() {
            return wrap(unwrap(this).validity);
          },

          get validationMessage() {
            return unwrap(this).validationMessage;
          },

          checkValidity: function checkValidity() {
            return unwrap(this).checkValidity();
          },

          setCustomValidity: function setCustomValidity(error) {
            unwrap(this).setCustomValidity(String(error));
          },

        },
      });
    });

//
// Interface HTMLLegendElement
//

    defineLazyProperty(global, "HTMLLegendElement", function() {
      return idl.HTMLLegendElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLLegendElement", function() {
      return new IDLInterface({
        name: "HTMLLegendElement",
        superclass: idl.HTMLElement,
        members: {
          get form() {
            return wrap(unwrap(this).form);
          },

        },
      });
    });

//
// Interface HTMLLabelElement
//

    defineLazyProperty(global, "HTMLLabelElement", function() {
      return idl.HTMLLabelElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLLabelElement", function() {
      return new IDLInterface({
        name: "HTMLLabelElement",
        superclass: idl.HTMLElement,
        members: {
          get form() {
            return wrap(unwrap(this).form);
          },

          get htmlFor() {
            return unwrap(this).htmlFor;
          },
          set htmlFor(newval) {
            unwrap(this).htmlFor = String(newval);
          },

          get control() {
            return wrap(unwrap(this).control);
          },

        },
      });
    });

//
// Interface HTMLInputElement
//

    defineLazyProperty(global, "HTMLInputElement", function() {
      return idl.HTMLInputElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLInputElement", function() {
      return new IDLInterface({
        name: "HTMLInputElement",
        superclass: idl.HTMLElement,
        members: {
          get accept() {
            return unwrap(this).accept;
          },
          set accept(newval) {
            unwrap(this).accept = String(newval);
          },

          get alt() {
            return unwrap(this).alt;
          },
          set alt(newval) {
            unwrap(this).alt = String(newval);
          },

          get autocomplete() {
            return unwrap(this).autocomplete;
          },
          set autocomplete(newval) {
            unwrap(this).autocomplete = String(newval);
          },

          get autofocus() {
            return unwrap(this).autofocus;
          },
          set autofocus(newval) {
            unwrap(this).autofocus = Boolean(newval);
          },

          get defaultChecked() {
            return unwrap(this).defaultChecked;
          },
          set defaultChecked(newval) {
            unwrap(this).defaultChecked = Boolean(newval);
          },

          get checked() {
            return unwrap(this).checked;
          },
          set checked(newval) {
            unwrap(this).checked = Boolean(newval);
          },

          get dirName() {
            return unwrap(this).dirName;
          },
          set dirName(newval) {
            unwrap(this).dirName = String(newval);
          },

          get disabled() {
            return unwrap(this).disabled;
          },
          set disabled(newval) {
            unwrap(this).disabled = Boolean(newval);
          },

          get form() {
            return wrap(unwrap(this).form);
          },

          get files() {
            return wrap(unwrap(this).files);
          },

          get formAction() {
            return unwrap(this).formAction;
          },
          set formAction(newval) {
            unwrap(this).formAction = String(newval);
          },

          get formEnctype() {
            return unwrap(this).formEnctype;
          },
          set formEnctype(newval) {
            unwrap(this).formEnctype = String(newval);
          },

          get formMethod() {
            return unwrap(this).formMethod;
          },
          set formMethod(newval) {
            unwrap(this).formMethod = String(newval);
          },

          get formNoValidate() {
            return unwrap(this).formNoValidate;
          },
          set formNoValidate(newval) {
            unwrap(this).formNoValidate = Boolean(newval);
          },

          get formTarget() {
            return unwrap(this).formTarget;
          },
          set formTarget(newval) {
            unwrap(this).formTarget = String(newval);
          },

          get height() {
            return unwrap(this).height;
          },
          set height(newval) {
            unwrap(this).height = String(newval);
          },

          get indeterminate() {
            return unwrap(this).indeterminate;
          },
          set indeterminate(newval) {
            unwrap(this).indeterminate = Boolean(newval);
          },

          get list() {
            return wrap(unwrap(this).list);
          },

          get max() {
            return unwrap(this).max;
          },
          set max(newval) {
            unwrap(this).max = String(newval);
          },

          get maxLength() {
            return unwrap(this).maxLength;
          },
          set maxLength(newval) {
            unwrap(this).maxLength = toLong(newval);
          },

          get min() {
            return unwrap(this).min;
          },
          set min(newval) {
            unwrap(this).min = String(newval);
          },

          get multiple() {
            return unwrap(this).multiple;
          },
          set multiple(newval) {
            unwrap(this).multiple = Boolean(newval);
          },

          get name() {
            return unwrap(this).name;
          },
          set name(newval) {
            unwrap(this).name = String(newval);
          },

          get pattern() {
            return unwrap(this).pattern;
          },
          set pattern(newval) {
            unwrap(this).pattern = String(newval);
          },

          get placeholder() {
            return unwrap(this).placeholder;
          },
          set placeholder(newval) {
            unwrap(this).placeholder = String(newval);
          },

          get readOnly() {
            return unwrap(this).readOnly;
          },
          set readOnly(newval) {
            unwrap(this).readOnly = Boolean(newval);
          },

          get required() {
            return unwrap(this).required;
          },
          set required(newval) {
            unwrap(this).required = Boolean(newval);
          },

          get size() {
            return unwrap(this).size;
          },
          set size(newval) {
            unwrap(this).size = toULong(newval);
          },

          get src() {
            return unwrap(this).src;
          },
          set src(newval) {
            unwrap(this).src = String(newval);
          },

          get step() {
            return unwrap(this).step;
          },
          set step(newval) {
            unwrap(this).step = String(newval);
          },

          get type() {
            return unwrap(this).type;
          },
          set type(newval) {
            unwrap(this).type = String(newval);
          },

          get defaultValue() {
            return unwrap(this).defaultValue;
          },
          set defaultValue(newval) {
            unwrap(this).defaultValue = String(newval);
          },

          get value() {
            return unwrap(this).value;
          },
          set value(newval) {
            unwrap(this).value = String(newval);
          },

          get valueAsDate() {
            return wrap(unwrap(this).valueAsDate);
          },
          set valueAsDate(newval) {
            unwrap(this).valueAsDate = unwrap(newval);
          },

          get valueAsNumber() {
            return unwrap(this).valueAsNumber;
          },
          set valueAsNumber(newval) {
            unwrap(this).valueAsNumber = toDouble(newval);
          },

          get selectedOption() {
            return wrap(unwrap(this).selectedOption);
          },

          get width() {
            return unwrap(this).width;
          },
          set width(newval) {
            unwrap(this).width = String(newval);
          },

          stepUp: function stepUp(n) {
            unwrap(this).stepUp(OptionaltoLong(n));
          },

          stepDown: function stepDown(n) {
            unwrap(this).stepDown(OptionaltoLong(n));
          },

          get willValidate() {
            return unwrap(this).willValidate;
          },

          get validity() {
            return wrap(unwrap(this).validity);
          },

          get validationMessage() {
            return unwrap(this).validationMessage;
          },

          checkValidity: function checkValidity() {
            return unwrap(this).checkValidity();
          },

          setCustomValidity: function setCustomValidity(error) {
            unwrap(this).setCustomValidity(String(error));
          },

          get labels() {
            return wrap(unwrap(this).labels);
          },

          select: function select() {
            unwrap(this).select();
          },

          get selectionStart() {
            return unwrap(this).selectionStart;
          },
          set selectionStart(newval) {
            unwrap(this).selectionStart = toULong(newval);
          },

          get selectionEnd() {
            return unwrap(this).selectionEnd;
          },
          set selectionEnd(newval) {
            unwrap(this).selectionEnd = toULong(newval);
          },

          get selectionDirection() {
            return unwrap(this).selectionDirection;
          },
          set selectionDirection(newval) {
            unwrap(this).selectionDirection = String(newval);
          },

          setSelectionRange: function setSelectionRange(
            start,
            end,
            direction)
          {
            unwrap(this).setSelectionRange(
              toULong(start),
              toULong(end),
              OptionalString(direction));
          },

        },
      });
    });

//
// Interface HTMLButtonElement
//

    defineLazyProperty(global, "HTMLButtonElement", function() {
      return idl.HTMLButtonElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLButtonElement", function() {
      return new IDLInterface({
        name: "HTMLButtonElement",
        superclass: idl.HTMLElement,
        members: {
          get autofocus() {
            return unwrap(this).autofocus;
          },
          set autofocus(newval) {
            unwrap(this).autofocus = Boolean(newval);
          },

          get disabled() {
            return unwrap(this).disabled;
          },
          set disabled(newval) {
            unwrap(this).disabled = Boolean(newval);
          },

          get form() {
            return wrap(unwrap(this).form);
          },

          get formAction() {
            return unwrap(this).formAction;
          },
          set formAction(newval) {
            unwrap(this).formAction = String(newval);
          },

          get formEnctype() {
            return unwrap(this).formEnctype;
          },
          set formEnctype(newval) {
            unwrap(this).formEnctype = String(newval);
          },

          get formMethod() {
            return unwrap(this).formMethod;
          },
          set formMethod(newval) {
            unwrap(this).formMethod = String(newval);
          },

          get formNoValidate() {
            return unwrap(this).formNoValidate;
          },
          set formNoValidate(newval) {
            unwrap(this).formNoValidate = Boolean(newval);
          },

          get formTarget() {
            return unwrap(this).formTarget;
          },
          set formTarget(newval) {
            unwrap(this).formTarget = String(newval);
          },

          get name() {
            return unwrap(this).name;
          },
          set name(newval) {
            unwrap(this).name = String(newval);
          },

          get type() {
            return unwrap(this).type;
          },
          set type(newval) {
            unwrap(this).type = String(newval);
          },

          get value() {
            return unwrap(this).value;
          },
          set value(newval) {
            unwrap(this).value = String(newval);
          },

          get willValidate() {
            return unwrap(this).willValidate;
          },

          get validity() {
            return wrap(unwrap(this).validity);
          },

          get validationMessage() {
            return unwrap(this).validationMessage;
          },

          checkValidity: function checkValidity() {
            return unwrap(this).checkValidity();
          },

          setCustomValidity: function setCustomValidity(error) {
            unwrap(this).setCustomValidity(String(error));
          },

          get labels() {
            return wrap(unwrap(this).labels);
          },

        },
      });
    });

//
// Interface HTMLSelectElement
//

    defineLazyProperty(global, "HTMLSelectElement", function() {
      return idl.HTMLSelectElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLSelectElement", function() {
      return new IDLInterface({
        name: "HTMLSelectElement",
        superclass: idl.HTMLElement,
        members: {
          get autofocus() {
            return unwrap(this).autofocus;
          },
          set autofocus(newval) {
            unwrap(this).autofocus = Boolean(newval);
          },

          get disabled() {
            return unwrap(this).disabled;
          },
          set disabled(newval) {
            unwrap(this).disabled = Boolean(newval);
          },

          get form() {
            return wrap(unwrap(this).form);
          },

          get multiple() {
            return unwrap(this).multiple;
          },
          set multiple(newval) {
            unwrap(this).multiple = Boolean(newval);
          },

          get name() {
            return unwrap(this).name;
          },
          set name(newval) {
            unwrap(this).name = String(newval);
          },

          get required() {
            return unwrap(this).required;
          },
          set required(newval) {
            unwrap(this).required = Boolean(newval);
          },

          get size() {
            return unwrap(this).size;
          },
          set size(newval) {
            unwrap(this).size = toULong(newval);
          },

          get type() {
            return unwrap(this).type;
          },

          get options() {
            return wrap(unwrap(this).options);
          },

          get length() {
            return unwrap(this).length;
          },
          set length(newval) {
            unwrap(this).length = toULong(newval);
          },

          namedItem: function namedItem(name) {
            return unwrap(this).namedItem(String(name));
          },

          remove: function remove(index) {
            unwrap(this).remove(toLong(index));
          },

          get selectedOptions() {
            return wrap(unwrap(this).selectedOptions);
          },

          get selectedIndex() {
            return unwrap(this).selectedIndex;
          },
          set selectedIndex(newval) {
            unwrap(this).selectedIndex = toLong(newval);
          },

          get value() {
            return unwrap(this).value;
          },
          set value(newval) {
            unwrap(this).value = String(newval);
          },

          get willValidate() {
            return unwrap(this).willValidate;
          },

          get validity() {
            return wrap(unwrap(this).validity);
          },

          get validationMessage() {
            return unwrap(this).validationMessage;
          },

          checkValidity: function checkValidity() {
            return unwrap(this).checkValidity();
          },

          setCustomValidity: function setCustomValidity(error) {
            unwrap(this).setCustomValidity(String(error));
          },

          get labels() {
            return wrap(unwrap(this).labels);
          },

        },
      });
    });

//
// Interface HTMLDataListElement
//

    defineLazyProperty(global, "HTMLDataListElement", function() {
      return idl.HTMLDataListElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLDataListElement", function() {
      return new IDLInterface({
        name: "HTMLDataListElement",
        superclass: idl.HTMLElement,
        members: {
          get options() {
            return wrap(unwrap(this).options);
          },

        },
      });
    });

//
// Interface HTMLOptGroupElement
//

    defineLazyProperty(global, "HTMLOptGroupElement", function() {
      return idl.HTMLOptGroupElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLOptGroupElement", function() {
      return new IDLInterface({
        name: "HTMLOptGroupElement",
        superclass: idl.HTMLElement,
        members: {
          get disabled() {
            return unwrap(this).disabled;
          },
          set disabled(newval) {
            unwrap(this).disabled = Boolean(newval);
          },

          get label() {
            return unwrap(this).label;
          },
          set label(newval) {
            unwrap(this).label = String(newval);
          },

        },
      });
    });

//
// Interface HTMLOptionElement
//

    defineLazyProperty(global, "HTMLOptionElement", function() {
      return idl.HTMLOptionElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLOptionElement", function() {
      return new IDLInterface({
        name: "HTMLOptionElement",
        superclass: idl.HTMLElement,
        members: {
          get disabled() {
            return unwrap(this).disabled;
          },
          set disabled(newval) {
            unwrap(this).disabled = Boolean(newval);
          },

          get form() {
            return wrap(unwrap(this).form);
          },

          get label() {
            return unwrap(this).label;
          },
          set label(newval) {
            unwrap(this).label = String(newval);
          },

          get defaultSelected() {
            return unwrap(this).defaultSelected;
          },
          set defaultSelected(newval) {
            unwrap(this).defaultSelected = Boolean(newval);
          },

          get selected() {
            return unwrap(this).selected;
          },
          set selected(newval) {
            unwrap(this).selected = Boolean(newval);
          },

          get value() {
            return unwrap(this).value;
          },
          set value(newval) {
            unwrap(this).value = String(newval);
          },

          get text() {
            return unwrap(this).text;
          },
          set text(newval) {
            unwrap(this).text = String(newval);
          },

          get index() {
            return unwrap(this).index;
          },

        },
      });
    });

//
// Interface HTMLTextAreaElement
//

    defineLazyProperty(global, "HTMLTextAreaElement", function() {
      return idl.HTMLTextAreaElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLTextAreaElement", function() {
      return new IDLInterface({
        name: "HTMLTextAreaElement",
        superclass: idl.HTMLElement,
        members: {
          get autofocus() {
            return unwrap(this).autofocus;
          },
          set autofocus(newval) {
            unwrap(this).autofocus = Boolean(newval);
          },

          get cols() {
            return unwrap(this).cols;
          },
          set cols(newval) {
            unwrap(this).cols = toULong(newval);
          },

          get dirName() {
            return unwrap(this).dirName;
          },
          set dirName(newval) {
            unwrap(this).dirName = String(newval);
          },

          get disabled() {
            return unwrap(this).disabled;
          },
          set disabled(newval) {
            unwrap(this).disabled = Boolean(newval);
          },

          get form() {
            return wrap(unwrap(this).form);
          },

          get maxLength() {
            return unwrap(this).maxLength;
          },
          set maxLength(newval) {
            unwrap(this).maxLength = toLong(newval);
          },

          get name() {
            return unwrap(this).name;
          },
          set name(newval) {
            unwrap(this).name = String(newval);
          },

          get placeholder() {
            return unwrap(this).placeholder;
          },
          set placeholder(newval) {
            unwrap(this).placeholder = String(newval);
          },

          get readOnly() {
            return unwrap(this).readOnly;
          },
          set readOnly(newval) {
            unwrap(this).readOnly = Boolean(newval);
          },

          get required() {
            return unwrap(this).required;
          },
          set required(newval) {
            unwrap(this).required = Boolean(newval);
          },

          get rows() {
            return unwrap(this).rows;
          },
          set rows(newval) {
            unwrap(this).rows = toULong(newval);
          },

          get wrap() {
            return unwrap(this).wrap;
          },
          set wrap(newval) {
            unwrap(this).wrap = String(newval);
          },

          get type() {
            return unwrap(this).type;
          },

          get defaultValue() {
            return unwrap(this).defaultValue;
          },
          set defaultValue(newval) {
            unwrap(this).defaultValue = String(newval);
          },

          get value() {
            return unwrap(this).value;
          },
          set value(newval) {
            unwrap(this).value = String(newval);
          },

          get textLength() {
            return unwrap(this).textLength;
          },

          get willValidate() {
            return unwrap(this).willValidate;
          },

          get validity() {
            return wrap(unwrap(this).validity);
          },

          get validationMessage() {
            return unwrap(this).validationMessage;
          },

          checkValidity: function checkValidity() {
            return unwrap(this).checkValidity();
          },

          setCustomValidity: function setCustomValidity(error) {
            unwrap(this).setCustomValidity(String(error));
          },

          get labels() {
            return wrap(unwrap(this).labels);
          },

          select: function select() {
            unwrap(this).select();
          },

          get selectionStart() {
            return unwrap(this).selectionStart;
          },
          set selectionStart(newval) {
            unwrap(this).selectionStart = toULong(newval);
          },

          get selectionEnd() {
            return unwrap(this).selectionEnd;
          },
          set selectionEnd(newval) {
            unwrap(this).selectionEnd = toULong(newval);
          },

          get selectionDirection() {
            return unwrap(this).selectionDirection;
          },
          set selectionDirection(newval) {
            unwrap(this).selectionDirection = String(newval);
          },

          setSelectionRange: function setSelectionRange(
            start,
            end,
            direction)
          {
            unwrap(this).setSelectionRange(
              toULong(start),
              toULong(end),
              OptionalString(direction));
          },

        },
      });
    });

//
// Interface HTMLKeygenElement
//

    defineLazyProperty(global, "HTMLKeygenElement", function() {
      return idl.HTMLKeygenElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLKeygenElement", function() {
      return new IDLInterface({
        name: "HTMLKeygenElement",
        superclass: idl.HTMLElement,
        members: {
          get autofocus() {
            return unwrap(this).autofocus;
          },
          set autofocus(newval) {
            unwrap(this).autofocus = Boolean(newval);
          },

          get challenge() {
            return unwrap(this).challenge;
          },
          set challenge(newval) {
            unwrap(this).challenge = String(newval);
          },

          get disabled() {
            return unwrap(this).disabled;
          },
          set disabled(newval) {
            unwrap(this).disabled = Boolean(newval);
          },

          get form() {
            return wrap(unwrap(this).form);
          },

          get keytype() {
            return unwrap(this).keytype;
          },
          set keytype(newval) {
            unwrap(this).keytype = String(newval);
          },

          get name() {
            return unwrap(this).name;
          },
          set name(newval) {
            unwrap(this).name = String(newval);
          },

          get type() {
            return unwrap(this).type;
          },

          get willValidate() {
            return unwrap(this).willValidate;
          },

          get validity() {
            return wrap(unwrap(this).validity);
          },

          get validationMessage() {
            return unwrap(this).validationMessage;
          },

          checkValidity: function checkValidity() {
            return unwrap(this).checkValidity();
          },

          setCustomValidity: function setCustomValidity(error) {
            unwrap(this).setCustomValidity(String(error));
          },

          get labels() {
            return wrap(unwrap(this).labels);
          },

        },
      });
    });

//
// Interface HTMLOutputElement
//

    defineLazyProperty(global, "HTMLOutputElement", function() {
      return idl.HTMLOutputElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLOutputElement", function() {
      return new IDLInterface({
        name: "HTMLOutputElement",
        superclass: idl.HTMLElement,
        members: {
          get htmlFor() {
            return wrap(unwrap(this).htmlFor);
          },

          get form() {
            return wrap(unwrap(this).form);
          },

          get name() {
            return unwrap(this).name;
          },
          set name(newval) {
            unwrap(this).name = String(newval);
          },

          get type() {
            return unwrap(this).type;
          },

          get defaultValue() {
            return unwrap(this).defaultValue;
          },
          set defaultValue(newval) {
            unwrap(this).defaultValue = String(newval);
          },

          get value() {
            return unwrap(this).value;
          },
          set value(newval) {
            unwrap(this).value = String(newval);
          },

          get willValidate() {
            return unwrap(this).willValidate;
          },

          get validity() {
            return wrap(unwrap(this).validity);
          },

          get validationMessage() {
            return unwrap(this).validationMessage;
          },

          checkValidity: function checkValidity() {
            return unwrap(this).checkValidity();
          },

          setCustomValidity: function setCustomValidity(error) {
            unwrap(this).setCustomValidity(String(error));
          },

          get labels() {
            return wrap(unwrap(this).labels);
          },

        },
      });
    });

//
// Interface HTMLProgressElement
//

    defineLazyProperty(global, "HTMLProgressElement", function() {
      return idl.HTMLProgressElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLProgressElement", function() {
      return new IDLInterface({
        name: "HTMLProgressElement",
        superclass: idl.HTMLElement,
        members: {
          get value() {
            return unwrap(this).value;
          },
          set value(newval) {
            unwrap(this).value = toDouble(newval);
          },

          get max() {
            return unwrap(this).max;
          },
          set max(newval) {
            unwrap(this).max = toDouble(newval);
          },

          get position() {
            return unwrap(this).position;
          },

          get labels() {
            return wrap(unwrap(this).labels);
          },

        },
      });
    });

//
// Interface HTMLMeterElement
//

    defineLazyProperty(global, "HTMLMeterElement", function() {
      return idl.HTMLMeterElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLMeterElement", function() {
      return new IDLInterface({
        name: "HTMLMeterElement",
        superclass: idl.HTMLElement,
        members: {
          get value() {
            return unwrap(this).value;
          },
          set value(newval) {
            unwrap(this).value = toDouble(newval);
          },

          get min() {
            return unwrap(this).min;
          },
          set min(newval) {
            unwrap(this).min = toDouble(newval);
          },

          get max() {
            return unwrap(this).max;
          },
          set max(newval) {
            unwrap(this).max = toDouble(newval);
          },

          get low() {
            return unwrap(this).low;
          },
          set low(newval) {
            unwrap(this).low = toDouble(newval);
          },

          get high() {
            return unwrap(this).high;
          },
          set high(newval) {
            unwrap(this).high = toDouble(newval);
          },

          get optimum() {
            return unwrap(this).optimum;
          },
          set optimum(newval) {
            unwrap(this).optimum = toDouble(newval);
          },

          get labels() {
            return wrap(unwrap(this).labels);
          },

        },
      });
    });

//
// Interface ValidityState
//

    defineLazyProperty(global, "ValidityState", function() {
      return idl.ValidityState.publicInterface;
    }, true);

    defineLazyProperty(idl, "ValidityState", function() {
      return new IDLInterface({
        name: "ValidityState",
        members: {
          get valueMissing() {
            return unwrap(this).valueMissing;
          },

          get typeMismatch() {
            return unwrap(this).typeMismatch;
          },

          get patternMismatch() {
            return unwrap(this).patternMismatch;
          },

          get tooLong() {
            return unwrap(this).tooLong;
          },

          get rangeUnderflow() {
            return unwrap(this).rangeUnderflow;
          },

          get rangeOverflow() {
            return unwrap(this).rangeOverflow;
          },

          get stepMismatch() {
            return unwrap(this).stepMismatch;
          },

          get customError() {
            return unwrap(this).customError;
          },

          get valid() {
            return unwrap(this).valid;
          },

        },
      });
    });

//
// Interface HTMLDetailsElement
//

    defineLazyProperty(global, "HTMLDetailsElement", function() {
      return idl.HTMLDetailsElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLDetailsElement", function() {
      return new IDLInterface({
        name: "HTMLDetailsElement",
        superclass: idl.HTMLElement,
        members: {
          get open() {
            return unwrap(this).open;
          },
          set open(newval) {
            unwrap(this).open = Boolean(newval);
          },

        },
      });
    });

//
// Interface HTMLCommandElement
//

    defineLazyProperty(global, "HTMLCommandElement", function() {
      return idl.HTMLCommandElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLCommandElement", function() {
      return new IDLInterface({
        name: "HTMLCommandElement",
        superclass: idl.HTMLElement,
        members: {
          get type() {
            return unwrap(this).type;
          },
          set type(newval) {
            unwrap(this).type = String(newval);
          },

          get label() {
            return unwrap(this).label;
          },
          set label(newval) {
            unwrap(this).label = String(newval);
          },

          get icon() {
            return unwrap(this).icon;
          },
          set icon(newval) {
            unwrap(this).icon = String(newval);
          },

          get disabled() {
            return unwrap(this).disabled;
          },
          set disabled(newval) {
            unwrap(this).disabled = Boolean(newval);
          },

          get checked() {
            return unwrap(this).checked;
          },
          set checked(newval) {
            unwrap(this).checked = Boolean(newval);
          },

          get radiogroup() {
            return unwrap(this).radiogroup;
          },
          set radiogroup(newval) {
            unwrap(this).radiogroup = String(newval);
          },

        },
      });
    });

//
// Interface HTMLMenuElement
//

    defineLazyProperty(global, "HTMLMenuElement", function() {
      return idl.HTMLMenuElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLMenuElement", function() {
      return new IDLInterface({
        name: "HTMLMenuElement",
        superclass: idl.HTMLElement,
        members: {
          get type() {
            return unwrap(this).type;
          },
          set type(newval) {
            unwrap(this).type = String(newval);
          },

          get label() {
            return unwrap(this).label;
          },
          set label(newval) {
            unwrap(this).label = String(newval);
          },

        },
      });
    });

//
// Interface HTMLFrameSetElement
//

    defineLazyProperty(global, "HTMLFrameSetElement", function() {
      return idl.HTMLFrameSetElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLFrameSetElement", function() {
      return new IDLInterface({
        name: "HTMLFrameSetElement",
        superclass: idl.HTMLElement,
        members: {
          get cols() {
            return unwrap(this).cols;
          },
          set cols(newval) {
            unwrap(this).cols = String(newval);
          },

          get rows() {
            return unwrap(this).rows;
          },
          set rows(newval) {
            unwrap(this).rows = String(newval);
          },

          get onafterprint() {
            return unwrap(this).onafterprint;
          },
          set onafterprint(newval) {
            unwrap(this).onafterprint = toCallbackOrNull(newval);
          },

          get onbeforeprint() {
            return unwrap(this).onbeforeprint;
          },
          set onbeforeprint(newval) {
            unwrap(this).onbeforeprint = toCallbackOrNull(newval);
          },

          get onbeforeunload() {
            return unwrap(this).onbeforeunload;
          },
          set onbeforeunload(newval) {
            unwrap(this).onbeforeunload = toCallbackOrNull(newval);
          },

          get onblur() {
            return unwrap(this).onblur;
          },
          set onblur(newval) {
            unwrap(this).onblur = toCallbackOrNull(newval);
          },

          get onerror() {
            return unwrap(this).onerror;
          },
          set onerror(newval) {
            unwrap(this).onerror = toCallbackOrNull(newval);
          },

          get onfocus() {
            return unwrap(this).onfocus;
          },
          set onfocus(newval) {
            unwrap(this).onfocus = toCallbackOrNull(newval);
          },

          get onhashchange() {
            return unwrap(this).onhashchange;
          },
          set onhashchange(newval) {
            unwrap(this).onhashchange = toCallbackOrNull(newval);
          },

          get onload() {
            return unwrap(this).onload;
          },
          set onload(newval) {
            unwrap(this).onload = toCallbackOrNull(newval);
          },

          get onmessage() {
            return unwrap(this).onmessage;
          },
          set onmessage(newval) {
            unwrap(this).onmessage = toCallbackOrNull(newval);
          },

          get onoffline() {
            return unwrap(this).onoffline;
          },
          set onoffline(newval) {
            unwrap(this).onoffline = toCallbackOrNull(newval);
          },

          get ononline() {
            return unwrap(this).ononline;
          },
          set ononline(newval) {
            unwrap(this).ononline = toCallbackOrNull(newval);
          },

          get onpagehide() {
            return unwrap(this).onpagehide;
          },
          set onpagehide(newval) {
            unwrap(this).onpagehide = toCallbackOrNull(newval);
          },

          get onpageshow() {
            return unwrap(this).onpageshow;
          },
          set onpageshow(newval) {
            unwrap(this).onpageshow = toCallbackOrNull(newval);
          },

          get onpopstate() {
            return unwrap(this).onpopstate;
          },
          set onpopstate(newval) {
            unwrap(this).onpopstate = toCallbackOrNull(newval);
          },

          get onresize() {
            return unwrap(this).onresize;
          },
          set onresize(newval) {
            unwrap(this).onresize = toCallbackOrNull(newval);
          },

          get onscroll() {
            return unwrap(this).onscroll;
          },
          set onscroll(newval) {
            unwrap(this).onscroll = toCallbackOrNull(newval);
          },

          get onstorage() {
            return unwrap(this).onstorage;
          },
          set onstorage(newval) {
            unwrap(this).onstorage = toCallbackOrNull(newval);
          },

          get onunload() {
            return unwrap(this).onunload;
          },
          set onunload(newval) {
            unwrap(this).onunload = toCallbackOrNull(newval);
          },

        },
      });
    });

//
// Interface HTMLFrameElement
//

    defineLazyProperty(global, "HTMLFrameElement", function() {
      return idl.HTMLFrameElement.publicInterface;
    }, true);

    defineLazyProperty(idl, "HTMLFrameElement", function() {
      return new IDLInterface({
        name: "HTMLFrameElement",
        superclass: idl.HTMLElement,
        members: {
          get name() {
            return unwrap(this).name;
          },
          set name(newval) {
            unwrap(this).name = String(newval);
          },

          get scrolling() {
            return unwrap(this).scrolling;
          },
          set scrolling(newval) {
            unwrap(this).scrolling = String(newval);
          },

          get src() {
            return unwrap(this).src;
          },
          set src(newval) {
            unwrap(this).src = String(newval);
          },

          get frameBorder() {
            return unwrap(this).frameBorder;
          },
          set frameBorder(newval) {
            unwrap(this).frameBorder = String(newval);
          },

          get longDesc() {
            return unwrap(this).longDesc;
          },
          set longDesc(newval) {
            unwrap(this).longDesc = String(newval);
          },

          get noResize() {
            return unwrap(this).noResize;
          },
          set noResize(newval) {
            unwrap(this).noResize = Boolean(newval);
          },

          get contentDocument() {
            return wrap(unwrap(this).contentDocument);
          },

          get contentWindow() {
            return wrap(unwrap(this).contentWindow);
          },

          get marginHeight() {
            return unwrap(this).marginHeight;
          },
          set marginHeight(newval) {
            unwrap(this).marginHeight = StringOrEmpty(newval);
          },

          get marginWidth() {
            return unwrap(this).marginWidth;
          },
          set marginWidth(newval) {
            unwrap(this).marginWidth = StringOrEmpty(newval);
          },

        },
      });
    });



    /************************************************************************
     *  src/windowobjs.js
     ************************************************************************/

//@line 1 "src/windowobjs.js"
//
// DO NOT EDIT.
// This file was generated by idl2domjs from src/idl/windowobjs.idl
//


//
// Interface Location
//

    defineLazyProperty(global, "Location", function() {
      return idl.Location.publicInterface;
    }, true);

    defineLazyProperty(idl, "Location", function() {
      return new IDLInterface({
        name: "Location",
        members: {
          get href() {
            return unwrap(this).href;
          },
          set href(newval) {
            unwrap(this).href = String(newval);
          },

          toString: function toString() {
            return unwrap(this).toString();
          },

          assign: function assign(url) {
            unwrap(this).assign(String(url));
          },

          replace: function replace(url) {
            unwrap(this).replace(String(url));
          },

          reload: function reload() {
            unwrap(this).reload();
          },

          get protocol() {
            return unwrap(this).protocol;
          },
          set protocol(newval) {
            unwrap(this).protocol = String(newval);
          },

          get host() {
            return unwrap(this).host;
          },
          set host(newval) {
            unwrap(this).host = String(newval);
          },

          get hostname() {
            return unwrap(this).hostname;
          },
          set hostname(newval) {
            unwrap(this).hostname = String(newval);
          },

          get port() {
            return unwrap(this).port;
          },
          set port(newval) {
            unwrap(this).port = String(newval);
          },

          get pathname() {
            return unwrap(this).pathname;
          },
          set pathname(newval) {
            unwrap(this).pathname = String(newval);
          },

          get search() {
            return unwrap(this).search;
          },
          set search(newval) {
            unwrap(this).search = String(newval);
          },

          get hash() {
            return unwrap(this).hash;
          },
          set hash(newval) {
            unwrap(this).hash = String(newval);
          },

        },
      });
    });

//
// Interface History
//

    defineLazyProperty(global, "History", function() {
      return idl.History.publicInterface;
    }, true);

    defineLazyProperty(idl, "History", function() {
      return new IDLInterface({
        name: "History",
        members: {
          go: function go(delta) {
            unwrap(this).go(OptionaltoLong(delta));
          },

          back: function back() {
            unwrap(this).back();
          },

          forward: function forward() {
            unwrap(this).forward();
          },

        },
      });
    });

//
// Interface Navigator
//

    defineLazyProperty(global, "Navigator", function() {
      return idl.Navigator.publicInterface;
    }, true);

    defineLazyProperty(idl, "Navigator", function() {
      return new IDLInterface({
        name: "Navigator",
        members: {
          get appName() {
            return unwrap(this).appName;
          },

          get appVersion() {
            return unwrap(this).appVersion;
          },

          get platform() {
            return unwrap(this).platform;
          },

          get userAgent() {
            return unwrap(this).userAgent;
          },

        },
      });
    });



    /************************************************************************
     *  src/AttrArrayProxy.js
     ************************************************************************/

//@line 1 "src/AttrArrayProxy.js"
// XXX
// This class is mostly the same as ArrayProxy, but it uses the item() method
// of the Attributes object instead of directly indexing an array.  Maybe
// it could be merged into a more general Array-like Proxy type.
//

// A factory function for AttrArray proxy objects
    function AttrArrayProxy(attributes) {
      // This function expects an AttributesArray object (see impl/Element.js)
      // Note, though that that object just has an element property that points
      // back to the Element object.  This proxy is based on the element object.
      var handler = O.create(AttrArrayProxy.handler);
      handler.element = attributes.element;
      handler.localprops = O.create(null);
      return Proxy.create(handler, Array.prototype);
    }

// This is the prototype object for the proxy handler object
//
// For now, while the Proxy spec is still in flux, this handler
// defines only the fundamental traps.  We can add the derived traps
// later if there is a performance bottleneck.
    AttrArrayProxy.handler = {
      isArrayIndex: function(name) { return String(toULong(name)) === name; },

      getOwnPropertyDescriptor: function getOwnPropertyDescriptor(name) {
        if (name === "length") {
          return {
            value: this.element._numattrs,
            writable: false,
            enumerable: false,
            configurable: true
          };
        }
        if (this.isArrayIndex(name)) {
          if (name < this.element._numattrs) {
            var v = this.element._attr(name);
            if (v) {
              return {
                value: wrap(v),
                writable: false,
                enumerable: true,
                configurable: true
              };
            }
          }
        }
        else {
          return O.getOwnPropertyDescriptor(this.localprops, name);
        }
      },
      getPropertyDescriptor: function(name) {
        var desc = this.getOwnPropertyDescriptor(name) ||
          O.getOwnPropertyDescriptor(A.prototype, name) ||
          O.getOwnPropertyDescriptor(O.prototype, name);
        if (desc) desc.configurable = true; // Proxies require this
        return desc;
      },
      getOwnPropertyNames: function getOwnPropertyNames() {
        var r = ["length"];
        for (var i = 0, n = this.element._numattrs; i < n; i++)
          push(r, String(i));
        return concat(r, O.getOwnPropertyNames(this.localprops));
      },
      defineProperty: function(name, desc) {
        // XXX
        // The WebIDL algorithm says we should "Reject" these attempts by
        // throwing or returning false, depending on the Throw argument, which
        // is usually strict-mode dependent.  While this is being clarified
        // I'll just throw here.  May need to change this to return false
        // instead.
        if (this.isArrayIndex(name) || name === "length")
          throw TypeError("read-only array");
        desc.configurable = true;
        O.defineProperty(this.localprops, name, desc);
      },
      delete: function(name) {
        // Can't delete the length property
        if (name === "length") return false;

        // Can't delete index properties
        if (this.isArrayIndex(name)) {
          // If an item exists at that index, return false: won't delete it
          // Otherwise, if no item, then the index was out of bounds and
          // we return true to indicate that the deletion was "successful"
          var idx = toULong(name);
          return idx >= this.element._numattrs;
        }
        return delete this.localprops[name];
      },

      // WebIDL: Host objects implementing an interface that supports
      // indexed or named properties defy being fixed; if Object.freeze,
      // Object.seal or Object.preventExtensions is called on one, these
      // the function MUST throw a TypeError.
      //
      // Proxy proposal: When handler.fix() returns undefined, the
      // corresponding call to Object.freeze, Object.seal, or
      // Object.preventExtensions will throw a TypeError.
      fix: function() {},

      // Get all enumerable properties
      // XXX: Remove this method when this bug is fixed:
      // https://bugzilla.mozilla.org/show_bug.cgi?id=665198
      enumerate: function() {
        var r = [];
        for (var i = 0, n = this.element._numattrs; i < n; i++)
          push(r, String(i));
        for(var name in this.localprops) push(r, name);
        for(var name in Array.prototype) push(r, name);
        return r;
      }
    };



    /************************************************************************
     *  src/NodeListProxy.js
     ************************************************************************/

//@line 1 "src/NodeListProxy.js"
// A factory function for NodeList proxy objects
    function NodeListProxy(list) {
      // This function expects an object with a length property and an item()
      // method.  If we pass it a plain array, it will add the item() method
      //
      // We should avoid reading the length property of the list when possible
      // because in lazy implementations such as impl/FilteredElementList,
      // reading the length forces the filter to process the entire document
      // tree undoing the laziness.
      if (isArray(list)) {
        if (!hasOwnProperty(list, "item"))
          list.item = function(n) { return list[n]; };
      }

      var handler = O.create(NodeListProxy.handler);
      handler.list = list;
      handler.localprops = O.create(null);
      var p = Proxy.create(handler, idl.NodeList.prototype);

      return p;
    }

// This is the prototype object for the proxy handler object
//
// For now, while the Proxy spec is still in flux, this handler
// defines only the fundamental traps.  We can add the derived traps
// later if there is a performance bottleneck.
    NodeListProxy.handler = {
      isArrayIndex: function(name) { return String(toULong(name)) === name; },

      // try adding this to make Node proxies work right
      // Need to work around the "illegal access" error
      /*
       get: function(receiver, name) {

       if (this.isArrayIndex(name)) {
       return this.list.item(name);
       }
       else if (name in this.localprops) {
       return this.localprops[name];
       }
       else {
       return idl.NodeList.prototype[name]
       }
       },
       */
      getOwnPropertyDescriptor: function getOwnPropertyDescriptor(name) {
        if (this.isArrayIndex(name)) {
          // If the index is greater than the length, then we'll just
          // get null or undefined here and do nothing. That is better
          // than testing length.
          var v = this.list.item(name);
          if (v) {
            return {
              value: wrap(v, idl.Node),
              writable: false,
              enumerable: true,
              configurable: true
            };
          }
          else {
            // We're never going to allow array index properties to be
            // set on localprops, so we don't have to do the test
            // below and can just return nothing now.
            return;
          }
        }
        return O.getOwnPropertyDescriptor(this.localprops, name);
      },
      getPropertyDescriptor: function(name) {
        var desc = this.getOwnPropertyDescriptor(name) ||
          O.getOwnPropertyDescriptor(idl.NodeList.prototype, name) ||
          O.getOwnPropertyDescriptor(O.prototype, name);
        if (desc) desc.configurable = true; // Proxies require this
        return desc;
      },
      getOwnPropertyNames: function getOwnPropertyNames() {
        var r = [];
        for (var i = 0, n = this.list.length; i < n; i++)
          push(r, String(i));
        return concat(r, O.getOwnPropertyNames(this.localprops));
      },
      defineProperty: function(name, desc) {
        // XXX
        // The WebIDL algorithm says we should "Reject" these attempts by
        // throwing or returning false, depending on the Throw argument, which
        // is usually strict-mode dependent.  While this is being clarified
        // I'll just throw here.  May need to change this to return false
        // instead.
        if (this.isArrayIndex(name))
          throw new TypeError(
            "can't set or create indexed properties '" + name + "'");

        O.defineProperty(this.localprops, name, desc);
      },
      delete: function(name) {
        // Can't delete index properties
        if (this.isArrayIndex(name)) {
          // If an item exists at that index, return false: won't delete it
          // Otherwise, if no item, then the index was out of bounds and
          // we return true to indicate that the deletion was "successful"
          return !this.list.item(name);
        }
        return delete this.localprops[name];
      },

      // WebIDL: Host objects implementing an interface that supporst
      // indexed or named properties defy being fixed; if Object.freeze,
      // Object.seal or Object.preventExtensions is called on one, these
      // the function MUST throw a TypeError.
      //
      // Proxy proposal: When handler.fix() returns undefined, the
      // corresponding call to Object.freeze, Object.seal, or
      // Object.preventExtensions will throw a TypeError.
      fix: function() {},

      // Get all enumerable properties
      // XXX: Remove this method when this bug is fixed:
      // https://bugzilla.mozilla.org/show_bug.cgi?id=665198
      enumerate: function() {
        var r = [];
        for (var i = 0, n = this.list.length; i < n; i++)
          push(r, String(i));
        for(var name in this.localprops) push(r, name);
        for(var name in idl.NodeList.prototype) push(r, name);
        return r;
      }
    };



    /************************************************************************
     *  src/HTMLCollectionProxy.js
     ************************************************************************/

//@line 1 "src/HTMLCollectionProxy.js"
// A factory function for HTMLCollection proxy objects.
// Expects an object with a length property and item() and namedItem() methods.
// That object must also have a namedItems property that returns an object
// that maps element names to some value.
//
// XXX: bug I can't define an expando property if there is a named property
// with the same name. I think it is a bug in the Proxy itself.  Looks like
// define property is not even being called.
//
    function HTMLCollectionProxy(collection) {
      var handler = O.create(HTMLCollectionProxy.handler);
      handler.collection = collection;
      handler.localprops = O.create(null);
      return Proxy.create(handler, idl.HTMLCollection.prototype);
    }

// This is the prototype object for the proxy handler object
    HTMLCollectionProxy.handler = {
      isArrayIndex: function(name) { return String(toULong(name)) === name; },

      // This is the "named property visibility algorithm" from WebIDL
      isVisible: function(name) {
        // 1) If P is not a supported property name of O, then return false.
        if (!(name in this.collection.namedItems)) return false;

        // 2) If O implements an interface that has the
        // [OverrideBuiltins] extended attribute, then return true.
        // HTMLCollection does not OverrideBuiltins, so skip this step

        // 3) If O has an own property named P, then return false.
        if (hasOwnProperty(this.localprops, name)) return false;

        // 4) Let prototype be the value of the internal [[Prototype]]
        // property of O.
        // 5) If prototype is null, then return true.
        // 6) If the result of calling the [[HasProperty]] internal
        // method on prototype with property name P is true, then
        // return false.
        if (name in idl.HTMLCollection.prototype) return false;

        // 7) Return true.
        return true;
      },

      getOwnPropertyDescriptor: function getOwnPropertyDescriptor(name) {
        var item;
        if (this.isArrayIndex(name)) {
          var idx = toULong(name);
          if (idx < this.collection.length) {
            return {
              value: wrap(this.collection.item(idx), idl.Element),
              writable: false,
              enumerable: true,
              configurable: true
            };
          }
        }

        if (this.isVisible(name)) {
          return {
            value: wrap(this.collection.namedItem(name), idl.Element),
            writable: false,
            enumerable: true,
            configurable: true
          };
        }

        return O.getOwnPropertyDescriptor(this.localprops, name);
      },

      getPropertyDescriptor: function(name) {
        var desc = this.getOwnPropertyDescriptor(name) ||
          O.getOwnPropertyDescriptor(idl.HTMLCollection.prototype, name) ||
          O.getOwnPropertyDescriptor(Object.prototype, name);
        if (desc) desc.configurable = true; // Proxies require this
        return desc;
      },

      getOwnPropertyNames: function getOwnPropertyNames() {
        var names = [];
        for (var i = 0, n = this.collection.length; i < n; i++)
          push(names, String(i));
        for(var n in this.collection.namedItems)
          push(names, n);
        return concat(r, O.getOwnPropertyNames(this.localprops));
      },

      defineProperty: function(name, desc) {
        // XXX
        // For now, we "Reject" by throwing TypeError.  Proxies may change
        // so we only have to return false.
        if (this.isArrayIndex(name))
          throw new TypeError(
            "can't set or create indexed property '" + name + "'");

        // Don't allow named properties to overridden by expando properties,
        // even with an explicit Object.defineProperty() call.
        // XXX
        // The resolution of this issue is still pending on the mailing list.
        if (name in this.collection.namedItems)
          throw new TypeError(
            "can't override named property '" + name + "'");

        desc.configurable = true;
        O.defineProperty(this.localprops, name, desc);
      },

      delete: function(name) {
        // Can't delete array elements, but if they don't exist, don't complain
        if (this.isArrayIndex(name)) {
          var idx = toULong(name);
          return idx >= this.collection.length;
        }

        // Can't delete named properties
        if (this.isVisible(name)) {
          return false;
        }

        // Finally, try deleting an expando
        return delete this.localprops[name];
      },

      fix: function() {},

      // Get all enumerable properties
      // XXX: Remove this method when this bug is fixed:
      // https://bugzilla.mozilla.org/show_bug.cgi?id=665198
      enumerate: function() {
        var names = [];
        for (var i = 0, n = this.collection.length; i < n; i++)
          push(names, String(i));
        for(var n in this.collection.namedItems)
          push(names, n);
        for(var name in this.localprops)
          push(names, name);
        for(var name in idl.HTMLCollection.prototype)
          push(names, name);
        return names;
      }
    };



    /************************************************************************
     *  src/DOMException.js
     ************************************************************************/

//@line 1 "src/DOMException.js"
//
// This DOMException implementation is not WebIDL compatible.
// WebIDL exceptions are in flux right now, so I'm just doing something
// simple and approximately web compatible for now.
//
    const INDEX_SIZE_ERR = 1;
    const HIERARCHY_REQUEST_ERR = 3;
    const WRONG_DOCUMENT_ERR = 4;
    const INVALID_CHARACTER_ERR = 5;
    const NO_MODIFICATION_ALLOWED_ERR = 7;
    const NOT_FOUND_ERR = 8;
    const NOT_SUPPORTED_ERR = 9;
    const INVALID_STATE_ERR = 11;
    const SYNTAX_ERR = 12;
    const INVALID_MODIFICATION_ERR = 13;
    const NAMESPACE_ERR = 14;
    const INVALID_ACCESS_ERR = 15;
    const TYPE_MISMATCH_ERR = 17;
    const SECURITY_ERR = 18;
    const NETWORK_ERR = 19;
    const ABORT_ERR = 20;
    const URL_MISMATCH_ERR = 21;
    const QUOTA_EXCEEDED_ERR = 22;
    const TIMEOUT_ERR = 23;
    const INVALID_NODE_TYPE_ERR = 24;
    const DATA_CLONE_ERR = 25;

    global.DOMException = (function() {
      // Code to name
      const names = [
        null,  // No error with code 0
        "INDEX_SIZE_ERR",
        null, // historical
        "HIERARCHY_REQUEST_ERR",
        "WRONG_DOCUMENT_ERR",
        "INVALID_CHARACTER_ERR",
        null, // historical
        "NO_MODIFICATION_ALLOWED_ERR",
        "NOT_FOUND_ERR",
        "NOT_SUPPORTED_ERR",
        null, // historical
        "INVALID_STATE_ERR",
        "SYNTAX_ERR",
        "INVALID_MODIFICATION_ERR",
        "NAMESPACE_ERR",
        "INVALID_ACCESS_ERR",
        null, // historical
        "TYPE_MISMATCH_ERR",
        "SECURITY_ERR",
        "NETWORK_ERR",
        "ABORT_ERR",
        "URL_MISMATCH_ERR",
        "QUOTA_EXCEEDED_ERR",
        "TIMEOUT_ERR",
        "INVALID_NODE_TYPE_ERR",
        "DATA_CLONE_ERR",
      ];

      // Code to message
      // These strings are from the 13 May 2011 Editor's Draft of DOM Core.
      // http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html
      // Copyright © 2011 W3C® (MIT, ERCIM, Keio), All Rights Reserved.
      // Used under the terms of the W3C Document License:
      // http://www.w3.org/Consortium/Legal/2002/copyright-documents-20021231
      const messages = [
        null,  // No error with code 0
        "INDEX_SIZE_ERR (1): the index is not in the allowed range",
        null,
        "HIERARCHY_REQUEST_ERR (3): the operation would yield an incorrect nodes model",
        "WRONG_DOCUMENT_ERR (4): the object is in the wrong Document, a call to importNode is required",
        "INVALID_CHARACTER_ERR (5): the string contains invalid characters",
        null,
        "NO_MODIFICATION_ALLOWED_ERR (7): the object can not be modified",
        "NOT_FOUND_ERR (8): the object can not be found here",
        "NOT_SUPPORTED_ERR (9): this operation is not supported",
        null,
        "INVALID_STATE_ERR (11): the object is in an invalid state",
        "SYNTAX_ERR (12): the string did not match the expected pattern",
        "INVALID_MODIFICATION_ERR (13): the object can not be modified in this way",
        "NAMESPACE_ERR (14): the operation is not allowed by Namespaces in XML",
        "INVALID_ACCESS_ERR (15): the object does not support the operation or argument",
        null,
        "TYPE_MISMATCH_ERR (17): the type of the object does not match the expected type",
        "SECURITY_ERR (18): the operation is insecure",
        "NETWORK_ERR (19): a network error occurred",
        "ABORT_ERR (20): the user aborted an operation",
        "URL_MISMATCH_ERR (21): the given URL does not match another URL",
        "QUOTA_EXCEEDED_ERR (22): the quota has been exceeded",
        "TIMEOUT_ERR (23): a timeout occurred",
        "INVALID_NODE_TYPE_ERR (24): the supplied node is invalid or has an invalid ancestor for this operation",
        "DATA_CLONE_ERR (25): the object can not be cloned.",
      ];

      // Name to code
      const constants = {
        INDEX_SIZE_ERR: INDEX_SIZE_ERR,
        DOMSTRING_SIZE_ERR: 2, // historical
        HIERARCHY_REQUEST_ERR: HIERARCHY_REQUEST_ERR,
        WRONG_DOCUMENT_ERR: WRONG_DOCUMENT_ERR,
        INVALID_CHARACTER_ERR: INVALID_CHARACTER_ERR,
        NO_DATA_ALLOWED_ERR: 6, // historical
        NO_MODIFICATION_ALLOWED_ERR: NO_MODIFICATION_ALLOWED_ERR,
        NOT_FOUND_ERR: NOT_FOUND_ERR,
        NOT_SUPPORTED_ERR: NOT_SUPPORTED_ERR,
        INUSE_ATTRIBUTE_ERR: 10, // historical
        INVALID_STATE_ERR: INVALID_STATE_ERR,
        SYNTAX_ERR: SYNTAX_ERR,
        INVALID_MODIFICATION_ERR: INVALID_MODIFICATION_ERR,
        NAMESPACE_ERR: NAMESPACE_ERR,
        INVALID_ACCESS_ERR: INVALID_ACCESS_ERR,
        VALIDATION_ERR: 16, // historical
        TYPE_MISMATCH_ERR: TYPE_MISMATCH_ERR,
        SECURITY_ERR: SECURITY_ERR,
        NETWORK_ERR: NETWORK_ERR,
        ABORT_ERR: ABORT_ERR,
        URL_MISMATCH_ERR: URL_MISMATCH_ERR,
        QUOTA_EXCEEDED_ERR: QUOTA_EXCEEDED_ERR,
        TIMEOUT_ERR: TIMEOUT_ERR,
        INVALID_NODE_TYPE_ERR: INVALID_NODE_TYPE_ERR,
        DATA_CLONE_ERR: DATA_CLONE_ERR,
      };

      function DOMException(code) {
        /*
         // This kudge is so we get lineNumber, fileName and stack properties
         var e = Error(messages[code]);
         e.__proto__ = DOMException.prototype;
         */

        var e = O.create(DOMException.prototype);
        e.code = code;
        e.message = messages[code];
        e.name = names[code];

        // Get stack, lineNumber and fileName properties like a real
        // Error object has.
        var x = Error();
        var frames = split(x.stack,"\n");
        A.shift(frames);
        e.stack = join(frames,"\n");
        var parts = match(frames[0], /[^@]*[@(]([^:]*):(\d*)/);

        if (parts) {
          e.fileName = parts[1];
          e.lineNumber = parts[2];
        }
        else {
          e.fileName = "";
          e.lineNumber = -1;
        }

        return e;
      }

      DOMException.prototype = O.create(Error.prototype);

      // Initialize the constants on DOMException and DOMException.prototype
      for(var c in constants) {
        var v = constants[c];
        defineConstantProp(DOMException, c, v);
        defineConstantProp(DOMException.prototype, c, v);
      }

      return DOMException;
    }());

//
// Shortcut functions for throwing errors of various types.
//
    function IndexSizeError() { throw DOMException(INDEX_SIZE_ERR); }
    function HierarchyRequestError() { throw DOMException(HIERARCHY_REQUEST_ERR); }
    function WrongDocumentError() { throw DOMException(WRONG_DOCUMENT_ERR); }
    function InvalidCharacterError() { throw DOMException(INVALID_CHARACTER_ERR); }
    function NoModificationAllowedError() { throw DOMException(NO_MODIFICATION_ALLOWED_ERR); }
    function NotFoundError() { throw DOMException(NOT_FOUND_ERR); }
    function NotSupportedError() { throw DOMException(NOT_SUPPORTED_ERR); }
    function InvalidStateError() { throw DOMException(INVALID_STATE_ERR); }
    function SyntaxError() { throw DOMException(SYNTAX_ERR); }
    function InvalidModificationError() { throw DOMException(INVALID_MODIFICATION_ERR); }
    function NamespaceError() { throw DOMException(NAMESPACE_ERR); }
    function InvalidAccessError() { throw DOMException(INVALID_ACCESS_ERR); }
    function TypeMismatchError() { throw DOMException(TYPE_MISMATCH_ERR); }
    function SecurityError() { throw DOMException(SECURITY_ERR); }
    function NetworkError() { throw DOMException(NETWORK_ERR); }
    function AbortError() { throw DOMException(ABORT_ERR); }
    function UrlMismatchError() { throw DOMException(URL_MISMATCH_ERR); }
    function QuotaExceededError() { throw DOMException(QUOTA_EXCEEDED_ERR); }
    function TimeoutError() { throw DOMException(TIMEOUT_ERR); }
    function InvalidNodeTypeError() { throw DOMException(INVALID_NODE_TYPE_ERR); }
    function DataCloneError() { throw DOMException(DATA_CLONE_ERR); }




    /************************************************************************
     *  src/impl/EventTarget.js
     ************************************************************************/

//@line 1 "src/impl/EventTarget.js"
    defineLazyProperty(impl, "EventTarget", function() {
      function EventTarget() {}

      EventTarget.prototype = {
        _idlName: "EventTarget",

        // XXX
        // See WebIDL §4.8 for details on object event handlers
        // and how they should behave.  We actually have to accept
        // any object to addEventListener... Can't type check it.
        // on registration.

        // XXX:
        // Capturing event listeners are sort of rare.  I think I can optimize
        // them so that dispatchEvent can skip the capturing phase (or much of
        // it).  Each time a capturing listener is added, increment a flag on
        // the target node and each of its ancestors.  Decrement when removed.
        // And update the counter when nodes are added and removed from the
        // tree as well.  Then, in dispatch event, the capturing phase can
        // abort if it sees any node with a zero count.
        addEventListener: function addEventListener(type, listener, capture) {
          if (!listener) return;
          if (capture === undefined) capture = false;
          if (!this._listeners) this._listeners = {};
          if (!(type in this._listeners)) this._listeners[type] = {};
          var list = this._listeners[type];

          // If this listener has already been registered, just return
          for(var i = 0, n = list.length; i < n; i++) {
            var l = list[i];
            if (l.listener === listener && l.capture === capture)
              return;
          }

          // Add an object to the list of listeners
          var obj = { listener: listener, capture: capture };
          if (typeof listener === "function") obj.f = listener;
          push(list, obj);
        },

        removeEventListener: function removeEventListener(type,
                                                          listener,
                                                          capture) {
          if (capture === undefined) capture = false;
          if (this._listeners) {
            var list = this._listeners[type];
            if (list) {
              // Find the listener in the list and remove it
              for(var i = 0, n = list.length; i < n; i++) {
                var l = list[i];
                if (l.listener === listener && l.capture === capture) {
                  if (list.length === 1)
                    delete this._listeners[type];
                  else
                    splice(list, i, 1);
                }
              }
            }
          }
        },

        // This is the public API for dispatching untrusted public events.
        // See _dispatchEvent for the implementation
        dispatchEvent: function dispatchEvent(event) {
          // Dispatch an untrusted event
          return this._dispatchEvent(event, false);
        },

        //
        // See DOMCore §4.4
        // XXX: I'll probably need another version of this method for
        // internal use, one that does not set isTrusted to false.
        // XXX: see Document._dispatchEvent: perhaps that and this could
        // call a common internal function with different settings of
        // a trusted boolean argument
        //
        // XXX:
        // The spec has changed in how to deal with handlers registered
        // on idl or content attributes rather than with addEventListener.
        // Used to say that they always ran first.  That's how webkit does it
        // Spec now says that they run in a position determined by
        // when they were first set.  FF does it that way.  See:
        // http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#event-handlers
        //
        _dispatchEvent: function _dispatchEvent(event, trusted) {
          if (typeof trusted !== "boolean") trusted = false;
          function invoke(target, event) {
            var type = event.type, phase = event.eventPhase;
            event.currentTarget = target;

            // If there was an individual handler defined, invoke it first
            // XXX: see comment above: this shouldn't always be first.
            if (phase !== CAPTURING_PHASE &&
              target._handlers && target._handlers[type])
            {
              var handler = target._handlers[type];
              var rv;
              if (typeof handler === "function") {
                rv=handler.call(wrap(event.currentTarget), wrap(event));
              }
              else {
                var f = handler.handleEvent;
                if (typeof f !== "function")
                  throw TypeError("handleEvent property of " +
                    "event handler object is" +
                    "not a function.");
                rv=f.call(handler, wrap(event));
              }

              switch(event.type) {
                case "mouseover":
                  if (rv === true)  // Historical baggage
                    event.preventDefault();
                  break;
                case "beforeunload":
                // XXX: eventually we need a special case here
                default:
                  if (rv === false)
                    event.preventDefault();
                  break;
              }
            }

            // Now invoke list list of listeners for this target and type
            var list = target._listeners && target._listeners[type];
            if (!list) return;

            for(var i = 0, n = list.length; i < n; i++) {
              if (event._stopImmediatePropagation) return;
              var l = list[i];
              if ((phase === CAPTURING_PHASE && !l.capture) ||
                (phase === BUBBLING_PHASE && l.capture))
                continue;
              if (l.f) {
                // Wrap both the this value of the call and the
                // argument passed to the call, since these objects
                // impl are being exposed through the public API
                l.f.call(wrap(event.currentTarget), wrap(event));
              }
              else {
                var f = l.listener.handleEvent;
                if (typeof f !== "function")
                  throw TypeError("handleEvent property of " +
                    "event listener object is " +
                    "not a function.");
                // Here we only have to wrap the event object, since
                // the listener object was passed in to us from
                // the public API.
                f.call(l.listener, wrap(event));
              }
            }
          }

          if (!event._initialized || event._dispatching) InvalidStateError();
          event.isTrusted = trusted;

          // Begin dispatching the event now
          event._dispatching = true;
          event.target = this;

          // Build the list of targets for the capturing and bubbling phases
          // XXX: we'll eventually have to add Window to this list.
          var ancestors = [];
          for(var n = this.parentNode; n; n = n.parentNode)
            push(ancestors, n);

          // Capturing phase
          event.eventPhase = CAPTURING_PHASE;
          for(var i = ancestors.length-1; i >= 0; i--) {
            invoke(ancestors[i], event);
            if (event._propagationStopped) break;
          }

          // At target phase
          if (!event._propagationStopped) {
            event.eventPhase = AT_TARGET;
            invoke(this, event);
          }

          // Bubbling phase
          if (event.bubbles && !event._propagationStopped) {
            event.eventPhase = BUBBLING_PHASE;
            for(var i = 0, n = ancestors.length; i < n; i++) {
              invoke(ancestors[i], event);
              if (event._propagationStopped) break;
            }
          }

          event._dispatching = false;
          event.eventPhase = AT_TARGET;
          event.currentTarget = null;

          // Deal with mouse events and figure out when
          // a click has happened
          if (trusted &&
            !event.defaultPrevented &&
            event instanceof impl.MouseEvent)
          {
            switch(event.type) {
              case "mousedown":
                this._armed = {
                  x: event.clientX,
                  y: event.clientY,
                  t: event.timeStamp
                };
                break;
              case "mouseout":
              case "mouseover":
                this._armed = null;
                break;
              case "mouseup":
                if (this._isClick(event)) this._doClick(event);
                this._armed = null;
                break;
            }
          }



          return !event.defaultPrevented;
        },

        // Determine whether a click occurred
        // XXX We don't support double clicks for now
        _isClick: function(event) {
          return (this._armed !== null &&
          event.type === "mouseup" &&
          event.isTrusted &&
          event.button === 0 &&
          event.timeStamp - this._armed.t < 1000 &&
          Math.abs(event.clientX - this._armed.x) < 10 &&
          Math.abs(event.clientY - this._armed.Y) < 10);
        },

        // Clicks are handled like this:
        // http://www.whatwg.org/specs/web-apps/current-work/multipage/elements.html#interactive-content-0
        //
        // Note that this method is similar to the HTMLElement.click() method
        // The event argument must be the trusted mouseup event
        _doClick: function(event) {
          if (this._click_in_progress) return;
          this._click_in_progress = true;

          // Find the nearest enclosing element that is activatable
          // An element is activatable if it has a
          // _post_click_activation_steps hook
          var activated = this;
          while(activated && !activated._post_click_activation_steps)
            activated = activated.parentNode;

          if (activated && activated._pre_click_activation_steps) {
            activated._pre_click_activation_steps();
          }

          var click = this.ownerDocument.createEvent("MouseEvent");
          click.initMouseEvent("click", true, true,
            this.ownerDocument.defaultView, 1,
            event.screenX, event.screenY,
            event.clientX, event.clientY,
            event.ctrlKey, event.altKey,
            event.shiftKey, event.metaKey,
            event.button, null);

          var result = this._dispatchEvent(click, true);

          if (activated) {
            if (result) {
              // This is where hyperlinks get followed, for example.
              if (activated._post_click_activation_steps)
                activated._post_click_activation_steps(click);
            }
            else {
              if (activated._cancelled_activation_steps)
                activated._cancelled_activation_steps();
            }
          }
        },

        //
        // An event handler is like an event listener, but it registered
        // by setting an IDL or content attribute like onload or onclick.
        // There can only be one of these at a time for any event type.
        // This is an internal method for the attribute accessors and
        // content attribute handlers that need to register events handlers.
        // The type argument is the same as in addEventListener().
        // The handler argument is the same as listeners in addEventListener:
        // it can be a function or an object. Pass null to remove any existing
        // handler.  Handlers are always invoked before any listeners of
        // the same type.  They are not invoked during the capturing phase
        // of event dispatch.
        //
        _setEventHandler: function _setEventHandler(type, handler) {
          if (!this._handlers) this._handlers = {};

          if (handler)
            this._handlers[type] = handler;
          else
            delete this._handlers[type];
        },

        _getEventHandler: function _getEventHandler(type) {
          return (this._handlers && this._handlers[type]) || null;
        }

      };

      return EventTarget;
    });


    /************************************************************************
     *  src/impl/Node.js
     ************************************************************************/

//@line 1 "src/impl/Node.js"
    defineLazyProperty(impl, "Node", function() {
      // All nodes have a nodeType and an ownerDocument.
      // Once inserted, they also have a parentNode.
      // This is an abstract class; all nodes in a document are instances
      // of a subtype, so all the properties are defined by more specific
      // constructors.
      function Node() {
      }

      Node.prototype = O.create(impl.EventTarget.prototype, {

        // Node that are not inserted into the tree inherit a null parent
        // XXX
        // Can't use constant(null) here because then I couldn't set a non-null
        // value that would override the inherited constant.  Perhaps that
        // means I shouldn't use the prototype and should just set the
        // value in each node constructor?
        parentNode: { value: null, writable: true },

        // XXX: the baseURI attribute is defined by dom core, but
        // a correct implementation of it requires HTML features, so
        // we'll come back to this later.
        baseURI: attribute(nyi),

        parentElement: attribute(function() {
          if (this.parentNode) {
            if (this.parentNode.nodeType===ELEMENT_NODE)
              return this.parentNode;
          } else {
            return null;
          }
        }),

        hasChildNodes: constant(function() {  // Overridden in leaf.js
          return this.childNodes.length > 0;
        }),

        firstChild: attribute(function() {
          return this.childNodes.length === 0
            ? null
            : this.childNodes[0];
        }),

        lastChild: attribute(function() {
          return this.childNodes.length === 0
            ? null
            : this.childNodes[this.childNodes.length-1];
        }),

        previousSibling: attribute(function() {
          if (!this.parentNode) return null;
          var sibs = this.parentNode.childNodes, i = this.index;
          return i === 0
            ? null
            : sibs[i-1]
        }),

        nextSibling: attribute(function() {
          if (!this.parentNode) return null;
          var sibs = this.parentNode.childNodes, i = this.index;
          return i+1 === sibs.length
            ? null
            : sibs[i+1]
        }),

        insertBefore: constant(function insertBefore(child, refChild) {
          var parent = this;
          if (refChild === null) return this.appendChild(child);
          if (refChild.parentNode !== parent) NotFoundError();
          if (child.isAncestor(parent)) HierarchyRequestError();
          if (child.nodeType === DOCUMENT_NODE) HierarchyRequestError();
          parent.ensureSameDoc(child);
          child.insert(parent, refChild.index);
          return child;
        }),


        appendChild: constant(function(child) {
          var parent = this;
          if (child.isAncestor(parent)) HierarchyRequestError();
          if (child.nodeType === DOCUMENT_NODE) HierarchyRequestError();
          parent.ensureSameDoc(child);
          child.insert(parent, parent.childNodes.length);
          return child;
        }),

        removeChild: constant(function removeChild(child) {
          var parent = this;
          if (child.parentNode !== parent) NotFoundError();
          child.remove();
          return child;
        }),

        replaceChild: constant(function replaceChild(newChild, oldChild) {
          var parent = this;
          if (oldChild.parentNode !== parent) NotFoundError();
          if (newChild.isAncestor(parent)) HierarchyRequestError();
          parent.ensureSameDoc(newChild);

          var refChild = oldChild.nextSibling;
          oldChild.remove();
          parent.insertBefore(newChild, refChild);
          return oldChild;
        }),

        compareDocumentPosition:constant(function compareDocumentPosition(that){
          // Basic algorithm for finding the relative position of two nodes.
          // Make a list the ancestors of each node, starting with the
          // document element and proceeding down to the nodes themselves.
          // Then, loop through the lists, looking for the first element
          // that differs.  The order of those two elements give the
          // order of their descendant nodes.  Or, if one list is a prefix
          // of the other one, then that node contains the other.

          if (this === that) return 0;

          // If they're not owned by the same document or if one is rooted
          // and one is not, then they're disconnected.
          if (this.ownerDocument != that.ownerDocument ||
            this.rooted !== that.rooted)
            return (DOCUMENT_POSITION_DISCONNECTED +
            DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC);

          // Get arrays of ancestors for this and that
          var these = [], those = [];
          for(var n = this; n !== null; n = n.parentNode) push(these, n);
          for(var n = that; n !== null; n = n.parentNode) push(those, n);
          these.reverse();  // So we start with the outermost
          those.reverse();

          if (these[0] !== those[0]) // No common ancestor
            return (DOCUMENT_POSITION_DISCONNECTED +
            DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC);

          var n = Math.min(these.length, those.length);
          for(var i = 1; i < n; i++) {
            if (these[i] !== those[i]) {
              // We found two different ancestors, so compare
              // their positions
              if (these[i].index < those[i].index)
                return DOCUMENT_POSITION_FOLLOWING;
              else
                return DOCUMENT_POSITION_PRECEDING;
            }
          }

          // If we get to here, then one of the nodes (the one with the
          // shorter list of ancestors) contains the other one.
          if (these.length < those.length)
            return (DOCUMENT_POSITION_FOLLOWING +
            DOCUMENT_POSITION_CONTAINED_BY);
          else
            return (DOCUMENT_POSITION_PRECEDING +
            DOCUMENT_POSITION_CONTAINS);
        }),

        isSameNode: constant(function isSameNode(node) {
          return this === node;
        }),


        // This method implements the generic parts of node equality testing
        // and defers to the (non-recursive) type-specific isEqual() method
        // defined by subclasses
        isEqualNode: constant(function isEqualNode(node) {
          if (!node) return false;
          if (node.nodeType !== this.nodeType) return false;

          // Check for same number of children
          // Check for children this way because it is more efficient
          // for childless leaf nodes.
          var n; // number of child nodes
          if (!this.firstChild) {
            n = 0;
            if (node.firstChild) return false;
          }
          else {
            n = this.childNodes.length;
            if (node.childNodes.length != n) return false;
          }

          // Check type-specific properties for equality
          if (!this.isEqual(node)) return false;

          // Now check children for equality
          for(var i = 0; i < n; i++) {
            var c1 = this.childNodes[i], c2 = node.childNodes[i];
            if (!c1.isEqualNode(c2)) return false;
          }

          return true;
        }),

        // This method delegates shallow cloning to a clone() method
        // that each concrete subclass must implement
        cloneNode: constant(function(deep) {
          // Clone this node
          var clone = this.clone();

          // Handle the recursive case if necessary
          if (deep && this.firstChild) {
            for(var i = 0, n = this.childNodes.length; i < n; i++) {
              clone.appendChild(this.childNodes[i].cloneNode(true));
            }
          }

          return clone;
        }),

        lookupPrefix: constant(function lookupPrefix(ns) {
          var e;
          if (ns === "") return null;
          switch(this.nodeType) {
            case ELEMENT_NODE:
              return this.locateNamespacePrefix(ns);
            case DOCUMENT_NODE:
              e = this.documentElement;
              return e ? e.locateNamespacePrefix(ns) : null;
            case DOCUMENT_TYPE_NODE:
            case DOCUMENT_FRAGMENT_NODE:
              return null;
            default:
              e = this.parentElement;
              return e ? e.locateNamespacePrefix(ns) : null;
          }
        }),


        lookupNamespaceURI: constant(function lookupNamespaceURI(prefix) {
          var e;
          switch(this.nodeType) {
            case ELEMENT_NODE:
              return this.locateNamespace(prefix);
            case DOCUMENT_NODE:
              e = this.documentElement;
              return e ? e.locateNamespace(prefix) : null;
            case DOCUMENT_TYPE_NODE:
            case DOCUMENT_FRAGMENT_NODE:
              return null;
            default:
              e = this.parentElement;
              return e ? e.locateNamespace(prefix) : null;
          }
        }),

        isDefaultNamespace: constant(function isDefaultNamespace(ns) {
          var defaultns = this.lookupNamespaceURI(null);
          if (defaultns == null) defaultns = "";
          return ns === defaultns;
        }),

        // Utility methods for nodes.  Not part of the DOM

        // Return the index of this node in its parent.
        // Throw if no parent, or if this node is not a child of its parent
        index: attribute(function() {
          assert(this.parentNode);
          var kids = this.parentNode.childNodes
          if (this._index == undefined || kids[this._index] != this) {
            this._index = A.indexOf(kids, this);
            assert(this._index != -1);
          }
          return this._index;
        }),

        // Return true if this node is equal to or is an ancestor of that node
        // Note that nodes are considered to be ancestors of themselves
        isAncestor: constant(function(that) {
          // If they belong to different documents, then they're unrelated.
          if (this.ownerDocument != that.ownerDocument) return false;
          // If one is rooted and one isn't then they're not related
          if (this.rooted !== that.rooted) return false;

          // Otherwise check by traversing the parentNode chain
          for(var e = that; e; e = e.parentNode) {
            if (e === this) return true;
          }
          return false;
        }),

        // When a user agent is to ensure that two Nodes, old and new, are
        // in the same Document, it must run the following steps:
        //
        //     If new is a DocumentType, run the following steps:
        //
        //         If new's ownerDocument is not null, and it is not equal
        //         to old's ownerDocument, throw a WRONG_DOCUMENT_ERR
        //         exception and terminate these steps.
        //
        //         Otherwise, set its ownerDocument to old's
        //         ownerDocument.
        //
        //     Otherwise, invoke old's ownerDocument's adoptNode method
        //     with new as its argument.
        //
        //     If old's ownerDocument and new's ownerDocument are not the
        //     same, throw a HIERARCHY_REQUEST_ERR
        ensureSameDoc: constant(function(that) {
          // Get the owner of the node, the node itself, if it is a document
          var ownerdoc = this.ownerDocument || this;

          if (that.nodeType === DOCUMENT_TYPE_NODE) {
            if (that.ownerDocument !== null && that.ownerDocument !== ownerdoc)
              WrongDocumentError();
            that.ownerDocument = ownerdoc;
          }
          else {
            // The spec's algorithm says to call adoptNode
            // unconditionally, which will remove it from its current
            // location in the document even it if is not changing
            // documents.  I don't do that here because that would cause a
            // lot of unnecessary uproot and reroot mutation events.
            if (that.ownerDocument !== ownerdoc)
              ownerdoc.adoptNode(that);
          }

          // XXX: this step does not seem necessary.
          // If mutation events are added, however, it becomes necessary
          if (that.ownerDocument !== ownerdoc) HierarchyRequestError();
        }),

        // Remove this node from its parent
        remove: constant(function remove() {
          // Remove this node from its parents array of children
          splice(this.parentNode.childNodes, this.index, 1);

          // Update the structure id for all ancestors
          this.parentNode.modify();

          // Forget this node's parent
          delete this.parentNode;

          // Send mutation events if necessary
          if (this.rooted) this.ownerDocument.mutateRemove(this);
        }),

        // Remove all of this node's children.  This is a minor
        // optimization that only calls modify() once.
        removeChildren: constant(function removeChildren() {
          var root = this.rooted ? this.ownerDocument : null;
          for(var i = 0, n = this.childNodes.length; i < n; i++) {
            delete this.childNodes[i].parentNode;
            if (root) root.mutateRemove(this.childNodes[i]);
          }
          this.childNodes.length = 0; // Forget all children
          this.modify();              // Update last modified type once only
        }),

        // Insert this node as a child of parent at the specified index,
        // firing mutation events as necessary
        insert: constant(function insert(parent, index) {
          var child = this, kids = parent.childNodes;
          // If we are already a child of the specified parent, then t
          // the index may have to be adjusted.
          if (child.parentNode === parent) {
            var currentIndex = child.index;
            // If we're not moving the node, we're done now
            // XXX: or do DOM mutation events still have to be fired?
            if (currentIndex === index) return;

            // If the child is before the spot it is to be inserted at,
            // then when it is removed, the index of that spot will be
            // reduced.
            if (currentIndex < index) index--;
          }

          // Special case for document fragments
          // XXX: it is not at all clear that I'm handling this correctly.
          // Scripts should never get to see partially
          // inserted fragments, I think.  See:
          // http://lists.w3.org/Archives/Public/www-dom/2011OctDec/0130.html
          if (child.nodeType === DOCUMENT_FRAGMENT_NODE) {
            var  c;
            while(c = child.firstChild)
              c.insert(parent, index++);
            return;
          }

          // If both the child and the parent are rooted, then we want to
          // transplant the child without uprooting and rerooting it.
          if (child.rooted && parent.rooted) {
            // Remove the child from its current position in the tree
            // without calling remove(), since we don't want to uproot it.
            var curpar = child.parentNode, curidx = child.index;
            splice(child.parentNode.childNodes, child.index, 1);
            curpar.modify();

            // And insert it as a child of its new parent
            child.parentNode = parent;
            splice(kids, index, 0, child);
            child._index = index;              // Optimization
            parent.modify();

            // Generate a move mutation event
            parent.ownerDocument.mutateMove(child);
          }
          else {
            // If the child already has a parent, it needs to be
            // removed from that parent, which may also uproot it
            if (child.parentNode) child.remove();

            // Now insert the child into the parent's array of children
            child.parentNode = parent;
            splice(kids, index, 0, child);
            parent.modify();
            child._index = index;              // Optimization

            // And root the child if necessary
            if (parent.rooted) parent.ownerDocument.mutateInsert(child);
          }

          // Script tags use this hook
          if (parent._addchildhook) parent._addchildhook(this);
        }),


        // Return the lastModTime value for this node. (For use as a
        // cache invalidation mechanism. If the node does not already
        // have one, initialize it from the owner document's modclock
        // property.  (Note that modclock does not return the actual
        // time; it is simply a counter incremented on each document
        // modification)
        lastModTime: attribute(function() {
          if (!this._lastModTime) {
            this._lastModTime = this.doc.modclock;
          }

          return this._lastModTime;
        }),

        // Increment the owner document's modclock and use the new
        // value to update the lastModTime value for this node and
        // all of its ancestors.  Nodes that have never had their
        // lastModTime value queried do not need to have a
        // lastModTime property set on them since there is no
        // previously queried value to ever compare the new value
        // against, so only update nodes that already have a
        // _lastModTime property.
        modify: constant(function() {
          var time = ++this.doc.modclock;
          for(var n = this; n; n = n.parentElement) {
            if (n._lastModTime) {
              n._lastModTime = time;
            }
          }
        }),

        // This attribute is not part of the DOM but is quite helpful.
        // It returns the document with which a node is associated.  Usually
        // this is the ownerDocument. But ownerDocument is null for the
        // document object itself, so this is a handy way to get the document
        // regardless of the node type
        doc: attribute(function() {
          return this.ownerDocument || this;
        }),


        // If the node has a nid (node id), then it is rooted in a document
        rooted: attribute(function() {
          return !!this._nid;
        }),


        // Convert the children of a node to an HTML string.
        // This is used by the innerHTML getter
        // The serialization spec is at:
        // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-end.html#serializing-html-fragments
        serialize: constant(function() {
          var s = "";
          for(var i = 0, n = this.childNodes.length; i < n; i++) {
            var kid = this.childNodes[i];
            //FIXME: this works for now. but returning a faceted value from the serialize function feels like a hack
            if (kid in facetedValueMap) {
              return facetedValueMap[kid];
            }
            switch(kid.nodeType) {
              case COMMENT_NODE:
                s += "<!--" + kid.data + "-->";
                break;
              case PROCESSING_INSTRUCTION_NODE:
                s += "<?" + kid.target + " " + kid.data + ">";
                break;
              case DOCUMENT_TYPE_NODE:
                s += "<!DOCTYPE " + kid.name + ">";
                break;
              case TEXT_NODE:
              case CDATA_SECTION_NODE:
                var parenttag;
                if (this.nodeType === ELEMENT_NODE &&
                  this.namespaceURI === HTML_NAMESPACE)
                  parenttag = this.tagName;
                else
                  parenttag = "";
                switch(parenttag) {
                  case "STYLE":
                  case "SCRIPT":
                  case "XMP":
                  case "IFRAME":
                  case "NOEMBED":
                  case "NOFRAMES":
                  case "PLAINTEXT":
                  case "NOSCRIPT":
                    s += kid.data;
                    break;
                  default:
                    s += escape(kid.data);
                    break;
                }
                break;
              case ELEMENT_NODE:
                serializeElement(kid);
                break;
              default:
                InvalidStateError();
            }
          }

          return s;

          function serializeElement(kid) {
            var html = false, tagname;
            switch(kid.namespaceURI) {
              case HTML_NAMESPACE:
                html = true;
              /* fallthrough */
              case SVG_NAMESPACE:
              case MATHML_NAMESPACE:
                tagname = kid.localName;
                break;
              default:
                tagname = kid.tagName;
            }

            s += '<' + tagname;

            for(var i = 0, n = kid._numattrs; i < n; i++) {
              var a = kid._attr(i);
              s += ' ' + attrname(a) + '="' + escapeAttr(a.value) + '"';
            }
            s += '>';

            var htmltag = html?tagname:"";
            switch(htmltag) {

              case "area":
              case "base":
              case "basefont":
              case "bgsound":
              case "br":
              case "col":
              case "command":
              case "embed":
              case "frame":
              case "hr":
              case "img":
              case "input":
              case "keygen":
              case "link":
              case "meta":
              case "param":
              case "source":
              case "track":
              case "wbr":
                return;  // These can't have kids, so we're done

              case 'pre':
              case 'textarea':
              case 'listing':
                s += "\n"; // Extra newline for these
              /* fallthrough */
              default:
                // Serialize children and add end tag for all others
                s += kid.serialize();
                s += "</" + tagname + ">";
            }
          }

          function escape(s) {
            return s.replace(/[&<>\u00A0]/g, function(c) {
              switch(c) {
                case "&": return "&amp;";
                case "<": return "&lt;";
                case ">": return "&gt;";
                case "\u00A0": return "&nbsp;";
              }
            });
          }

          function escapeAttr(s) {
            return s.replace(/[&"\u00A0]/g, function(c) {
              switch(c) {
                case '&': return "&amp;";
                case '"': return "&quot;";
                case '\u00A0': return "&nbsp;";
              }
            });
          }

          function attrname(a) {
            switch(a.namespaceURI) {
              case null: return a.localName;
              case XML_NAMESPACE: return "xml:" + a.localName;
              case XLINK_NAMESPACE: return "xlink:" + a.localName;
              case XMLNS_NAMESPACE:
                if (a.localName === "xmlns") return "xmlns";
                else return "xmlns:" + a.localName;
              default:
                return a.name;
            }
          }
        }),

      });

      return Node;
    });


    /************************************************************************
     *  src/impl/Leaf.js
     ************************************************************************/

//@line 1 "src/impl/Leaf.js"
    defineLazyProperty(impl, "Leaf", function() {
      // This class defines common functionality for node subtypes that
      // can never have children
      function Leaf() {}

      Leaf.prototype = O.create(impl.Node.prototype, {
        hasChildNodes: constant(function() { return false; }),
        firstChild: constant(null),
        lastChild: constant(null),
        insertBefore: constant(HierarchyRequestError),
        replaceChild: constant(HierarchyRequestError),
        removeChild: constant(HierarchyRequestError),
        appendChild: constant(HierarchyRequestError),

        // Each node must have its own unique childNodes array.  But
        // leaves always have an empty array, so initialize it lazily.
        // If the childNodes property is read, we'll return an array
        // and define a read-only property directly on the object that
        // will shadow this one. I'd like to freeze the array, too, since
        // leaf nodes can never have children, but I'll end up having to add
        // a property to refer back to the IDL NodeList wrapper.
        childNodes: attribute(function() {
          var a = [];
          a._idlName = "NodeList";
          O.defineProperty(this, "childNodes", constant(a));
          return a;
        }),
      });

      return Leaf;
    });


    /************************************************************************
     *  src/impl/CharacterData.js
     ************************************************************************/

//@line 1 "src/impl/CharacterData.js"
    defineLazyProperty(impl, "CharacterData", function() {
      function CharacterData() {
      }

      CharacterData.prototype = O.create(impl.Leaf.prototype, {
        _idlName: constant("CharacterData"),

        // DOMString substringData(unsigned long offset,
        //                         unsigned long count);
        // The substringData(offset, count) method must run these steps:
        //
        //     If offset is greater than the context object's
        //     length, throw an INDEX_SIZE_ERR exception and
        //     terminate these steps.
        //
        //     If offset+count is greater than the context
        //     object's length, return a DOMString whose value is
        //     the UTF-16 code units from the offsetth UTF-16 code
        //     unit to the end of data.
        //
        //     Return a DOMString whose value is the UTF-16 code
        //     units from the offsetth UTF-16 code unit to the
        //     offset+countth UTF-16 code unit in data.
        substringData: constant(function substringData(offset, count) {
          if (offset > this.data.length) IndexSizeError();
          return substring(this.data, offset, offset+count);
        }),

        // void appendData(DOMString data);
        // The appendData(data) method must append data to the context
        // object's data.
        appendData: constant(function appendData(data) {
          this.data = this.data + data;
        }),

        // void insertData(unsigned long offset, DOMString data);
        // The insertData(offset, data) method must run these steps:
        //
        //     If offset is greater than the context object's
        //     length, throw an INDEX_SIZE_ERR exception and
        //     terminate these steps.
        //
        //     Insert data into the context object's data after
        //     offset UTF-16 code units.
        //
        insertData: constant(function insertData(offset, data) {
          var curtext = this.data;
          if (offset > curtext.length) IndexSizeError();
          var prefix = substring(curtext, 0, offset),
            suffix = substring(curtext, offset);
          this.data = prefix + data + suffix;
        }),


        // void deleteData(unsigned long offset, unsigned long count);
        // The deleteData(offset, count) method must run these steps:
        //
        //     If offset is greater than the context object's
        //     length, throw an INDEX_SIZE_ERR exception and
        //     terminate these steps.
        //
        //     If offset+count is greater than the context
        //     object's length var count be length-offset.
        //
        //     Starting from offset UTF-16 code units remove count
        //     UTF-16 code units from the context object's data.
        deleteData: constant(function deleteData(offset, count) {
          var curtext = this.data, len = curtext.length;

          if (offset > len) IndexSizeError();

          if (offset+count > len)
            count = len - offset;

          var prefix = substring(curtext, 0, offset),
            suffix = substring(curtext, offset+count);

          this.data = prefix + suffix;
        }),


        // void replaceData(unsigned long offset, unsigned long count,
        //                  DOMString data);
        //
        // The replaceData(offset, count, data) method must act as
        // if the deleteData() method is invoked with offset and
        // count as arguments followed by the insertData() method
        // with offset and data as arguments and re-throw any
        // exceptions these methods might have thrown.
        replaceData: constant(function replaceData(offset, count, data) {
          var curtext = this.data, len = curtext.length;

          if (offset > len) IndexSizeError();

          if (offset+count > len)
            count = len - offset;

          var prefix = substring(curtext, 0, offset),
            suffix = substring(curtext, offset+count);

          this.data = prefix + data + suffix;
        }),

        // Utility method that Node.isEqualNode() calls to test Text and
        // Comment nodes for equality.  It is okay to put it here, since
        // Node will have already verified that nodeType is equal
        isEqual: constant(function isEqual(n) {
          return this._data === n._data;
        }),

      });

      return CharacterData;
    });


    /************************************************************************
     *  src/impl/Text.js
     ************************************************************************/

//@line 1 "src/impl/Text.js"
    defineLazyProperty(impl, "Text", function() {
      function Text(doc, data) {
        this.nodeType = TEXT_NODE;
        this.ownerDocument = doc;
        this._data = data;
      }

      var nodeValue = attribute(function() { return this._data; },
        function(v) {
          if (v === this._data) return;
          this._data = v;
          if (this.rooted)
            this.ownerDocument.mutateValue(this);
          if (this.parentNode &&
            this.parentNode._textchangehook)
            this.parentNode._textchangehook(this);
        });

      Text.prototype = O.create(impl.CharacterData.prototype, {
        _idlName: constant("Text"),
//        nodeType: constant(TEXT_NODE),
        nodeName: constant("#text"),
        // These three attributes are all the same.
        // The data attribute has a [TreatNullAs=EmptyString] but we'll
        // implement that at the interface level
        nodeValue: nodeValue,
        textContent: nodeValue,
        data: nodeValue,
        length: attribute(function() { return this._data.length; }),

        splitText: constant(function splitText(offset) {
          if (offset > this._data.length) IndexSizeError();

          var newdata = substring(this._data, offset),
            newnode = this.ownerDocument.createTextNode(newdata);
          this.data = substring(this.data, 0, offset);

          var parent = this.parentNode;
          if (parent !== null)
            parent.insertBefore(newnode, this.nextSibling);

          return newnode;
        }),

        // XXX
        // wholeText and replaceWholeText() are not implemented yet because
        // the DOMCore specification is considering removing or altering them.
        wholeText: attribute(nyi),
        replaceWholeText: constant(nyi),

        // Utility methods
        clone: constant(function clone() {
          return new impl.Text(this.ownerDocument, this._data);
        }),

      });

      return Text;
    });


    /************************************************************************
     *  src/impl/Comment.js
     ************************************************************************/

//@line 1 "src/impl/Comment.js"
    defineLazyProperty(impl, "Comment", function() {
      function Comment(doc, data) {
        this.nodeType = COMMENT_NODE;
        this.ownerDocument = doc;
        this._data = data;
      }

      var nodeValue = attribute(function() { return this._data; },
        function(v) {
          this._data = v;
          if (this.rooted)
            this.ownerDocument.mutateValue(this);
        });

      Comment.prototype = O.create(impl.CharacterData.prototype, {
        _idlName: constant("Comment"),
//        nodeType: constant(COMMENT_NODE),
        nodeName: constant("#comment"),
        nodeValue: nodeValue,
        textContent: nodeValue,
        data: nodeValue,
        length: attribute(function() { return this._data.length; }),

        // Utility methods
        clone: constant(function clone() {
          return new impl.Comment(this.ownerDocument, this._data);
        }),
      });

      return Comment;
    });


    /************************************************************************
     *  src/impl/ProcessingInstruction.js
     ************************************************************************/

//@line 1 "src/impl/ProcessingInstruction.js"
    defineLazyProperty(impl, "ProcessingInstruction", function() {

      function ProcessingInstruction(doc, target, data) {
        this.nodeType = PROCESSING_INSTRUCTION_NODE;
        this.ownerDocument = doc;
        this.target = target;
        this._data = data;
      }

      var nodeValue = attribute(function() { return this._data; },
        function(v) {
          this._data = v;
          if (this.rooted)
            this.ownerDocument.mutateValue(this);
        });

      ProcessingInstruction.prototype = O.create(impl.Leaf.prototype, {
        _idlName: constant("ProcessingInstruction"),
//        nodeType: constant(PROCESSING_INSTRUCTION_NODE),
        nodeName: attribute(function() { return this.target; }),
        nodeValue: nodeValue,
        textContent: nodeValue,
        data: nodeValue,

        // Utility methods
        clone: constant(function clone() {
          return new impl.ProcessingInstruction(this.ownerDocument,
            this.target, this._data);
        }),
        isEqual: constant(function isEqual(n) {
          return this.target === n.target && this._data === n._data;
        }),

      });

      return ProcessingInstruction;
    });


    /************************************************************************
     *  src/impl/Element.js
     ************************************************************************/

//@line 1 "src/impl/Element.js"
    defineLazyProperty(impl, "Element", function() {
      function Element(doc, localName, namespaceURI, prefix) {
        this.nodeType = ELEMENT_NODE;
        this.ownerDocument = doc;
        this.localName = localName;
        this.namespaceURI = namespaceURI;
        this.prefix = prefix;

        this.tagName = (prefix !== null)
          ? prefix + ":" + localName
          : localName;

        if (this.isHTML)
          this.tagName = toUpperCase(this.tagName);

        this.childNodes = [];
        this.childNodes._idlName = "NodeList";

        // These properties maintain the set of attributes
        this._attrsByQName = Object.create(null);  // The qname->Attr map
        this._attrsByLName = Object.create(null);  // The ns|lname->Attr map
        this._attrKeys = [];                       // attr index -> ns|lname
      }

      function recursiveGetText(node, a) {
        if (node.nodeType === TEXT_NODE) {
          a.push(node._data);
        }
        else {
          for(var i = 0, n = node.childNodes.length;  i < n; i++)
            recursiveGetText(node.childNodes[i], a);
        }
      }

      function textContentGetter() {
        var strings = [];
        recursiveGetText(this, strings);
        return strings.join("");
      }

      function textContentSetter(newtext) {
        this.removeChildren();
        if (newtext !== null && newtext !== "") {
          this.appendChild(this.ownerDocument.createTextNode(newtext));
        }
      }

      Element.prototype = O.create(impl.Node.prototype, {
        _idlName: constant("Element"),
//        nodeType: constant(ELEMENT_NODE),
        nodeName: attribute(function() { return this.tagName; }),
        nodeValue: attribute(fnull, fnoop),
        textContent: attribute(textContentGetter, textContentSetter),

        children: attribute(function() {
          if (!this._children) {
            this._children = new ChildrenCollection(this);
          }
          return this._children;
        }),

        attributes: attribute(function() {
          if (!this._attributes) {
            this._attributes = new AttributesArray(this);
          }
          return this._attributes;
        }),


        firstElementChild: attribute(function() {
          var kids = this.childNodes;
          for(var i = 0, n = kids.length; i < n; i++) {
            if (kids[i].nodeType === ELEMENT_NODE) return kids[i];
          }
          return null;
        }),

        lastElementChild: attribute(function() {
          var kids = this.childNodes;
          for(var i = kids.length-1; i >= 0; i--) {
            if (kids[i].nodeType === ELEMENT_NODE) return kids[i];
          }
          return null;
        }),

        nextElementSibling: attribute(function() {
          if (this.parentNode) {
            var sibs = this.parentNode.childNodes;
            for(var i = this.index+1, n = sibs.length; i < n; i++) {
              if (sibs[i].nodeType === ELEMENT_NODE) return sibs[i];
            }
          }
          return null;
        }),

        previousElementSibling: attribute(function() {
          if (this.parentNode) {
            var sibs = this.parentNode.childNodes;
            for(var i = this.index-1; i >= 0; i--) {
              if (sibs[i].nodeType === ELEMENT_NODE) return sibs[i];
            }
          }
          return null;
        }),

        childElementCount: attribute(function() {
          return this.children.length;
        }),


        // Return the next element, in source order, after this one or
        // null if there are no more.  If root element is specified,
        // then don't traverse beyond its subtree.
        //
        // This is not a DOM method, but is convenient for
        // lazy traversals of the tree.
        nextElement: constant(function(root) {
          var next = this.firstElementChild || this.nextElementSibling;
          if (next) return next;

          if (!root) root = this.ownerDocument.documentElement;

          // If we can't go down or across, then we have to go up
          // and across to the parent sibling or another ancestor's
          // sibling.  Be careful, though: if we reach the root
          // element, or if we reach the documentElement, then
          // the traversal ends.
          for(var parent = this.parentElement;
              parent && parent !== root;
              parent = parent.parentElement) {

            next = parent.nextElementSibling;
            if (next) return next;
          }

          return null;
        }),

        // Just copy this method from the Document prototype
        getElementsByTagName:
          constant(impl.Document.prototype.getElementsByTagName),

        getElementsByTagNameNS:
          constant(impl.Document.prototype.getElementsByTagNameNS),

        getElementsByClassName:
          constant(impl.Document.prototype.getElementsByClassName),


        // Utility methods used by the public API methods above

        isHTML: attribute(function() {
          return this.namespaceURI === HTML_NAMESPACE &&
            this.ownerDocument.isHTML;
        }),

        clone: constant(function clone() {
          var e;

          // XXX:
          // Modify this to use the constructor directly or
          // avoid error checking in some other way. In case we try
          // to clone an invalid node that the parser inserted.
          //
          if (this.namespaceURI !== HTML_NAMESPACE || this.prefix)
            e = this.ownerDocument.createElementNS(this.namespaceURI,
              this.tagName);
          else
            e = this.ownerDocument.createElement(this.localName);

          for(var i = 0, n = this._numattrs; i < n; i++) {
            var a = this._attr(i);
            // Use _ version of the function to avoid error checking
            // in case we're cloning an attribute that is invalid but
            // was inserted by the parser.
            e._setAttributeNS(a.namespaceURI, a.name, a.value);
          }

          return e;
        }),

        isEqual: constant(function isEqual(that) {
          if (this.localName !== that.localName ||
            this.namespaceURI !== that.namespaceURI ||
            this.prefix !== that.prefix ||
            this._numattrs !== that._numattrs)
            return false;

          // Compare the sets of attributes, ignoring order
          // and ignoring attribute prefixes.
          for(var i = 0, n = this._numattrs; i < n; i++) {
            var a = this._attr(i);
            if (!that.hasAttributeNS(a.namespaceURI, a.localName))
              return false;
            if (that.getAttributeNS(a.namespaceURI,a.localName) !== a.value)
              return false;
          }

          return true;
        }),

        // This is the "locate a namespace prefix" algorithm from the
        // DOMCore specification.  It is used by Node.lookupPrefix()
        locateNamespacePrefix: constant(function locateNamespacePrefix(ns) {
          if (this.namespaceURI === ns && this.prefix !== null)
            return this.prefix;

          for(var i = 0, n = this._numattrs; i < n; i++) {
            var a = this._attr(i);
            if (a.prefix === "xmlns" && a.value === ns)
              return a.localName;
          }

          var parent = this.parentElement;
          return parent ? parent.locateNamespacePrefix(ns) : null;
        }),

        // This is the "locate a namespace" algorithm for Element nodes
        // from the DOM Core spec.  It is used by Node.lookupNamespaceURI
        locateNamespace: constant(function locateNamespace(prefix) {
          if (this.prefix === prefix && this.namespaceURI !== null)
            return this.namespaceURI;

          for(var i = 0, n = this._numattrs; i < n; i++) {
            var a = this._attr(i);
            if ((a.prefix === "xmlns" && a.localName === prefix) ||
              (a.prefix === null && a.localName === "xmlns")) {
              return a.value || null;
            }
          }

          var parent = this.parentElement;
          return parent ? parent.locateNamespace(prefix) : null;
        }),

        //
        // Attribute handling methods and utilities
        //

        /*
         * Attributes in the DOM are tricky:
         *
         * - there are the 8 basic get/set/has/removeAttribute{NS} methods
         *
         * - but many HTML attributes are also "reflected" through IDL
         *   attributes which means that they can be queried and set through
         *   regular properties of the element.  There is just one attribute
         *   value, but two ways to get and set it.
         *
         * - Different HTML element types have different sets of reflected
         attributes.
         *
         * - attributes can also be queried and set through the .attributes
         *   property of an element.  This property behaves like an array of
         *   Attr objects.  The value property of each Attr is writeable, so
         *   this is a third way to read and write attributes.
         *
         * - for efficiency, we really want to store attributes in some kind
         *   of name->attr map.  But the attributes[] array is an array, not a
         *   map, which is kind of unnatural.
         *
         * - When using namespaces and prefixes, and mixing the NS methods
         *   with the non-NS methods, it is apparently actually possible for
         *   an attributes[] array to have more than one attribute with the
         *   same qualified name.  And certain methods must operate on only
         *   the first attribute with such a name.  So for these methods, an
         *   inefficient array-like data structure would be easier to
         *   implement.
         *
         * - The attributes[] array is live, not a snapshot, so changes to the
         *   attributes must be immediately visible through existing arrays.
         *
         * - When attributes are queried and set through IDL properties
         *   (instead of the get/setAttributes() method or the attributes[]
         *   array) they may be subject to type conversions, URL
         *   normalization, etc., so some extra processing is required in that
         *   case.
         *
         * - But access through IDL properties is probably the most common
         *   case, so we'd like that to be as fast as possible.
         *
         * - We can't just store attribute values in their parsed idl form,
         *   because setAttribute() has to return whatever string is passed to
         *   getAttribute even if it is not a legal, parseable value. So
         *   attribute values must be stored in unparsed string form.
         *
         * - We need to be able to send change notifications or mutation
         *   events of some sort to the renderer whenever an attribute value
         *   changes, regardless of the way in which it changes.
         *
         * - Some attributes, such as id and class affect other parts of the
         *   DOM API, like getElementById and getElementsByClassName and so
         *   for efficiency, we need to specially track changes to these
         *   special attributes.
         *
         * - Some attributes like class have different names (className) when
         *   reflected.
         *
         * - Attributes whose names begin with the string "data-" are treated
         specially.
         *
         * - Reflected attributes that have a boolean type in IDL have special
         *   behavior: setting them to false (in IDL) is the same as removing
         *   them with removeAttribute()
         *
         * - numeric attributes (like HTMLElement.tabIndex) can have default
         *   values that must be returned by the idl getter even if the
         *   content attribute does not exist. (The default tabIndex value
         *   actually varies based on the type of the element, so that is a
         *   tricky one).
         *
         * See
         * http://www.whatwg.org/specs/web-apps/current-work/multipage/urls.html#reflect
         * for rules on how attributes are reflected.
         *
         */

        getAttribute: constant(function getAttribute(qname) {
          if (this.isHTML) qname = toLowerCase(qname);
          var attr = this._attrsByQName[qname];
          if (!attr) return null;

          if (isArray(attr))  // If there is more than one
            attr = attr[0];   // use the first
          var key = this.id + qname;
          if (key in facetedValueMap) {
            return facetedValueMap[key];
          }
          return attr.value;
        }),

        getAttributeNS: constant(function getAttributeNS(ns, lname) {
          var attr = this._attrsByLName[ns + "|" + lname];
          return attr ? attr.value : null;
        }),

        hasAttribute: constant(function hasAttribute(qname) {
          if (this.isHTML) qname = toLowerCase(qname);
          return qname in this._attrsByQName;
        }),

        hasAttributeNS: constant(function hasAttributeNS(ns, lname) {
          var key = ns + "|" + lname;
          return key in this._attrsByLName;
        }),

        // Set the attribute without error checking. The parser uses this.
        _setAttribute: constant(function _setAttribute(qname, value) {
          // XXX: the spec says that this next search should be done
          // on the local name, but I think that is an error.
          // email pending on www-dom about it.
          var attr = this._attrsByQName[qname];
          var isnew;
          if (!attr) {
            attr = this._newattr(qname);
            isnew = true;
          }
          else {
            if (isArray(attr)) attr = attr[0];
          }

          // Now set the attribute value on the new or existing Attr object.
          // The Attr.value setter method handles mutation events, etc.
          attr.value = value;

          if (isnew && this._newattrhook) this._newattrhook(qname, value);
        }),

        // Check for errors, and then set the attribute
        setAttribute: constant(function setAttribute(qname, value) {
          if (!xml.isValidName(qname)) InvalidCharacterError();
          if (this.isHTML) qname = toLowerCase(qname);
          if (substring(qname, 0, 5) === "xmlns") NamespaceError();
          this._setAttribute(qname, value);
        }),


        // The version with no error checking used by the parser
        _setAttributeNS: constant(function _setAttributeNS(ns, qname, value) {
          var pos = S.indexOf(qname, ":"), prefix, lname;
          if (pos === -1) {
            prefix = null;
            lname = qname;
          }
          else {
            prefix = substring(qname, 0, pos);
            lname = substring(qname, pos+1);
          }

          var key = ns + "|" + lname;
          if (ns === "") ns = null;

          var attr = this._attrsByLName[key];
          var isnew;
          if (!attr) {
            var attr = new Attr(this, lname, prefix, ns);
            isnew = true;
            this._attrsByLName[key] = attr;
            this._attrKeys = O.keys(this._attrsByLName);

            // We also have to make the attr searchable by qname.
            // But we have to be careful because there may already
            // be an attr with this qname.
            this._addQName(attr);
          }
          else {
            // Calling setAttributeNS() can change the prefix of an
            // existing attribute!
            if (attr.prefix !== prefix) {
              // Unbind the old qname
              this._removeQName(attr);
              // Update the prefix
              attr.prefix = prefix;
              // Bind the new qname
              this._addQName(attr);

            }

          }
          attr.value = value; // Automatically sends mutation event
          if (isnew && this._newattrhook) this._newattrhook(qname, value);
        }),

        // Do error checking then call _setAttributeNS
        setAttributeNS: constant(function setAttributeNS(ns, qname, value) {
          if (!xml.isValidName(qname)) InvalidCharacterError();
          if (!xml.isValidQName(qname)) NamespaceError();

          var pos = S.indexOf(qname, ":");
          var prefix = (pos === -1) ? null : substring(qname, 0, pos);
          if (ns === "") ns = null;

          if ((prefix !== null && ns === null) ||
            (prefix === "xml" && ns !== XML_NAMESPACE) ||
            ((qname === "xmlns" || prefix === "xmlns") &&
            (ns !== XMLNS_NAMESPACE)) ||
            (ns === XMLNS_NAMESPACE &&
            !(qname === "xmlns" || prefix === "xmlns")))
            NamespaceError();

          this._setAttributeNS(ns, qname, value);
        }),

        removeAttribute: constant(function removeAttribute(qname) {
          if (this.isHTML) qname = toLowerCase(qname);

          var attr = this._attrsByQName[qname];
          if (!attr) return;

          // If there is more than one match for this qname
          // so don't delete the qname mapping, just remove the first
          // element from it.
          if (isArray(attr)) {
            if (attr.length > 2) {
              attr = A.shift(attr);  // remove it from the array
            }
            else {
              this._attrsByQName[qname] = attr[1];
              attr = attr[0];
            }
          }
          else {
            // only a single match, so remove the qname mapping
            delete this._attrsByQName[qname];
          }

          // Now attr is the removed attribute.  Figure out its
          // ns+lname key and remove it from the other mapping as well.
          var key = (attr.namespaceURI || "") + "|" + attr.localName;
          delete this._attrsByLName[key];
          this._attrKeys = O.keys(this._attrsByLName);

          // Onchange handler for the attribute
          if (attr.onchange)
            attr.onchange(this, attr.localName, attr.value, null);

          // Mutation event
          if (this.rooted) this.ownerDocument.mutateRemoveAttr(attr);
        }),

        removeAttributeNS: constant(function removeAttributeNS(ns, lname) {
          var key = (ns || "") + "|" + lname;
          var attr = this._attrsByLName[key];
          if (!attr) return;

          delete this._attrsByLName[key];
          this._attrKeys = O.keys(this._attrsByLName);

          // Now find the same Attr object in the qname mapping and remove it
          // But be careful because there may be more than one match.
          this._removeQName(attr);

          // Onchange handler for the attribute
          if (attr.onchange)
            attr.onchange(this, attr.localName, attr.value, null);
          // Mutation event
          if (this.rooted) this.ownerDocument.mutateRemoveAttr(attr);
        }),

        // This "raw" version of getAttribute is used by the getter functions
        // of reflected attributes. It skips some error checking and
        // namespace steps
        _getattr: constant(function _getattr(qname) {
          // Assume that qname is already lowercased, so don't do it here.
          // Also don't check whether attr is an array: a qname with no
          // prefix will never have two matching Attr objects (because
          // setAttributeNS doesn't allow a non-null namespace with a
          // null prefix.
          var attr = this._attrsByQName[qname];
          return attr ? attr.value : null;
        }),

        // The raw version of setAttribute for reflected idl attributes.
        _setattr: constant(function _setattr(qname, value) {
          var attr = this._attrsByQName[qname];
          var isnew;
          if (!attr) {
            attr = this._newattr(qname);
            isnew = true;
          }
          attr.value = value;
          if (isnew && this._newattrhook) this._newattrhook(qname, value);
        }),

        // Create a new Attr object, insert it, and return it.
        // Used by setAttribute() and by set()
        _newattr: constant(function _newattr(qname) {
          var attr = new Attr(this, qname);
          this._attrsByQName[qname] = attr;
          this._attrsByLName["|" + qname] = attr;
          this._attrKeys = O.keys(this._attrsByLName);
          return attr;
        }),

        // Add a qname->Attr mapping to the _attrsByQName object, taking into
        // account that there may be more than one attr object with the
        // same qname
        _addQName: constant(function(attr) {
          var qname = attr.name;
          var existing = this._attrsByQName[qname];
          if (!existing) {
            this._attrsByQName[qname] = attr;
          }
          else if (isArray(existing)) {
            push(existing, attr);
          }
          else {
            this._attrsByQName[qname] = [existing, attr];
          }
        }),

        // Remove a qname->Attr mapping to the _attrsByQName object, taking into
        // account that there may be more than one attr object with the
        // same qname
        _removeQName: constant(function(attr) {
          var qname = attr.name;
          var target = this._attrsByQName[qname];

          if (isArray(target)) {
            var idx = A.indexOf(target, attr);
            assert(idx !== -1); // It must be here somewhere
            if (target.length === 2) {
              this._attrsByQName[qname] = target[1-idx];
            }
            else {
              splice(target, idx, 1)
            }
          }
          else {
            assert(target === attr);  // If only one, it must match
            delete this._attrsByQName[qname];
          }
        }),

        // Return the number of attributes
        _numattrs: attribute(function() { return this._attrKeys.length; }),
        // Return the nth Attr object
        _attr: constant(function(n) {
          return this._attrsByLName[this._attrKeys[n]];
        }),
      });

      // A utility function used by those below
      function defineAttribute(c, idlname, getter, setter) {
        // I don't think we should ever override an existing attribute
        assert(!(idlname in c.prototype), "Redeclared attribute " + idlname);
        O.defineProperty(c.prototype, idlname, { get: getter, set: setter });
      }


      // This is a utility function for setting up reflected attributes.
      // Pass an element impl class like impl.HTMLElement as the first
      // argument.  Pass the content attribute name as the second argument.
      // And pass the idl attribute name as the third, if it is different.
      Element.reflectStringAttribute = function(c, name, idlname) {
        defineAttribute(c, idlname || name,
          function() { return this._getattr(name) || ""; },
          function(v) { this._setattr(name, v); });
      };

      // Define an idl attribute that reflects an enumerated content
      // attribute.  This is for attributes that the HTML spec describes as
      // "limited to only known values".  legalvals should be an array that
      // maps the lowercased versions of allowed enumerated values to the
      // canonical value that it should convert to. Usually the name and
      // value of most properties in the object will be the same.
      Element.reflectEnumeratedAttribute = function(c, name, idlname, legalvals,
                                                    missing_default,
                                                    invalid_default)
      {
        defineAttribute(c, idlname || name,
          function() {
            var v = this._getattr(name);
            if (v === null) return missing_default || "";

            v = legalvals[v.toLowerCase()];
            if (v !== undefined)
              return v;
            if (invalid_default !== undefined)
              return invalid_default;
            if (missing_default !== undefined)
              return missing_default;
            return "";
          },
          function(v) { this._setattr(name, v); });
      };

      Element.reflectBooleanAttribute = function(c, name, idlname) {
        defineAttribute(c, idlname || name,
          function() {
            return this.hasAttribute(name);
          },
          function(v) {
            if (v) {
              this._setattr(name, "");
            }
            else {
              this.removeAttribute(name);
            }
          });
      };

      // See http://www.whatwg.org/specs/web-apps/current-work/#reflect
      //
      // defval is the default value. If it is a function, then that function
      // will be invoked as a method of the element to obtain the default.
      // If no default is specified for a given attribute, then the default
      // depends on the type of the attribute, but since this function handles
      // 4 integer cases, you must specify the default value in each call
      //
      // min and max define a valid range for getting the attribute.
      //
      // setmin defines a minimum value when setting.  If the value is less
      // than that, then throw INDEX_SIZE_ERR.
      //
      // Conveniently, JavaScript's parseInt function appears to be
      // compatible with HTML's "rules for parsing integers"
      Element.reflectIntegerAttribute = function(c, name, defval, idlname,
                                                 min, max, setmin)
      {
        var getter, setter;

        if (min != null ||
          max != null ||
          typeof defval === "function") {
          getter = function() {
            var v = this._getattr(name);
            var n = parseInt(v, 10);
            if (isNaN(n) ||
              (min != null && n < min) ||
              (max != null && n > max)) {
              switch(typeof defval) {
                case 'function': return defval.call(this);
                case 'number': return defval;
                default: assert(false);
              }
            }

            return n;
          };
        }
        else {
          getter = function() {
            var v = this._getattr(name);
            // Pleasantly, JavaScript's parseInt function
            // is compatible with HTML's "rules for parsing
            // integers"
            var n = parseInt(v, 10);
            return isNaN(n) ? defval : n;
          }
        }

        if (setmin != null) {
          setter = function(v) {
            if (v < setmin) IndexSizeError(name + " set to " + v);
            this._setattr(name, String(v));
          };
        }
        else {
          setter = function(v) {
            this._setattr(name, String(v));
          };
        }

        defineAttribute(c, idlname || name, getter, setter);
      };

      Element.reflectFloatAttribute = function(c, name, defval, idlname) {
        defineAttribute(c, idlname || name,
          function() {
            var s = this._getattr(name), x;
            if (s) x = parseFloat();
            return (x && isFinite(x)) ? x : defval;
          },
          function(v) {
            this._setattr(name, String(v));
          });
      };

      Element.reflectPositiveFloatAttribute = function(c, name, defval, idlname) {
        defineAttribute(c, idlname || name,
          function() {
            var s = this._getattr(name), x;
            if (s) x = parseFloat(s);
            return (x && isFinite(x) && x > 0) ? x : defval;
          },
          function(v) {
            if (v < 0) return; // Ignore negative values
            this._setattr(name, String(v));
          });
      };


      // This is a utility function for setting up change handler functions
      // for attributes like 'id' that require special handling when they change.
      Element.registerAttributeChangeHandler = function(c, name, handler) {
        var p = c.prototype;

        // If p does not already have its own _attributeChangeHandlers
        // then create one for it, inheriting from the inherited
        // _attributeChangeHandlers. At the top (for the impl.Element
        // class) the _attributeChangeHandlers object will be created
        // with a null prototype.
        if (!hasOwnProperty(p, "_attributeChangeHandlers")) {
          p._attributeChangeHandlers =
            Object.create(p._attributeChangeHandlers || null);
        }

        // There can only be one
        // XXX: I've commented out this assertion.  Actually, HTMLBodyElement
        // wants to override the attribute change handlers for certain
        // event handler attributes it inherits from HTMLElement...
        // assert(!(name in p._attributeChangeHandlers));

        p._attributeChangeHandlers[name] = handler;
      };



      // Register special handling for the id attribute
      Element.registerAttributeChangeHandler(Element, "id",
        function(element, lname, oldval, newval) {
          if (element.rooted) {
            if (oldval) {
              element.ownerDocument.delId(oldval, element);
            }
            if (newval) {
              element.ownerDocument.addId(newval, element);
            }
          }
        });

      // Define getters and setters for an "id" property that reflects
      // the content attribute "id".
      Element.reflectStringAttribute(Element, "id");

      // Define getters and setters for a "className" property that reflects
      // the content attribute "class".
      Element.reflectStringAttribute(Element, "class", "className");


      // The Attr class represents a single attribute.  The values in
      // _attrsByQName and _attrsByLName are instances of this class.
      function Attr(elt, lname, prefix, namespace) {
        // Always remember what element we're associated with.
        // We need this to property handle mutations
        this.ownerElement = elt;

        if (!namespace && !prefix && lname in elt._attributeChangeHandlers)
          this.onchange = elt._attributeChangeHandlers[lname];

        // localName and namespace are constant for any attr object.
        // But value may change.  And so can prefix, and so, therefore can name.
        this.localName = lname;
        this.prefix = prefix || null;
        this.namespaceURI = namespace || null;
      }

      Attr.prototype = {
        _idlName: "Attr",
        get name() {
          return this.prefix
            ? this.prefix + ":" + this.localName
            : this.localName;
        },

        get value() {
          return this.data;
        },

        set value(v) {
          if (this.data === v) return;
          var oldval = this.data;
          this.data = v;

          // Run the onchange hook for the attribute
          // if there is one.
          if (this.onchange)
            this.onchange(this.ownerElement,this.localName, oldval, v);

          // Generate a mutation event if the element is rooted
          if (this.ownerElement.rooted)
            this.ownerElement.ownerDocument.mutateAttr(
              this,
              oldval);
        }
      };


      // The attributes property of an Element will be an instance of this class.
      // This class is really just a dummy, though. It only defines a length
      // property and an item() method. The AttrArrayProxy that
      // defines the public API just uses the Element object itself.  But in
      // order to get wrapped properly, we need to return an object with the
      // right _idlName property
      function AttributesArray(elt) { this.element = elt; }
      AttributesArray.prototype = {
        _idlName: "AttrArray",
        get length() {
          return this.element._attrKeys.length;
        },
        item: function(n) {
          return this.element._attrsByLName[this.element._attrKeys[n]];
        }
      };


      // The children property of an Element will be an instance of this class.
      // It defines length, item() and namedItem() and will be wrapped by an
      // HTMLCollection when exposed through the DOM.
      function ChildrenCollection(e) {
        this.element = e;
      }

      ChildrenCollection.prototype = {
        _idlName: "HTMLCollection",
        get length() {
          this.updateCache();
          return this.childrenByNumber.length;
        },

        item: function item(n) {
          this.updateCache();
          return this.childrenByNumber[n] || null;
        },

        namedItem: function namedItem(name) {
          this.updateCache();
          return this.childrenByName[name] || null;
        },

        // This attribute returns the entire name->element map.
        // It is not part of the HTMLCollection API, but we need it in
        // src/HTMLCollectionProxy
        get namedItems() {
          this.updateCache();
          return this.childrenByName;
        },

        updateCache: function updateCache() {
          var namedElts = /^(a|applet|area|embed|form|frame|frameset|iframe|img|object)$/;
          if (this.lastModTime !== this.element.lastModTime) {
            this.lastModTime = this.element.lastModTime;
            this.childrenByNumber = [];
            this.childrenByName = {};

            for(var i = 0, n = this.element.childNodes.length; i < n; i++) {
              var c = this.element.childNodes[i];
              if (c.nodeType == ELEMENT_NODE) {
                push(this.childrenByNumber, c);

                // XXX Are there any requirements about the namespace
                // of the id property?
                var id = c.getAttribute("id");

                // If there is an id that is not already in use...
                if (id && !this.childrenByName[id])
                  this.childrenByName[id] = c;

                // For certain HTML elements we check the name attribute
                var name = c.getAttribute("name");
                if (name &&
                  this.element.namespaceURI === HTML_NAMESPACE &&
                  namedElts.test(this.element.localName) &&
                  !this.childrenByName[name])
                  this.childrenByName[id] = c;
              }
            }
          }
        }
      };

      return Element;
    });



    /************************************************************************
     *  src/impl/MutationConstants.js
     ************************************************************************/

//@line 1 "src/impl/MutationConstants.js"
// The value of a Text, Comment or PI node changed
    const MUTATE_VALUE = 1;

// A new attribute was added or an attribute value and/or prefix changed
    const MUTATE_ATTR = 2;

// An attribute was removed
    const MUTATE_REMOVE_ATTR = 3;

// A node was removed
    const MUTATE_REMOVE = 4;

// A node was moved
    const MUTATE_MOVE = 5;

// A node (or a subtree of nodes) was inserted
    const MUTATE_INSERT = 6;


    /************************************************************************
     *  src/impl/domstr.js
     ************************************************************************/

//@line 1 "src/impl/domstr.js"
// A string representation of DOM trees
    var DOMSTR = (function() {
      const NUL = "\0";

      const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
      const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
      const XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
      const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
      const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

      const substring = String.substring;
      const indexOf = String.indexOf;
      const charCodeAt = String.charCodeAt;
      const fromCharCode = String.fromCharCode;

      function serialize(n) {
        function serializeNode(n) {
          switch (n.nodeType) {
            case Node.TEXT_NODE:
              return n.data;
            case Node.COMMENT_NODE:
              return {comment: n.data};
            case Node.PROCESSING_INSTRUCTION_NODE:
              return {pi: n.target, data: n.data};
            case Node.DOCUMENT_TYPE_NODE:
              // HTML ignores the publicID and systemID when
              // serializing nodes, so ignore them here, too
              return {doctype: n.name};
            case Node.ELEMENT_NODE:
              return serializeElement(n);
            case NODE.DOCUMENT_FRAGMENT_NODE:
              return serializeFragment(n);
          }
        }

        function serializeElement(n) {
          var elt = {};
          if (n.namespaceURI === HTML_NAMESPACE && !n.prefix) {
            elt.html = n.localName;
          }
          else {
            elt.ns = serializeNamespace(n.namespaceURI);
            elt.tag = n.tagName;
          }

          // Handle the attributes
          if (n.attributes.length) {
            elt.attr = new Array(n.attributes.length);
          }
          for(var i = 0, l = n.attributes.length; i < l; i++) {
            elt.attr[i] = serializeAttr(n.attributes.item(i));
          }

          // Now the children
          if (n.childNodes.length) {
            elt.child = new Array(n.childNodes.length);
          }
          for(var i = 0, l = n.childNodes.length; i < l; i++) {
            elt.child[i] = serializeNode(n.childNodes[i]);
          }

          return elt;
        }

        var lastCustomNS = null;

        function serializeNamespace(ns) {
          switch(ns) {
            case HTML_NAMESPACE: return "h";
            case null: return "u";
            case XML_NAMESPACE: return "x";
            case XMLNS_NAMESPACE: return "n";
            case MATHML_NAMESPACE: return "m";
            case SVG_NAMESPACE: return "s";
            default:
              if (ns === lastCustomNS) return "l"
              else {
                lastCustomNS = ns;
                return "c" + ns;
              }
          }
        }

        function serializeAttr(a) {
          if (a.namespaceURI === null && a.prefix === null) {
            // set with setAttribute()
            return {a: a.name, v: a.value};
          }
          else {
            // set with setAttributeNS()
            return {ns: serializeNamespace(a.namespaceURI),
              a: a.name, v: a.value};
          }
        }

        function serializeLength(n) {
          if (n < 0) throw new Error("negative length");
          if (n <= 0xD7FF) return fromCharCode(n);
          else return fromCharCode("0xFFFF") + String(n) + NUL;
        }

        function serializeFragment(n) {
          var frag = {frag: new Array(n.childNodes.length)};
          for(var i = 0, l = n.childNodes.length; i < l; i++) {
            frag[i] = serializeNode(n.childNodes[i]);
          }
          return frag;
        }

        return serializeNode(n);
      }


      function parse(node, d) {
        if (!d) d = document;

        function parseNode(n) {
          if (typeof n === "string") {
            return d.createTextNode(n);
          }
          if (n.comment !== undefined) {
            return d.createComment(n.comment);
          }
          if (n.pi !== undefined) {
            return d.createProcessingInstruction(n.pi, n.data);
          }
          if (n.doctype !== undefined) {
            return d.implementation.createDocumentType(n.doctype, "", "");
          }
          if (n.html !== undefined) {
            return parseElement("H", n);
          }
          if (n.ns !== undefined) {
            return parseElement("E", n);
          }
          if (n.frag !== undefined) {
            return parseFragment(n);
          }
        }

        function parseElement(type, n) {
          var e;
          if (type === "H")
            e = d.createElement(n.html);
          else
            e = d.createElementNS(parseNamespace(n.ns), n.tag);

          var numattrs = 0;
          if (n.attr !== undefined) {
            numattrs = n.attr.length;
          }
          for(var i = 0; i < numattrs; i++) {
            var attr = n.attr[i];
            if (attr.a !== undefined)
              e.setAttribute(attr.a, attr.v);
            else
              e.setAttributeNS(attr.ns, attr.a, attr.v);
          }

          var numkids = 0;
          if (n.child !== undefined) {
            numkids = n.child.length;
          }
          for(var i = 0; i < numkids; i++) {
            e.appendChild(parseNode(n.child[i]));
          }

          return e;
        }


        var lastCustomNS = null;

        function parseNamespace(n) {
          switch(n[0]) {
            case 'h': return HTML_NAMESPACE;
            case 'u': return null;
            case 'x': return XML_NAMESPACE;
            case 'n': return XMLNS_NAMESPACE;
            case 'm': return MATHML_NAMESPACE;
            case 's': return SVG_NAMESPACE;
            case 'l': return lastCustomNS;
            case 'c':
              return n.slice(1);
          }
        }

        function parseFragment(n) {
          var f = d.createDocumentFragment();
          var len = n.frag.length;
          for(var i = 0; i < len; i++)
            f.appendChild(parseNode(n.frag[i]));
          return f;
        }

        return parseNode(node);
      }

      return { serialize: serialize, parse: parse };
    }());



    /************************************************************************
     *  src/impl/Document.js
     ************************************************************************/

//@line 1 "src/impl/Document.js"
    defineLazyProperty(impl, "Document", function() {

      function Document(isHTML, address) {
        this.nodeType = DOCUMENT_NODE;
        this.isHTML = isHTML;
        this._address = address || "about:blank";
        this.implementation = new impl.DOMImplementation();

        // DOMCore says that documents are always associated with themselves.
        this.ownerDocument = this;

        // These will be initialized by our custom versions of
        // appendChild and insertBefore that override the inherited
        // Node methods.
        // XXX: override those methods!
        this.doctype = null;
        this.documentElement = null;
        this.childNodes = [];
        this.childNodes._idlName = "NodeList";

        // Documents are always rooted, by definition
        this._nid = 1;
        this._nextnid = 2; // For numbering children of the document
        this._nodes = [null, this];  // nid to node map

        // This maintains the mapping from element ids to element nodes.
        // We may need to update this mapping every time a node is rooted
        // or uprooted, and any time an attribute is added, removed or changed
        // on a rooted element.
        this.byId = O.create(null); // inherit nothing

        // This property holds a monotonically increasing value akin to
        // a timestamp used to record the last modification time of nodes
        // and their subtrees. See the lastModTime attribute and modify()
        // method of the Node class.  And see FilteredElementList for an example
        // of the use of lastModTime
        this.modclock = 0;
      }

      // Map from lowercase event category names (used as arguments to
      // createEvent()) to the property name in the impl object of the
      // event constructor.
      var supportedEvents = {
        event: "Event",
        customevent: "CustomEvent",
        uievent: "UIEvent",
        mouseevent: "MouseEvent"
      };

      // Certain arguments to document.createEvent() must be treated specially
      var replacementEvent = {
        htmlevents: "event",
        mouseevents: "mouseevent",
        mutationevents: "mutationevent",
        uievents: "uievent"
      };

      Document.prototype = O.create(impl.Node.prototype, {
        _idlName: constant("Document"),


        // This method allows dom.js to communicate with a renderer
        // that displays the document in some way
        // XXX: I should probably move this to the window object
        _setMutationHandler: constant(function(handler) {
          this.mutationHandler = handler;
        }),

        // This method allows dom.js to receive event notifications
        // from the renderer.
        // XXX: I should probably move this to the window object
        _dispatchRendererEvent: constant(function(targetNid, type, details) {
          var target = this._nodes[targetNid];
          if (!target) return;
          target._dispatchEvent(new impl.Event(type, details), true);
        }),

//        nodeType: constant(DOCUMENT_NODE),
        nodeName: constant("#document"),
        nodeValue: attribute(fnull, fnoop),

        // XXX: DOMCore may remove documentURI, so it is NYI for now
        documentURI: attribute(nyi, nyi),
        compatMode: attribute(function() {
          // The _quirks property is set by the HTML parser
          return this._quirks ? "BackCompat" : "CSS1Compat";
        }),
        parentNode: constant(null),

        createTextNode: constant(function(data) {
          return new impl.Text(this, data);
        }),
        createComment: constant(function(data) {
          return new impl.Comment(this, data);
        }),
        createDocumentFragment: constant(function() {
          return new impl.DocumentFragment(this);
        }),
        createProcessingInstruction: constant(function(target, data) {
          if (this.isHTML) NotSupportedError();
          if (!xml.isValidName(target) || S.indexOf(data, "?>") !== -1)
            InvalidCharacterError();
          return new impl.ProcessingInstruction(this, target, data);
        }),

        createElement: constant(function(localName) {
          if (!xml.isValidName(localName)) InvalidCharacterError();

          if (this.isHTML)
            localName = toLowerCase(localName);

          var interfaceName = tagNameToInterfaceName[localName] ||
            "HTMLUnknownElement";
          return new impl[interfaceName](this, localName, null);
        }),

        createElementNS: constant(function(namespace, qualifiedName) {
          if (!xml.isValidName(qualifiedName)) InvalidCharacterError();
          if (!xml.isValidQName(qualifiedName)) NamespaceError();

          var pos, prefix, localName;
          if ((pos = S.indexOf(qualifiedName, ":")) !== -1) {
            prefix = substring(qualifiedName, 0, pos);
            localName = substring(qualifiedName, pos+1);

            if (namespace === "" ||
              (prefix === "xml" && namespace !== XML_NAMESPACE))
              NamespaceError();
          }
          else {
            prefix = null;
            localName = qualifiedName;
          }

          if (((qualifiedName === "xmlns" || prefix === "xmlns") &&
            namespace !== XMLNS_NAMESPACE) ||
            (namespace === XMLNS_NAMESPACE &&
            qualifiedName !== "xmlns" &&
            prefix !== "xmlns"))
            NamespaceError();

          if (namespace === HTML_NAMESPACE) {
            var interfaceName = tagNameToInterfaceName[localName] ||
              "HTMLUnknownElement";
            return new impl[interfaceName](this, localName, prefix);
          }

          return new impl.Element(this, localName, namespace, prefix);
        }),

        createEvent: constant(function createEvent(interfaceName) {
          interfaceName = toLowerCase(interfaceName);
          var name = replacementEvent[interfaceName] || interfaceName;
          var constructor = impl[supportedEvents[name]];

          if (constructor) {
            var e = new constructor();
            e._initialized = false;
            return e;
          }
          else {
            NotSupportedError();
          }
        }),


        // Add some (surprisingly complex) document hierarchy validity
        // checks when adding, removing and replacing nodes into a
        // document object, and also maintain the documentElement and
        // doctype properties of the document.  Each of the following
        // 4 methods chains to the Node implementation of the method
        // to do the actual inserting, removal or replacement.

        appendChild: constant(function(child) {
          if (child.nodeType === TEXT_NODE) HierarchyRequestError();
          if (child.nodeType === ELEMENT_NODE) {
            if (this.documentElement) // We already have a root element
              HierarchyRequestError();

            this.documentElement = child;
          }
          if (child.nodeType === DOCUMENT_TYPE_NODE) {
            if (this.doctype ||        // Already have one
              this.documentElement)   // Or out-of-order
              HierarchyRequestError()

            this.doctype = child;
          }

          // Now chain to our superclass
          return call(impl.Node.prototype.appendChild, this, child);
        }),

        insertBefore: constant(function insertBefore(child, refChild) {
          if (refChild === null) return call(impl.Document.prototype.appendChild, this, child);
          if (refChild.parentNode !== this) NotFoundError();
          if (child.nodeType === TEXT_NODE) HierarchyRequestError();
          if (child.nodeType === ELEMENT_NODE) {
            // If we already have a root element or if we're trying to
            // insert it before the doctype
            if (this.documentElement ||
              (this.doctype && this.doctype.index >= refChild.index))
              HierarchyRequestError();

            this.documentElement = child;
          }
          if (child.nodeType === DOCUMENT_TYPE_NODE) {
            if (this.doctype ||
              (this.documentElement &&
              refChild.index > this.documentElement.index))
              HierarchyRequestError()

            this.doctype = child;
          }
          return call(impl.Node.prototype.insertBefore,this, child, refChild);
        }),

        replaceChild: constant(function replaceChild(child, oldChild) {
          if (oldChild.parentNode !== this) NotFoundError();

          if (child.nodeType === TEXT_NODE) HierarchyRequestError();
          if (child.nodeType === ELEMENT_NODE) {
            // If we already have a root element and we're not replacing it
            if (this.documentElement && this.documentElement !== oldChild)
              HierarchyRequestError();
            // Or if we're trying to put the element before the doctype
            // (replacing the doctype is okay)
            if (this.doctype && oldChild.index < this.doctype.index)
              HierarchyRequestError();

            if (oldChild === this.doctype) this.doctype = null;
          }
          else if (child.nodeType === DOCUMENT_TYPE_NODE) {
            // If we already have a doctype and we're not replacing it
            if (this.doctype && oldChild !== this.doctype)
              HierarchyRequestError();
            // If we have a document element and the old child
            // comes after it
            if (this.documentElement &&
              oldChild.index > this.documentElement.index)
              HierarchyRequestError();

            if (oldChild === this.documentElement)
              this.documentElement = null;
          }
          else {
            if (oldChild === this.documentElement)
              this.documentElement = null;
            else if (oldChild === this.doctype)
              this.doctype = null;
          }
          return call(impl.Node.prototype.replaceChild, this,child,oldChild);
        }),

        removeChild: constant(function removeChild(child) {
          if (child.nodeType === DOCUMENT_TYPE_NODE)
            this.doctype = null;
          else if (child.nodeType === ELEMENT_NODE)
            this.documentElement = null;

          // Now chain to our superclass
          return call(impl.Node.prototype.removeChild, this, child);
        }),

        getElementById: constant(function(id) {
          var n = this.byId[id];
          if (!n) return null;
          if (isArray(n)) { // there was more than one element with this id
            return n[0];  // array is sorted in document order
          }
          return n;
        }),


        // XXX:
        // Tests are currently failing for this function.
        // Awaiting resolution of:
        // http://lists.w3.org/Archives/Public/www-dom/2011JulSep/0016.html
        getElementsByTagName: constant(function getElementsByTagName(lname) {
          var filter;
          if (lname === "*")
            filter = ftrue;
          else if (this.doc.isHTML)
            filter = htmlLocalNameElementFilter(lname);
          else
            filter = localNameElementFilter(lname);

          return new impl.FilteredElementList(this, filter);
        }),

        getElementsByTagNameNS: constant(function getElementsByTagNameNS(ns,
                                                                         lname){
          var filter;
          if (ns === "*" && lname === "*")
            filter = ftrue;
          else if (ns === "*")
            filter = localNameElementFilter(lname);
          else if (lname === "*")
            filter = namespaceElementFilter(ns);
          else
            filter = namespaceLocalNameElementFilter(ns, lname);

          return new impl.FilteredElementList(this, filter);
        }),

        getElementsByClassName: constant(function getElementsByClassName(names){
          names = names.trim();
          if (names === "") {
            var result = []; // Empty node list
            result._idlName = "NodeList";
            return result;
          }
          names = names.split(/\s+/);  // Split on spaces
          return new impl.FilteredElementList(this,
            classNamesElementFilter(names));
        }),

        getElementsByName: constant(function getElementsByName(name) {
          return new impl.FilteredElementList(this, elementNameFilter(name));
        }),

        adoptNode: constant(function adoptNode(node) {
          if (node.nodeType === DOCUMENT_NODE ||
            node.nodeType === DOCUMENT_TYPE_NODE) NotSupportedError();

          if (node.parentNode) node.parentNode.removeChild(node)

          if (node.ownerDocument !== this)
            recursivelySetOwner(node, this);

          return node;
        }),

        importNode: constant(function importNode(node, deep) {
          return this.adoptNode(node.cloneNode());
        }),

        // The following attributes and methods are from the HTML spec
        URL: attribute(nyi),
        domain: attribute(nyi, nyi),
        referrer: attribute(nyi),
        cookie: attribute(nyi, nyi),
        lastModified: attribute(nyi),
        // XXX Temporary hack
        readyState: attribute(function() { return "complete" }),
        title: attribute(fnoop, nyi),
        dir:  attribute(nyi, nyi),
        // Return the first <body> child of the document element.
        // XXX For now, setting this attribute is not implemented.
        body: attribute(function() {
          if (this.isHTML && this.documentElement) {
            var kids = this.documentElement.childNodes;
            for(var i = 0, n = kids.length; i < n; i++) {
              if (kids[i].nodeType === ELEMENT_NODE &&
                kids[i].localName === "body" &&
                kids[i].namespaceURI === HTML_NAMESPACE) {
                return kids[i];
              }
            }
          }
          return null;
        }, nyi),
        // Return the first <head> child of the document element.
        head: attribute(function() {
          if (this.isHTML && this.documentElement) {
            var kids = this.documentElement.childNodes;
            for(var i = 0, n = kids.length; i < n; i++) {
              if (kids[i].nodeType === ELEMENT_NODE &&
                kids[i].localName === "head" &&
                kids[i].namespaceURI === HTML_NAMESPACE) {
                return kids[i];
              }
            }
          }
          return null;
        }),
        images: attribute(nyi),
        embeds: attribute(nyi),
        plugins: attribute(nyi),
        links: attribute(nyi),
        forms: attribute(nyi),
        scripts: attribute(nyi),
        innerHTML: attribute(function() { return this.serialize() }, nyi),

        write: constant(function(args) {
          if (!this.isHTML) InvalidStateError();

          // XXX: still have to implement the ignore part
          if (!this._parser /* && this._ignore_destructive_writes > 0 */ )
            return;

          if (!this._parser) {
            // XXX call document.open, etc.
          }

          var s = join(arguments, "");

          // If the Document object's reload override flag is set, then
          // append the string consisting of the concatenation of all the
          // arguments to the method to the Document's reload override
          // buffer.
          // XXX: don't know what this is about.  Still have to do it

          // If there is no pending parsing-blocking script, have the
          // tokenizer process the characters that were inserted, one at a
          // time, processing resulting tokens as they are emitted, and
          // stopping when the tokenizer reaches the insertion point or when
          // the processing of the tokenizer is aborted by the tree
          // construction stage (this can happen if a script end tag token is
          // emitted by the tokenizer).

          // XXX: still have to do the above. Sounds as if we don't
          // always call parse() here.  If we're blocked, then we just
          // insert the text into the stream but don't parse it reentrantly...

          // Invoke the parser reentrantly
          this._parser.parse(s);
        }),

        writeln: constant(function writeln(args) {
          this.write(join(arguments, "") + "\n");
        }),

        // Utility methods
        clone: constant(function clone() {
          // Can't clone an entire document
          DataCloneError();
        }),
        isEqual: constant(function isEqual(n) {
          // Any two documents are shallowly equal.
          // Node.isEqualNode will also test the children
          return true;
        }),

        // Implementation-specific function.  Called when a text, comment,
        // or pi value changes.
        mutateValue: constant(function(node) {
          if (this.mutationHandler) {
            this.mutationHandler({
              type: MUTATE_VALUE,
              target: node._nid,
              data: node.data
            });
          }
        }),

        // Invoked when an attribute's value changes. Attr holds the new
        // value.  oldval is the old value.  Attribute mutations can also
        // involve changes to the prefix (and therefore the qualified name)
        mutateAttr: constant(function(attr, oldval) {
          // Manage id->element mapping for getElementsById()
          // XXX: this special case id handling should not go here,
          // but in the attribute declaration for the id attribute
          /*
           if (attr.localName === "id" && attr.namespaceURI === null) {
           if (oldval) delId(oldval, attr.ownerElement);
           addId(attr.value, attr.ownerElement);
           }
           */
          if (this.mutationHandler) {
            this.mutationHandler({
              type: MUTATE_ATTR,
              target: attr.ownerElement._nid,
              name: attr.localName,
              ns: attr.namespaceURI,
              value: attr.value,
              prefix: attr.prefix
            });
          }
        }),

        // Used by removeAttribute and removeAttributeNS for attributes.
        mutateRemoveAttr: constant(function(attr) {
          /*
           * This is now handled in Attributes.js
           // Manage id to element mapping
           if (attr.localName === "id" && attr.namespaceURI === null) {
           this.delId(attr.value, attr.ownerElement);
           }
           */
          if (this.mutationHandler) {
            this.mutationHandler({
              type: MUTATE_REMOVE_ATTR,
              target: attr.ownerElement._nid,
              name: attr.localName,
              ns: attr.namespaceURI
            });
          }
        }),

        // Called by Node.removeChild, etc. to remove a rooted element from
        // the tree. Only needs to generate a single mutation event when a
        // node is removed, but must recursively mark all descendants as not
        // rooted.
        mutateRemove: constant(function(node) {
          // Send a single mutation event
          if (this.mutationHandler) {
            this.mutationHandler({
              type: MUTATE_REMOVE,
              target: node._nid
            });
          }

          // Mark this and all descendants as not rooted
          recursivelyUproot(node);
        }),

        // Called when a new element becomes rooted.  It must recursively
        // generate mutation events for each of the children, and mark them all
        // as rooted.
        mutateInsert: constant(function(node) {
          // Mark node and its descendants as rooted
          recursivelyRoot(node);

          // Send a single mutation event
          if (this.mutationHandler) {
            this.mutationHandler({
              type: MUTATE_INSERT,
              target: node.parentNode._nid,
              index: node.index,
              nid: node._nid,
              child: DOMSTR.serialize(node)
            });
          }
        }),

        // Called when a rooted element is moved within the document
        mutateMove: constant(function(node) {
          if (this.mutationHandler) {
            this.mutationHandler({
              type: MUTATE_MOVE,
              target: node._nid,
              parent: node.parentNode._nid,
              index: node.index
            });
          }
        }),


        // Add a mapping from  id to n for n.ownerDocument
        addId: constant(function addId(id, n) {
          var val = this.byId[id];
          if (!val) {
            this.byId[id] = n;
          }
          else {
            warn("Duplicate element id " + id);
            if (!isArray(val)) {
              val = [val];
              this.byId[id] = val;
            }
            val.push(n);
            sort(val, documentOrder);
          }
        }),

        // Delete the mapping from id to n for n.ownerDocument
        delId: constant(function delId(id, n) {
          var val = this.byId[id];
          assert(val);

          if (isArray(val)) {
            var idx = A.indexOf(val, n);
            splice(val, idx, 1);

            if (val.length == 1) { // convert back to a single node
              this.byId[id] = val[0];
            }
          }
          else {
            delete this.byId[id];
          }
        }),

        _documentBaseURL: attribute(function() {
          // XXX: This is not implemented correctly yet
          return this._address;

          // The document base URL of a Document object is the
          // absolute URL obtained by running these substeps:

          //     Let fallback base url be the document's address.

          //     If fallback base url is about:blank, and the
          //     Document's browsing context has a creator browsing
          //     context, then let fallback base url be the document
          //     base URL of the creator Document instead.

          //     If the Document is an iframe srcdoc document, then
          //     let fallback base url be the document base URL of
          //     the Document's browsing context's browsing context
          //     container's Document instead.

          //     If there is no base element that has an href
          //     attribute, then the document base URL is fallback
          //     base url; abort these steps. Otherwise, let url be
          //     the value of the href attribute of the first such
          //     element.

          //     Resolve url relative to fallback base url (thus,
          //     the base href attribute isn't affected by xml:base
          //     attributes).

          //     The document base URL is the result of the previous
          //     step if it was successful; otherwise it is fallback
          //     base url.


        }),
      });

      var eventHandlerTypes = [
        "abort", "canplay", "canplaythrough", "change", "click", "contextmenu",
        "cuechange", "dblclick", "drag", "dragend", "dragenter", "dragleave",
        "dragover", "dragstart", "drop", "durationchange", "emptied", "ended",
        "input", "invalid", "keydown", "keypress", "keyup", "loadeddata",
        "loadedmetadata", "loadstart", "mousedown", "mousemove", "mouseout",
        "mouseover", "mouseup", "mousewheel", "pause", "play", "playing",
        "progress", "ratechange", "readystatechange", "reset", "seeked",
        "seeking", "select", "show", "stalled", "submit", "suspend",
        "timeupdate", "volumechange", "waiting",

        "blur", "error", "focus", "load", "scroll"
      ];

      // Add event handler idl attribute getters and setters to Document
      eventHandlerTypes.forEach(function(type) {
        // Define the event handler registration IDL attribute for this type
        Object.defineProperty(Document.prototype, "on" + type, {
          get: function() {
            return this._getEventHandler(type);
          },
          set: function(v) {
            this._setEventHandler(type, v);
          }
        });
      });



      function root(n) {
        n._nid = n.ownerDocument._nextnid++;
        n.ownerDocument._nodes[n._nid] = n;
        // Manage id to element mapping
        if (n.nodeType === ELEMENT_NODE) {
          var id = n.getAttribute("id");
          if (id) n.ownerDocument.addId(id, n);

          // Script elements need to know when they're inserted
          // into the document
          if (n._roothook) n._roothook();
        }
      }

      function uproot(n) {
        // Manage id to element mapping
        if (n.nodeType === ELEMENT_NODE) {
          var id = n.getAttribute("id");
          if (id) n.ownerDocument.delId(id, n);
        }
        delete n.ownerDocument._nodes[n._nid];
        delete n._nid;
      }

      function recursivelyRoot(node) {
        root(node);
        // XXX:
        // accessing childNodes on a leaf node creates a new array the
        // first time, so be careful to write this loop so that it
        // doesn't do that. node is polymorphic, so maybe this is hard to
        // optimize?  Try switching on nodeType?
        /*
         if (node.hasChildNodes()) {
         var kids = node.childNodes;
         for(var i = 0, n = kids.length;  i < n; i++)
         recursivelyRoot(kids[i]);
         }
         */
        if (node.nodeType === ELEMENT_NODE) {
          var kids = node.childNodes;
          for(var i = 0, n = kids.length;  i < n; i++)
            recursivelyRoot(kids[i]);
        }
      }

      function recursivelyUproot(node) {
        uproot(node);
        for(var i = 0, n = node.childNodes.length;  i < n; i++)
          recursivelyUproot(node.childNodes[i]);
      }

      function recursivelySetOwner(node, owner) {
        node.ownerDocument = owner;
        delete node._lastModTime; // mod times are document-based
        var kids = node.childNodes;
        for(var i = 0, n = kids.length; i < n; i++)
          recursivelySetOwner(kids[i], owner);
      }


      // These functions return predicates for filtering elements.
      // They're used by the Document and Element classes for methods like
      // getElementsByTagName and getElementsByClassName

      function localNameElementFilter(lname) {
        return function(e) { return e.localName === lname; };
      }

      function htmlLocalNameElementFilter(lname) {
        var lclname = toLowerCase(lname);
        if (lclname === lname)
          return localNameElementFilter(lname);

        return function(e) {
          return e.isHTML
            ? e.localName === lclname
            : e.localName === lname;
        };
      }

      function namespaceElementFilter(ns) {
        return function(e) { return e.namespaceURI === ns; };
      }

      function namespaceLocalNameElementFilter(ns, lname) {
        return function(e) {
          return e.namespaceURI === ns && e.localName === lname;
        };
      }

      // XXX
      // Optimize this when I implement classList.
      function classNamesElementFilter(names) {
        return function(e) {
          var classAttr = e.getAttribute("class");
          if (!classAttr) return false;
          var classes = classAttr.trim().split(/\s+/);
          return every(names, function(n) {
            return A.indexOf(classes, n) !== -1;
          })
        }
      }

      function elementNameFilter(name) {
        return function(e) {
          return e.getAttribute("name") === name;
        }
      }


      return Document;
    });



    /************************************************************************
     *  src/impl/DocumentFragment.js
     ************************************************************************/

//@line 1 "src/impl/DocumentFragment.js"
    defineLazyProperty(impl, "DocumentFragment", function() {
      function DocumentFragment(doc) {
        this.nodeType = DOCUMENT_FRAGMENT_NODE;
        this.ownerDocument = doc;
        this.childNodes = [];
        this.childNodes._idlName = "NodeList";
      }

      DocumentFragment.prototype = O.create(impl.Node.prototype, {
        _idlName: constant("DocumentFragment"),
//        nodeType: constant(DOCUMENT_FRAGMENT_NODE),
        nodeName: constant("#document-fragment"),
        nodeValue: attribute(fnull, fnoop),
        // Copy the text content getter/setter from Element
        textContent: O.getOwnPropertyDescriptor(impl.Element.prototype,
          "textContent"),

        // Utility methods
        clone: constant(function clone() {
          return new DocumentFragment(this.ownerDocument);
        }),
        isEqual: constant(function isEqual(n) {
          // Any two document fragments are shallowly equal.
          // Node.isEqualNode() will test their children for equality
          return true;
        }),

      });

      return DocumentFragment;
    });


    /************************************************************************
     *  src/impl/DocumentType.js
     ************************************************************************/

//@line 1 "src/impl/DocumentType.js"
    defineLazyProperty(impl, "DocumentType", function() {
      function DocumentType(name, publicId, systemId) {
        // Unlike other nodes, doctype nodes always start off unowned
        // until inserted
        this.nodeType = DOCUMENT_TYPE_NODE;
        this.ownerDocument = null;
        this.name = name;
        this.publicId = publicId || "";
        this.systemId = systemId || "";
      }

      DocumentType.prototype = O.create(impl.Leaf.prototype, {
        _idlName: constant("DocumentType"),
//        nodeType: constant(DOCUMENT_TYPE_NODE),
        nodeName: attribute(function() { return this.name; }),
        nodeValue: attribute(fnull, fnoop),

        // Utility methods
        clone: constant(function clone() {
          DataCloneError();
        }),
        isEqual: constant(function isEqual(n) {
          return this.name === n.name &&
            this.publicId === n.publicId &&
            this.systemId === n.systemId;
        })
      });

      return DocumentType;
    });


    /************************************************************************
     *  src/impl/DOMImplementation.js
     ************************************************************************/

//@line 1 "src/impl/DOMImplementation.js"
    defineLazyProperty(impl, "DOMImplementation", function() {
      // Each document must have its own instance of the domimplementation object
      // Even though these objects have no state
      function DOMImplementation() {};


      // Feature/version pairs that DOMImplementation.hasFeature() returns
      // true for.  It returns false for anything else.
      const supportedFeatures = {
        "xml": { "": true, "1.0": true, "2.0": true },   // DOM Core
        "core": { "": true, "2.0": true },               // DOM Core
        "html": { "": true, "1.0": true, "2.0": true} ,  // HTML
        "xhtml": { "": true, "1.0": true, "2.0": true} , // HTML
      };

      DOMImplementation.prototype = {
        _idlName: "DOMImplementation",
        hasFeature: function hasFeature(feature, version) {
          // Warning text directly modified slightly from the DOM Core spec:
          warn("Authors are strongly discouraged from using " +
            "DOMImplementation.hasFeature(), as it is notoriously " +
            "unreliable and imprecise. " +
            "Use explicit feature testing instead.");

          var f = supportedFeatures[feature.toLowerCase()];

          return (f && f[version]) || false;
        },

        createDocumentType: function createDocumentType(qualifiedName,
                                                        publicId, systemId) {
          if (!xml.isValidName(qualifiedName)) InvalidCharacterError();
          if (!xml.isValidQName(qualifiedName)) NamespaceError();

          return new impl.DocumentType(qualifiedName, publicId, systemId);
        },

        createDocument: function createDocument(namespace,
                                                qualifiedName, doctype) {
          //
          // Note that the current DOMCore spec makes it impossible to
          // create an HTML document with this function, even if the
          // namespace and doctype are propertly set.  See this thread:
          // http://lists.w3.org/Archives/Public/www-dom/2011AprJun/0132.html
          //
          var address = null;
          if (currentlyExecutingScript)
            address = currentlyExecutingScript.ownerDocument._address
          var d = new impl.Document(false, address);
          var e;

          if (qualifiedName)
            e = d.createElementNS(namespace, qualifiedName);
          else
            e = null;

          if (doctype) {
            if (doctype.ownerDocument) WrongDocumentError();
            d.appendChild(doctype);
          }

          if (e) d.appendChild(e);

          return d;
        },

        createHTMLDocument: function createHTMLDocument(titleText) {
          var d = new impl.Document(true);
          d.appendChild(new impl.DocumentType("html"));
          var html = d.createElement("html");
          d.appendChild(html);
          var head = d.createElement("head");
          html.appendChild(head);
          var title = d.createElement("title");
          head.appendChild(title);
          title.appendChild(d.createTextNode(titleText));
          html.appendChild(d.createElement("body"));
          return d;
        },

        mozSetOutputMutationHandler: function(doc, handler) {
          doc.mutationHandler = handler;
        },

        mozGetInputMutationHandler: function(doc) {
          nyi();
        }
      };

      return DOMImplementation;
    });


    /************************************************************************
     *  src/impl/FilteredElementList.js
     ************************************************************************/

//@line 1 "src/impl/FilteredElementList.js"
//
// This file defines node list implementation that lazily traverses
// the document tree (or a subtree rooted at any element) and includes
// only those elements for which a specified filter function returns true.
// It is used to implement the
// {Document,Element}.getElementsBy{TagName,ClassName}{,NS} methods.
//
    defineLazyProperty(impl, "FilteredElementList", function() {
      function FilteredElementList(root, filter) {
        this.root = root;
        this.filter = filter;
        this.lastModTime = root.lastModTime
        this.done = false;
        this.cache = [];
      }

      FilteredElementList.prototype = {
        _idlName: "NodeList",

        get length() {
          this.checkcache();
          if (!this.done) this.traverse();
          return this.cache.length;
        },

        item: function(n) {
          this.checkcache();
          if (!this.done && n >= this.cache.length)
            this.traverse(n);
          return this.cache[n];
        },

        checkcache: function() {
          if (this.lastModTime !== this.root.lastModTime) {
            // subtree has changed, so invalidate cache
            this.cache.length = 0;
            this.done = false;
            this.lastModTime = this.root.lastModTime;
          }
        },

        // If n is specified, then traverse the tree until we've found the nth
        // item (or until we've found all items).  If n is not specified,
        // traverse until we've found all items.
        traverse: function(n) {
          // increment n so we can compare to length, and so it is never falsy
          if (n !== undefined) n++;

          var elt;
          while(elt = this.next()) {
            push(this.cache, elt);
            if (n && this.cache.length === n) return;
          }

          // no next element, so we've found everything
          this.done = true;
        },

        // Return the next element under root that matches filter
        next: function() {
          var start = (this.cache.length == 0)    // Start at the root or at
            ? this.root                         // the last element we found
            : this.cache[this.cache.length-1];

          var elt;
          if (start.nodeType === DOCUMENT_NODE)
            elt = start.documentElement;
          else
            elt = start.nextElement(this.root);

          while(elt) {
            if (this.filter(elt)) {
              return elt;
            }

            elt = elt.nextElement(this.root);
          }
          return null;
        }
      };

      return FilteredElementList;
    });


    /************************************************************************
     *  src/impl/Event.js
     ************************************************************************/

//@line 1 "src/impl/Event.js"
    defineLazyProperty(impl, "Event", function() {
      function Event(type, dictionary) {
        // Initialize basic event properties
        this.type = "";
        this.target = null;
        this.currentTarget = null;
        this.eventPhase = AT_TARGET;
        this.bubbles = false;
        this.cancelable = false;
        this.isTrusted = false;
        this.defaultPrevented = false;
        this.timeStamp = Date.now();

        // Initialize internal flags
        // XXX: Would it be better to inherit these defaults from the prototype?
        this._propagationStopped = false;
        this._immediatePropagationStopped = false;
        this._initialized = true;
        this._dispatching = false;

        // Now initialize based on the constructor arguments (if any)
        if (type) this.type = type;
        if (dictionary) {
          for(var p in dictionary)
            this[p] = dictionary[p];
        }
      }

      Event.prototype = O.create(Object.prototype, {
        _idlName: constant("Event"),
        stopPropagation: constant(function stopPropagation() {
          this._propagationStopped = true;
        }),

        stopImmediatePropagation: constant(function stopImmediatePropagation() {
          this._propagationStopped = true;
          this._immediatePropagationStopped = true;
        }),

        preventDefault: constant(function preventDefault() {
          if (this.cancelable)
            this.defaultPrevented = true;
        }),

        initEvent: constant(function initEvent(type, bubbles, cancelable) {
          this._initialized = true;
          if (this._dispatching) return;

          this._propagationStopped = false;
          this._immediatePropagationStopped = false;
          this.defaultPrevented = false;
          this.isTrusted = false;

          this.target = null;
          this.type = type;
          this.bubbles = bubbles;
          this.cancelable = cancelable;
        }),

      });

      return Event;
    });



    /************************************************************************
     *  src/impl/CustomEvent.js
     ************************************************************************/

//@line 1 "src/impl/CustomEvent.js"
    defineLazyProperty(impl, "CustomEvent", function() {
      function CustomEvent(type, dictionary) {
        // Just use the superclass constructor to initialize
        impl.Event.call(this, type, dictionary);
      }
      CustomEvent.prototype = O.create(impl.Event.prototype, {
        _idlName: constant("CustomEvent"),
      });
      return CustomEvent;
    });



    /************************************************************************
     *  src/impl/UIEvent.js
     ************************************************************************/

//@line 1 "src/impl/UIEvent.js"
    defineLazyProperty(impl, "UIEvent", function() {
      function UIEvent() {
        // Just use the superclass constructor to initialize
        impl.Event.call(this);

        this.view = null;  // FF uses the current window
        this.detail = 0;
      }
      UIEvent.prototype = O.create(impl.Event.prototype, {
        _idlName: constant("UIEvent"),
        initUIEvent: constant(function(type, bubbles, cancelable,
                                       view, detail) {
          this.initEvent(type, bubbles, cancelable);
          this.view = view;
          this.detail = detail;
        }),
      });
      return UIEvent;
    });



    /************************************************************************
     *  src/impl/MouseEvent.js
     ************************************************************************/

//@line 1 "src/impl/MouseEvent.js"
    defineLazyProperty(impl, "MouseEvent", function() {
      function MouseEvent() {
        // Just use the superclass constructor to initialize
        impl.UIEvent.call(this);

        this.screenX = this.screenY = this.clientX = this.clientY = 0;
        this.ctrlKey = this.altKey = this.shiftKey = this.metaKey = false;
        this.button = 0;
        this.buttons = 1;
        this.relatedTarget = null;
      }
      MouseEvent.prototype = O.create(impl.UIEvent.prototype, {
        _idlName: constant("MouseEvent"),
        initMouseEvent: constant(function(type, bubbles, cancelable,
                                          view, detail,
                                          screenX, screenY, clientX, clientY,
                                          ctrlKey, altKey, shiftKey, metaKey,
                                          button, relatedTarget) {
          this.initEvent(type, bubbles, cancelable, view, detail);
          this.screenX = screenX;
          this.screenY = screenY;
          this.clientX = clientX;
          this.clientY = clientY;
          this.ctrlKey = ctrlKey;
          this.altKey = altKey;
          this.shiftKey = shiftKey;
          this.metaKey = metaKey;
          this.button = button;
          switch(button) {
            case 0: this.buttons = 1; break;
            case 1: this.buttons = 4; break;
            case 2: this.buttons = 2; break;
            default: this.buttons = 0; break;
          }
          this.relatedTarget = relatedTarget;
        }),

        getModifierState: constant(function(key) {
          switch(key) {
            case "Alt": return this.altKey;
            case "Control": return this.ctrlKey;
            case "Shift": return this.shiftKey;
            case "Meta": return this.metaKey;
            default: return false;
          }
        }),
      });

      return MouseEvent;
    });



    /************************************************************************
     *  src/impl/HTMLElement.js
     ************************************************************************/

//@line 1 "src/impl/HTMLElement.js"
    var tagNameToInterfaceName = {
      "a": "HTMLAnchorElement",
      "abbr": "HTMLElement",
      "address": "HTMLElement",
      "area": "HTMLAreaElement",
      "article": "HTMLElement",
      "aside": "HTMLElement",
      "audio": "HTMLAudioElement",
      "b": "HTMLElement",
      "base": "HTMLBaseElement",
      "bdi": "HTMLElement",
      "bdo": "HTMLElement",
      "blockquote": "HTMLQuoteElement",
      "body": "HTMLBodyElement",
      "br": "HTMLBRElement",
      "button": "HTMLButtonElement",
      "canvas": "HTMLCanvasElement",
      "caption": "HTMLTableCaptionElement",
      "cite": "HTMLElement",
      "code": "HTMLElement",
      "col": "HTMLTableColElement",
      "colgroup": "HTMLTableColElement",
      "command": "HTMLCommandElement",
      "datalist": "HTMLDataListElement",
      "dd": "HTMLElement",
      "del": "HTMLModElement",
      "details": "HTMLDetailsElement",
      "dfn": "HTMLElement",
      "div": "HTMLDivElement",
      "dl": "HTMLDListElement",
      "dt": "HTMLElement",
      "em": "HTMLElement",
      "embed": "HTMLEmbedElement",
      "fieldset": "HTMLFieldSetElement",
      "figcaption": "HTMLElement",
      "figure": "HTMLElement",
      "footer": "HTMLElement",
      "form": "HTMLFormElement",
      "frame": "HTMLFrameElement",
      "frameset": "HTMLFrameSetElement",
      "h1": "HTMLHeadingElement",
      "h2": "HTMLHeadingElement",
      "h3": "HTMLHeadingElement",
      "h4": "HTMLHeadingElement",
      "h5": "HTMLHeadingElement",
      "h6": "HTMLHeadingElement",
      "head": "HTMLHeadElement",
      "header": "HTMLElement",
      "hgroup": "HTMLElement",
      "hr": "HTMLHRElement",
      "html": "HTMLHtmlElement",
      "i": "HTMLElement",
      "iframe": "HTMLIFrameElement",
      "img": "HTMLImageElement",
      "input": "HTMLInputElement",
      "ins": "HTMLModElement",
      "kbd": "HTMLElement",
      "keygen": "HTMLKeygenElement",
      "label": "HTMLLabelElement",
      "legend": "HTMLLegendElement",
      "li": "HTMLLIElement",
      "link": "HTMLLinkElement",
      "map": "HTMLMapElement",
      "mark": "HTMLElement",
      "menu": "HTMLMenuElement",
      "meta": "HTMLMetaElement",
      "meter": "HTMLMeterElement",
      "nav": "HTMLElement",
      "noscript": "HTMLElement",
      "object": "HTMLObjectElement",
      "ol": "HTMLOListElement",
      "optgroup": "HTMLOptGroupElement",
      "option": "HTMLOptionElement",
      "output": "HTMLOutputElement",
      "p": "HTMLParagraphElement",
      "param": "HTMLParamElement",
      "pre": "HTMLPreElement",
      "progress": "HTMLProgressElement",
      "q": "HTMLQuoteElement",
      "rp": "HTMLElement",
      "rt": "HTMLElement",
      "ruby": "HTMLElement",
      "s": "HTMLElement",
      "samp": "HTMLElement",
      "script": "HTMLScriptElement",
      "section": "HTMLElement",
      "select": "HTMLSelectElement",
      "small": "HTMLElement",
      "source": "HTMLSourceElement",
      "span": "HTMLSpanElement",
      "strong": "HTMLElement",
      "style": "HTMLStyleElement",
      "sub": "HTMLElement",
      "summary": "HTMLElement",
      "sup": "HTMLElement",
      "table": "HTMLTableElement",
      "tbody": "HTMLTableSectionElement",
      "td": "HTMLTableDataCellElement",
      "textarea": "HTMLTextAreaElement",
      "tfoot": "HTMLTableSectionElement",
      "th": "HTMLTableHeaderCellElement",
      "thead": "HTMLTableSectionElement",
      "time": "HTMLTimeElement",
      "title": "HTMLTitleElement",
      "tr": "HTMLTableRowElement",
      "track": "HTMLTrackElement",
      "u": "HTMLElement",
      "ul": "HTMLUListElement",
      "var": "HTMLElement",
      "video": "HTMLVideoElement",
      "wbr": "HTMLElement",
    };

    defineLazyProperty(impl, "HTMLElement", function() {
      function HTMLElement(doc, localName, prefix) {
        impl.Element.call(this, doc, localName, HTML_NAMESPACE, prefix);
      }

      HTMLElement.prototype = O.create(impl.Element.prototype, {
        _idlName: constant("HTMLElement"),
        innerHTML: attribute(
          function() {
            // TODO: wrap into faceted value here not the other location.
            return this.serialize();
          },
          function(v) {
            var parser = this.ownerDocument.implementation.mozHTMLParser(
              this.ownerDocument._address,
              this);
            parser.parse(v, true);
            var tmpdoc = parser.document();
            var root = tmpdoc.firstChild;

            // Remove any existing children of this node
            while(this.hasChildNodes())
              this.removeChild(this.firstChild);

            // Now copy newly parsed children from the root to this node
            while(root.hasChildNodes()) {
              this.appendChild(root.firstChild);
            }
          }),
        style: attribute(function() {
          if (!this._style)
            this._style = new impl.CSSStyleDeclaration(this);
          return this._style;
        }),

        click: constant(function() {
          if (this._click_in_progress) return;
          this._click_in_progress = true;
          try {
            if (this._pre_click_activation_steps)
              this._pre_click_activation_steps();

            var event = this.ownerDocument.createEvent("MouseEvent");
            event.initMouseEvent("click", true, true,
              this.ownerDocument.defaultView, 1,
              0, 0, 0, 0,
              // These 4 should be initialized with
              // the actually current keyboard state
              // somehow...
              false, false, false, false,
              0, null)

            // Dispatch this as an untrusted event since it is synthetic
            var success = this.dispatchEvent(event);

            if (success) {
              if (this._post_click_activation_steps)
                this._post_click_activation_steps(event);
            }
            else {
              if (this._cancelled_activation_steps)
                this._cancelled_activation_steps();
            }
          }
          finally {
            this._click_in_progress = false;
          }
        }),
      });

      impl.Element.reflectStringAttribute(HTMLElement, "title");
      impl.Element.reflectStringAttribute(HTMLElement, "lang");
      impl.Element.reflectEnumeratedAttribute(HTMLElement, "dir", null, {
        ltr: "ltr",
        rtl: "rtl",
        auto:"auto"
      });

      impl.Element.reflectStringAttribute(HTMLElement, "accesskey", "accessKey");
      impl.Element.reflectBooleanAttribute(HTMLElement, "hidden");

      // XXX: the default value for tabIndex should be 0 if the element is
      // focusable and -1 if it is not.  But the full definition of focusable
      // is actually hard to compute, so for now, I'll follow Firefox and
      // just base the default value on the type of the element.
      var focusableElements = {
        "A":true, "LINK":true, "BUTTON":true, "INPUT":true,
        "SELECT":true, "TEXTAREA":true, "COMMAND":true
      };
      impl.Element.reflectIntegerAttribute(HTMLElement, "tabindex",
        // compute a default tabIndex value
        function() {
          if (this.tagName in focusableElements ||
            this.contentEditable)
            return 0;
          else
            return -1;
        },
        "tabIndex");

      // XXX: reflect contextmenu as contextMenu, with element type


      // style: the spec doesn't call this a reflected attribute.
      //   may want to handle it manually.

      // contentEditable: enumerated, not clear if it is actually
      // reflected or requires custom getter/setter. Not listed as
      // "limited to known values".  Raises syntax_err on bad setting,
      // so I think this is custom.

      // contextmenu: content is element id, idl type is an element
      // draggable: boolean, but not a reflected attribute
      // dropzone: reflected SettableTokenList, experimental, so don't
      //   implement it right away.

      // data-* attributes: need special handling in setAttribute?
      // Or maybe that isn't necessary. Can I just scan the attribute list
      // when building the dataset?  Liveness and caching issues?

      // microdata attributes: many are simple reflected attributes, but
      // I'm not going to implement this now.


      var eventHandlerTypes = [
        "abort", "canplay", "canplaythrough", "change", "click", "contextmenu",
        "cuechange", "dblclick", "drag", "dragend", "dragenter", "dragleave",
        "dragover", "dragstart", "drop", "durationchange", "emptied", "ended",
        "input", "invalid", "keydown", "keypress", "keyup", "loadeddata",
        "loadedmetadata", "loadstart", "mousedown", "mousemove", "mouseout",
        "mouseover", "mouseup", "mousewheel", "pause", "play", "playing",
        "progress", "ratechange", "readystatechange", "reset", "seeked",
        "seeking", "select", "show", "stalled", "submit", "suspend",
        "timeupdate", "volumechange", "waiting",

        // These last 5 event types will be overriden by HTMLBodyElement
        "blur", "error", "focus", "load", "scroll"
      ];

      eventHandlerTypes.forEach(function(type) {
        // Define the event handler registration IDL attribute for this type
        Object.defineProperty(HTMLElement.prototype, "on" + type, {
          get: function() {
            return this._getEventHandler(type);
          },
          set: function(v) {
            this._setEventHandler(type, v);
          },
        });

        function EventHandlerChangeHandler(elt, name, oldval, newval) {
          var doc = elt.ownerDocument ? wrap(elt.ownerDocument) : {};
          var form = elt.form ? wrap(elt.form) : {};
          var element = wrap(elt);

          // EventHandlerBuilder uses with, so it is in src/loose.js
          elt[name] = new EventHandlerBuilder(newval,
            doc, form, element).build();
        }

        // Define special behavior for the content attribute as well
        impl.Element.registerAttributeChangeHandler(HTMLElement, "on" + type,
          EventHandlerChangeHandler);
      });

      return HTMLElement;
    });

    defineLazyProperty(impl, "HTMLAnchorElement", function() {
      function HTMLAnchorElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLAnchorElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLAnchorElement"),

        _post_click_activation_steps: constant(function(e) {
          if (this.href) {
            // Follow the link
            // XXX: this is just a quick hack
            // XXX: the HTML spec probably requires more than this
            this.ownerDocument.defaultView.location = this.href;
          }
        })
      });

      // XXX impl.Element.reflectURLAttribute(HTMLAnchorElement, "href");
      // XXX impl.Element.reflectURLAttribute(HTMLAnchorElement, "ping");
      impl.Element.reflectStringAttribute(HTMLAnchorElement, "download");
      impl.Element.reflectStringAttribute(HTMLAnchorElement, "target");
      impl.Element.reflectStringAttribute(HTMLAnchorElement, "rel");
      impl.Element.reflectStringAttribute(HTMLAnchorElement, "media");
      impl.Element.reflectStringAttribute(HTMLAnchorElement, "hreflang");
      impl.Element.reflectStringAttribute(HTMLAnchorElement, "type");
      // XXX: also reflect relList

      return HTMLAnchorElement;
    });

    defineLazyProperty(impl, "HTMLAreaElement", function() {
      function HTMLAreaElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLAreaElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLAreaElement"),
      });

      // XXX impl.Element.reflectURLAttribute(HTMLAreaElement, "href");
      // XXX impl.Element.reflectURLAttribute(HTMLAreaElement, "ping");
      impl.Element.reflectStringAttribute(HTMLAreaElement, "alt");
      impl.Element.reflectStringAttribute(HTMLAreaElement, "target");
      impl.Element.reflectStringAttribute(HTMLAreaElement, "download");
      impl.Element.reflectStringAttribute(HTMLAreaElement, "rel");
      impl.Element.reflectStringAttribute(HTMLAreaElement, "media");
      impl.Element.reflectStringAttribute(HTMLAreaElement, "hreflang");
      impl.Element.reflectStringAttribute(HTMLAreaElement, "type");
      impl.Element.reflectStringAttribute(HTMLAreaElement, "shape");
      impl.Element.reflectStringAttribute(HTMLAreaElement, "coords");
      // XXX: also reflect relList

      return HTMLAreaElement;
    });

    defineLazyProperty(impl, "HTMLBRElement", function() {
      function HTMLBRElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLBRElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLBRElement"),
      });

      return HTMLBRElement;
    });

    defineLazyProperty(impl, "HTMLBaseElement", function() {
      function HTMLBaseElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLBaseElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLBaseElement"),
      });

      impl.Element.reflectStringAttribute(HTMLBaseElement, "target");

      return HTMLBaseElement;
    });

    defineLazyProperty(impl, "HTMLBodyElement", function() {
      function HTMLBodyElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLBodyElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLBodyElement"),
      });


      // Certain event handler attributes on a <body> tag actually set
      // handlers for the window rather than just that element.  Define
      // getters and setters for those here.  Note that some of these override
      // properties on HTMLElement.prototype.
      // XXX: If I add support for <frameset>, these have to go there, too
      // XXX
      // When the Window object is implemented, these attribute will have
      // to work with the same-named attributes on the Window.

      var eventHandlerTypes = [
        "afterprint", "beforeprint", "beforeunload", "blur", "error",
        "focus","hashchange", "load", "message", "offline", "online",
        "pagehide", "pageshow","popstate","resize","scroll","storage","unload",
      ];

      eventHandlerTypes.forEach(function(type) {
        // Define the event handler registration IDL attribute for this type
        Object.defineProperty(HTMLBodyElement.prototype, "on" + type, {
          get: function() {
            // XXX: read these from the Window object instead?
            return this._getEventHandler(type);
          },
          set: function(v) {
            // XXX: write to the Window object instead?
            this._setEventHandler(type, v);
          },
        });

        function EventHandlerChangeHandler(elt, name, oldval, newval) {
          var doc = elt.ownerDocument ? wrap(elt.ownerDocument) : {};
          var form = elt.form ? wrap(elt.form) : {};
          var element = wrap(elt);

          // EventHandlerBuilder uses with, so it is in src/loose.js
          elt[name] = new EventHandlerBuilder(newval,
            doc, form, element).build();
        }

        // Define special behavior for the content attribute as well
        impl.Element.registerAttributeChangeHandler(HTMLBodyElement,"on" + type,
          EventHandlerChangeHandler);
      });


      return HTMLBodyElement;
    });

    defineLazyProperty(impl, "HTMLButtonElement", function() {
      function HTMLButtonElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLButtonElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLButtonElement"),
      });

      impl.Element.reflectStringAttribute(HTMLButtonElement, "name");
      impl.Element.reflectBooleanAttribute(HTMLButtonElement, "disabled");
      impl.Element.reflectBooleanAttribute(HTMLButtonElement, "autofocus");

      impl.Element.reflectStringAttribute(HTMLButtonElement, "value");
      impl.Element.reflectEnumeratedAttribute(HTMLButtonElement, "type", null, {
        submit: "submit",
        reset: "reset",
        button: "button",
      }, "submit");

      impl.Element.reflectStringAttribute(HTMLButtonElement,
        "formtarget", "formTarget");
      impl.Element.reflectBooleanAttribute(HTMLButtonElement,
        "formnovalidate", "formNoValidate");
      impl.Element.reflectEnumeratedAttribute(HTMLButtonElement,
        "formmethod", "formMethod", {
          get: "get",
          post: "post"
        }, "get");
      impl.Element.reflectEnumeratedAttribute(HTMLButtonElement,
        "formenctype", "formEnctype", {
          "application/x-www-form-urlencoded":"application/x-www-form-urlencoded",
          "multipart/form-data":"multipart/form-data",
          "text/plain": "text/plain"
        }, "application/x-www-form-urlencoded");


      return HTMLButtonElement;
    });

    defineLazyProperty(impl, "HTMLCommandElement", function() {
      function HTMLCommandElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLCommandElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLCommandElement"),
      });

      impl.Element.reflectEnumeratedAttribute(HTMLCommandElement, "type", null,
        {
          command: "command",
          checkbox: "checkbox",
          radio: "radio"
        }, "command");
      impl.Element.reflectStringAttribute(HTMLCommandElement, "label");
      impl.Element.reflectBooleanAttribute(HTMLCommandElement, "disabled");
      impl.Element.reflectBooleanAttribute(HTMLCommandElement, "checked");
      impl.Element.reflectStringAttribute(HTMLCommandElement, "radiogroup");
      // XXX: also reflect URL attribute icon

      return HTMLCommandElement;
    });

    defineLazyProperty(impl, "HTMLDListElement", function() {
      function HTMLDListElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLDListElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLDListElement"),
      });

      return HTMLDListElement;
    });

    defineLazyProperty(impl, "HTMLDataListElement", function() {
      function HTMLDataListElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLDataListElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLDataListElement"),
      });

      return HTMLDataListElement;
    });

    defineLazyProperty(impl, "HTMLDetailsElement", function() {
      function HTMLDetailsElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLDetailsElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLDetailsElement"),
      });

      impl.Element.reflectBooleanAttribute(HTMLDetailsElement, "open");

      return HTMLDetailsElement;
    });

    defineLazyProperty(impl, "HTMLDivElement", function() {
      function HTMLDivElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLDivElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLDivElement"),
      });

      return HTMLDivElement;
    });

    defineLazyProperty(impl, "HTMLEmbedElement", function() {
      function HTMLEmbedElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLEmbedElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLEmbedElement"),
      });

      // XXX impl.Element.reflectURLAttribute(HTMLEmbedElement, "src");
      impl.Element.reflectStringAttribute(HTMLEmbedElement, "type");
      impl.Element.reflectStringAttribute(HTMLEmbedElement, "width");
      impl.Element.reflectStringAttribute(HTMLEmbedElement, "height");

      return HTMLEmbedElement;
    });

    defineLazyProperty(impl, "HTMLFieldSetElement", function() {
      function HTMLFieldSetElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLFieldSetElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLFieldSetElement"),
      });

      impl.Element.reflectBooleanAttribute(HTMLFieldSetElement, "disabled");
      impl.Element.reflectStringAttribute(HTMLFieldSetElement, "name");

      return HTMLFieldSetElement;
    });

    defineLazyProperty(impl, "HTMLFormElement", function() {
      function HTMLFormElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLFormElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLFormElement"),
      });

      impl.Element.reflectEnumeratedAttribute(HTMLFormElement, "autocomplete",
        null,
        {
          on: "on",
          off: "off"
        }, "on");
      impl.Element.reflectStringAttribute(HTMLFormElement, "name");
      impl.Element.reflectStringAttribute(HTMLFormElement,
        "accept-charset", "acceptCharset");

      impl.Element.reflectStringAttribute(HTMLFormElement, "target");
      impl.Element.reflectBooleanAttribute(HTMLFormElement,
        "novalidate", "noValidate");
      impl.Element.reflectEnumeratedAttribute(HTMLFormElement, "method", null, {
        get: "get",
        post: "post"
      }, "get");

      // Both enctype and encoding reflect the enctype content attribute
      impl.Element.reflectEnumeratedAttribute(HTMLFormElement, "enctype", null, {
        "application/x-www-form-urlencoded":"application/x-www-form-urlencoded",
        "multipart/form-data":"multipart/form-data",
        "text/plain": "text/plain"
      }, "application/x-www-form-urlencoded");
      impl.Element.reflectEnumeratedAttribute(HTMLFormElement,
        "enctype", "encoding", {
          "application/x-www-form-urlencoded":"application/x-www-form-urlencoded",
          "multipart/form-data":"multipart/form-data",
          "text/plain": "text/plain"
        }, "application/x-www-form-urlencoded");

      return HTMLFormElement;
    });

    defineLazyProperty(impl, "HTMLHRElement", function() {
      function HTMLHRElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLHRElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLHRElement"),
      });

      return HTMLHRElement;
    });

    defineLazyProperty(impl, "HTMLHeadElement", function() {
      function HTMLHeadElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLHeadElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLHeadElement"),
      });

      return HTMLHeadElement;
    });

    defineLazyProperty(impl, "HTMLHeadingElement", function() {
      function HTMLHeadingElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLHeadingElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLHeadingElement"),
      });

      return HTMLHeadingElement;
    });

    defineLazyProperty(impl, "HTMLHtmlElement", function() {
      function HTMLHtmlElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLHtmlElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLHtmlElement"),
      });

      return HTMLHtmlElement;
    });

    defineLazyProperty(impl, "HTMLIFrameElement", function() {
      function HTMLIFrameElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLIFrameElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLIFrameElement"),
      });

      // XXX impl.reflectURLAttribute(HTMLIFrameElement, "src");
      impl.Element.reflectStringAttribute(HTMLIFrameElement, "srcdoc");
      impl.Element.reflectStringAttribute(HTMLIFrameElement, "name");
      impl.Element.reflectStringAttribute(HTMLIFrameElement, "width");
      impl.Element.reflectStringAttribute(HTMLIFrameElement, "height");
      // XXX: sandbox is a reflected settable token list
      impl.Element.reflectBooleanAttribute(HTMLIFrameElement, "seamless");

      return HTMLIFrameElement;
    });

    defineLazyProperty(impl, "HTMLImageElement", function() {
      function HTMLImageElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLImageElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLImageElement"),
      });

      // XXX impl.Element.reflectURLAttribute(HTMLImageElement, "src");
      // XXX: I don't know whether to reflect crossorigin as a string or
      // as an enumerated attribute. Since it is not "limited to only
      // known values", I think it is just a string
      impl.Element.reflectStringAttribute(HTMLImageElement, "alt");
      impl.Element.reflectStringAttribute(HTMLImageElement, "crossorigin",
        "crossOrigin");
      impl.Element.reflectStringAttribute(HTMLImageElement, "usemap", "useMap");
      impl.Element.reflectBooleanAttribute(HTMLImageElement, "ismap", "isMap");



      return HTMLImageElement;
    });

    defineLazyProperty(impl, "HTMLInputElement", function() {
      function HTMLInputElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLInputElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLInputElement"),
      });


      impl.Element.reflectStringAttribute(HTMLInputElement, "name");
      impl.Element.reflectBooleanAttribute(HTMLInputElement, "disabled");
      impl.Element.reflectBooleanAttribute(HTMLInputElement, "autofocus");

      impl.Element.reflectStringAttribute(HTMLInputElement, "accept");
      impl.Element.reflectStringAttribute(HTMLInputElement, "alt");
      impl.Element.reflectStringAttribute(HTMLInputElement, "max");
      impl.Element.reflectStringAttribute(HTMLInputElement, "min");
      impl.Element.reflectStringAttribute(HTMLInputElement, "pattern");
      impl.Element.reflectStringAttribute(HTMLInputElement, "placeholder");
      impl.Element.reflectStringAttribute(HTMLInputElement, "step");
      impl.Element.reflectStringAttribute(HTMLInputElement,
        "dirname", "dirName");
      impl.Element.reflectStringAttribute(HTMLInputElement,
        "value", "defaultValue");

      impl.Element.reflectBooleanAttribute(HTMLInputElement, "multiple");
      impl.Element.reflectBooleanAttribute(HTMLInputElement, "required");
      impl.Element.reflectBooleanAttribute(HTMLInputElement,
        "readonly", "readOnly");
      impl.Element.reflectBooleanAttribute(HTMLInputElement,
        "checked", "defaultChecked");

      impl.Element.reflectIntegerAttribute(HTMLInputElement, "size", 20, null,
        1, null, 1);
      impl.Element.reflectIntegerAttribute(HTMLInputElement, "maxlength", -1,
        "maxLength", 0, null, 0);

      // impl.Element.reflectURLAttribute(HTMLInputElement, "src");

      impl.Element.reflectEnumeratedAttribute(HTMLInputElement, "autocomplete",
        null,
        {
          on: "on",
          off: "off"
        });

      impl.Element.reflectEnumeratedAttribute(HTMLInputElement, "type", null,
        {
          hidden: "hidden",
          text: "text",
          search: "search",
          tel: "tel",
          url: "url",
          email: "email",
          password: "password",
          datetime: "datetime",
          date: "date",
          month: "month",
          week: "week",
          time: "time",
          "datetime-local": "datetime-local",
          number: "number",
          range: "range",
          color: "color",
          checkbox: "checkbox",
          radio: "radio",
          file: "file",
          submit: "submit",
          image: "image",
          reset: "reset",
          button: "button",
        }, "text");


      impl.Element.reflectStringAttribute(HTMLInputElement,
        "formtarget", "formTarget");
      impl.Element.reflectBooleanAttribute(HTMLInputElement,
        "formnovalidate", "formNoValidate");
      impl.Element.reflectEnumeratedAttribute(HTMLInputElement,
        "formmethod", "formMethod", {
          get: "get",
          post: "post"
        }, "get");
      impl.Element.reflectEnumeratedAttribute(HTMLInputElement,
        "formenctype", "formEnctype", {
          "application/x-www-form-urlencoded":"application/x-www-form-urlencoded",
          "multipart/form-data":"multipart/form-data",
          "text/plain": "text/plain"
        }, "application/x-www-form-urlencoded");

      return HTMLInputElement;
    });

    defineLazyProperty(impl, "HTMLKeygenElement", function() {
      function HTMLKeygenElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLKeygenElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLKeygenElement"),
      });

      impl.Element.reflectStringAttribute(HTMLKeygenElement, "name");
      impl.Element.reflectBooleanAttribute(HTMLKeygenElement, "disabled");
      impl.Element.reflectBooleanAttribute(HTMLKeygenElement, "autofocus");

      impl.Element.reflectStringAttribute(HTMLKeygenElement, "challenge");
      impl.Element.reflectEnumeratedAttribute(HTMLKeygenElement, "keytype", null,
        { rsa: "rsa" }, "rsa");

      return HTMLKeygenElement;
    });

    defineLazyProperty(impl, "HTMLLIElement", function() {
      function HTMLLIElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLLIElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLLIElement"),
      });

      impl.Element.reflectIntegerAttribute(HTMLLIElement, "value", 0);

      return HTMLLIElement;
    });

    defineLazyProperty(impl, "HTMLLabelElement", function() {
      function HTMLLabelElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLLabelElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLLabelElement"),
      });

      impl.Element.reflectStringAttribute(HTMLLabelElement, "for", "htmlFor");

      return HTMLLabelElement;
    });

    defineLazyProperty(impl, "HTMLLegendElement", function() {
      function HTMLLegendElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLLegendElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLLegendElement"),
      });

      return HTMLLegendElement;
    });

    defineLazyProperty(impl, "HTMLLinkElement", function() {
      function HTMLLinkElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLLinkElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLLinkElement"),
      });

      // XXX: still have to reflect URL attribute href
      // and DOMSettableTokenList sizes also DOMTokenList relList
      impl.Element.reflectStringAttribute(HTMLLinkElement, "rel");
      impl.Element.reflectStringAttribute(HTMLLinkElement, "media");
      impl.Element.reflectStringAttribute(HTMLLinkElement, "hreflang");
      impl.Element.reflectStringAttribute(HTMLLinkElement, "type");



      return HTMLLinkElement;
    });

    defineLazyProperty(impl, "HTMLMapElement", function() {
      function HTMLMapElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLMapElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLMapElement"),
      });

      impl.Element.reflectStringAttribute(HTMLMapElement, "name");

      return HTMLMapElement;
    });

    defineLazyProperty(impl, "HTMLMenuElement", function() {
      function HTMLMenuElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLMenuElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLMenuElement"),
      });

      impl.Element.reflectStringAttribute(HTMLMenuElement, "type");
      impl.Element.reflectStringAttribute(HTMLMenuElement, "label");

      return HTMLMenuElement;
    });

    defineLazyProperty(impl, "HTMLMetaElement", function() {
      function HTMLMetaElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLMetaElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLMetaElement"),
      });

      impl.Element.reflectStringAttribute(HTMLMetaElement, "name");
      impl.Element.reflectStringAttribute(HTMLMetaElement, "content");
      impl.Element.reflectStringAttribute(HTMLMetaElement,
        "http-equiv", "httpEquiv");

      return HTMLMetaElement;
    });

    defineLazyProperty(impl, "HTMLMeterElement", function() {
      function HTMLMeterElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLMeterElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLMeterElement"),
      });

      return HTMLMeterElement;
    });

    defineLazyProperty(impl, "HTMLModElement", function() {
      function HTMLModElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLModElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLModElement"),
      });

      impl.Element.reflectStringAttribute(HTMLModElement, "cite");
      impl.Element.reflectStringAttribute(HTMLModElement, "datetime", "dateTime");

      return HTMLModElement;
    });

    defineLazyProperty(impl, "HTMLOListElement", function() {
      function HTMLOListElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLOListElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLOListElement"),

        // Utility function (see the start attribute default value). Returns
        // the number of <li> children of this element
        _numitems: attribute(function() {
          var items = 0;
          this.childNodes.forEach(function(n) {
            if (n.nodeType === ELEMENT_NODE && n.tagName === "LI")
              items++;
          });
          return items;
        }),
      });

      impl.Element.reflectStringAttribute(HTMLOListElement, "type");
      impl.Element.reflectBooleanAttribute(HTMLOListElement, "reversed");
      impl.Element.reflectIntegerAttribute(HTMLOListElement, "start",
        function() {
          // The default value of the
          // start attribute is 1 unless
          // the list is reversed. Then it
          // is the # of li children
          if (this.reversed)
            return this._numitems;
          else
            return 1;
        });


      return HTMLOListElement;
    });

    defineLazyProperty(impl, "HTMLObjectElement", function() {
      function HTMLObjectElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLObjectElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLObjectElement"),
      });

      // impl.Element.reflectURLAttribute(HTMLObjectElement, "data");
      impl.Element.reflectStringAttribute(HTMLObjectElement, "type");
      impl.Element.reflectStringAttribute(HTMLObjectElement, "name");
      impl.Element.reflectStringAttribute(HTMLObjectElement, "usemap", "useMap");
      impl.Element.reflectBooleanAttribute(HTMLObjectElement,
        "typemustmatch", "typeMustMatch");
      impl.Element.reflectStringAttribute(HTMLObjectElement, "width");
      impl.Element.reflectStringAttribute(HTMLObjectElement, "height");

      return HTMLObjectElement;
    });

    defineLazyProperty(impl, "HTMLOptGroupElement", function() {
      function HTMLOptGroupElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLOptGroupElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLOptGroupElement"),
      });

      impl.Element.reflectBooleanAttribute(HTMLOptGroupElement, "disabled");
      impl.Element.reflectStringAttribute(HTMLOptGroupElement, "label");

      return HTMLOptGroupElement;
    });

    defineLazyProperty(impl, "HTMLOptionElement", function() {
      function HTMLOptionElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLOptionElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLOptionElement"),
      });

      impl.Element.reflectBooleanAttribute(HTMLOptionElement, "disabled");
      impl.Element.reflectBooleanAttribute(HTMLOptionElement,
        "selected", "defaultSelected");
      impl.Element.reflectStringAttribute(HTMLOptionElement, "label");

      return HTMLOptionElement;
    });

    defineLazyProperty(impl, "HTMLOutputElement", function() {
      function HTMLOutputElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLOutputElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLOutputElement"),
      });

      // XXX Reflect for/htmlFor as a settable token list
      impl.Element.reflectStringAttribute(HTMLOutputElement, "name");

      return HTMLOutputElement;
    });

    defineLazyProperty(impl, "HTMLParagraphElement", function() {
      function HTMLParagraphElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLParagraphElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLParagraphElement"),
      });

      return HTMLParagraphElement;
    });

    defineLazyProperty(impl, "HTMLParamElement", function() {
      function HTMLParamElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLParamElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLParamElement"),
      });

      return HTMLParamElement;
    });

    defineLazyProperty(impl, "HTMLPreElement", function() {
      function HTMLPreElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLPreElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLPreElement"),
      });

      return HTMLPreElement;
    });

    defineLazyProperty(impl, "HTMLProgressElement", function() {
      function HTMLProgressElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLProgressElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLProgressElement"),
      });

      impl.Element.reflectPositiveFloatAttribute(HTMLProgressElement, "max", 1.0);

      return HTMLProgressElement;
    });

    defineLazyProperty(impl, "HTMLQuoteElement", function() {
      function HTMLQuoteElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLQuoteElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLQuoteElement"),
      });

      impl.Element.reflectStringAttribute(HTMLQuoteElement, "cite");

      return HTMLQuoteElement;
    });

// HTMLScriptElement used to be here, but now has its own file.

    defineLazyProperty(impl, "HTMLSelectElement", function() {
      function HTMLSelectElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLSelectElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLSelectElement"),
      });

      impl.Element.reflectStringAttribute(HTMLSelectElement, "name");
      impl.Element.reflectBooleanAttribute(HTMLSelectElement, "disabled");
      impl.Element.reflectBooleanAttribute(HTMLSelectElement, "autofocus");

      impl.Element.reflectBooleanAttribute(HTMLSelectElement, "multiple");
      impl.Element.reflectBooleanAttribute(HTMLSelectElement, "required");
      impl.Element.reflectIntegerAttribute(HTMLSelectElement, "size", 0);

      return HTMLSelectElement;
    });

    defineLazyProperty(impl, "HTMLSourceElement", function() {
      function HTMLSourceElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLSourceElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLSourceElement"),
      });

      // impl.Element.reflectURLAttribute(HTMLSourceElement, "src");
      impl.Element.reflectStringAttribute(HTMLSourceElement, "type");
      impl.Element.reflectStringAttribute(HTMLSourceElement, "media");

      return HTMLSourceElement;
    });

    defineLazyProperty(impl, "HTMLSpanElement", function() {
      function HTMLSpanElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLSpanElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLSpanElement"),
      });

      return HTMLSpanElement;
    });

    defineLazyProperty(impl, "HTMLStyleElement", function() {
      function HTMLStyleElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLStyleElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLStyleElement"),
      });

      impl.Element.reflectStringAttribute(HTMLStyleElement, "media");
      impl.Element.reflectStringAttribute(HTMLStyleElement, "type");
      impl.Element.reflectBooleanAttribute(HTMLStyleElement, "scoped");

      return HTMLStyleElement;
    });

    defineLazyProperty(impl, "HTMLTableCaptionElement", function() {
      function HTMLTableCaptionElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLTableCaptionElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTableCaptionElement"),
      });

      return HTMLTableCaptionElement;
    });

    defineLazyProperty(impl, "HTMLTableCellElement", function() {
      function HTMLTableCellElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLTableCellElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTableCellElement"),
      });

      impl.Element.reflectIntegerAttribute(HTMLTableCellElement, "colspan", 1,
        "colSpan", 1, null, 1);
      impl.Element.reflectIntegerAttribute(HTMLTableCellElement, "rowspan", 1,
        "rowSpan");
      //XXX Also reflect settable token list headers


      return HTMLTableCellElement;
    });

    defineLazyProperty(impl, "HTMLTableColElement", function() {
      function HTMLTableColElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLTableColElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTableColElement"),
      });

      impl.Element.reflectIntegerAttribute(HTMLTableColElement, "span", 1, null,
        1, null, 1);


      return HTMLTableColElement;
    });

    defineLazyProperty(impl, "HTMLTableElement", function() {
      function HTMLTableElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLTableElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTableElement"),
      });

      impl.Element.reflectStringAttribute(HTMLTableElement, "border");

      return HTMLTableElement;
    });

    defineLazyProperty(impl, "HTMLTableRowElement", function() {
      function HTMLTableRowElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLTableRowElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTableRowElement"),
      });

      return HTMLTableRowElement;
    });

    defineLazyProperty(impl, "HTMLTableSectionElement", function() {
      function HTMLTableSectionElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLTableSectionElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTableSectionElement"),
      });

      return HTMLTableSectionElement;
    });

    defineLazyProperty(impl, "HTMLTextAreaElement", function() {
      function HTMLTextAreaElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLTextAreaElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTextAreaElement"),
      });


      impl.Element.reflectStringAttribute(HTMLTextAreaElement, "name");
      impl.Element.reflectBooleanAttribute(HTMLTextAreaElement, "disabled");
      impl.Element.reflectBooleanAttribute(HTMLTextAreaElement, "autofocus");

      impl.Element.reflectStringAttribute(HTMLTextAreaElement, "placeholder");
      impl.Element.reflectStringAttribute(HTMLTextAreaElement, "wrap");
      impl.Element.reflectStringAttribute(HTMLTextAreaElement,
        "dirname", "dirName");

      impl.Element.reflectBooleanAttribute(HTMLTextAreaElement, "required");
      impl.Element.reflectBooleanAttribute(HTMLTextAreaElement,
        "readonly", "readOnly");

      impl.Element.reflectIntegerAttribute(HTMLTextAreaElement, "rows", 2, null,
        1, null, 1);
      impl.Element.reflectIntegerAttribute(HTMLTextAreaElement, "cols", 20, null,
        1, null, 1);
      impl.Element.reflectIntegerAttribute(HTMLTextAreaElement,
        "maxlength", -1, "maxLength",
        0, null, 0);


      return HTMLTextAreaElement;
    });

    defineLazyProperty(impl, "HTMLTimeElement", function() {
      function HTMLTimeElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLTimeElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTimeElement"),
      });

      impl.Element.reflectStringAttribute(HTMLTimeElement, "datetime","dateTime");
      impl.Element.reflectBooleanAttribute(HTMLTimeElement, "pubdate", "pubDate");

      return HTMLTimeElement;
    });

    defineLazyProperty(impl, "HTMLTitleElement", function() {
      function HTMLTitleElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLTitleElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTitleElement"),
      });

      return HTMLTitleElement;
    });

    defineLazyProperty(impl, "HTMLTrackElement", function() {
      function HTMLTrackElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLTrackElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLTrackElement"),
      });

      // impl.Element.reflectURLAttribute(HTMLTrackElement, "src");
      impl.Element.reflectStringAttribute(HTMLTrackElement, "srclang");
      impl.Element.reflectStringAttribute(HTMLTrackElement, "label");
      impl.Element.reflectBooleanAttribute(HTMLTrackElement, "default");
      impl.Element.reflectEnumeratedAttribute(HTMLTrackElement, "kind", null,
        {
          subtitles: "subtitles",
          captions: "captions",
          descriptions: "descriptions",
          chapters: "chapters",
          metadata: "metadata"
        },
        "subtitles");


      return HTMLTrackElement;
    });

    defineLazyProperty(impl, "HTMLUListElement", function() {
      function HTMLUListElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLUListElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLUListElement"),
      });

      return HTMLUListElement;
    });

    defineLazyProperty(impl, "HTMLUnknownElement", function() {
      function HTMLUnknownElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLUnknownElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLUnknownElement"),
      });

      return HTMLUnknownElement;
    });

    defineLazyProperty(impl, "HTMLMediaElement", function() {
      function HTMLMediaElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLMediaElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLMediaElement"),
      });

      // impl.Element.reflectURLAttribute(HTMLMediaElement, "src");
      impl.Element.reflectStringAttribute(HTMLMediaElement,
        "crossorigin", "crossOrigin");
      impl.Element.reflectEnumeratedAttribute(HTMLMediaElement, "preload", null,
        {
          none: "none",
          metadata: "metadata",
          auto: "auto",
          "": "auto"
        },
        "metadata" // user-agent defined
      );

      impl.Element.reflectBooleanAttribute(HTMLMediaElement, "loop");
      impl.Element.reflectBooleanAttribute(HTMLMediaElement, "autoplay");
      impl.Element.reflectStringAttribute(HTMLMediaElement,
        "mediagroup", "mediaGroup");
      impl.Element.reflectBooleanAttribute(HTMLMediaElement, "controls");
      impl.Element.reflectBooleanAttribute(HTMLMediaElement,
        "muted", "defaultMuted");

      return HTMLMediaElement;
    });

    defineLazyProperty(impl, "HTMLAudioElement", function() {
      function HTMLAudioElement(doc, localName, prefix) {
        impl.HTMLMediaElement.call(this, doc, localName, prefix);
      }

      HTMLAudioElement.prototype = O.create(impl.HTMLMediaElement.prototype, {
        _idlName: constant("HTMLAudioElement"),
      });

      return HTMLAudioElement;
    });

    defineLazyProperty(impl, "HTMLVideoElement", function() {
      function HTMLVideoElement(doc, localName, prefix) {
        impl.HTMLMediaElement.call(this, doc, localName, prefix);
      }

      HTMLVideoElement.prototype = O.create(impl.HTMLMediaElement.prototype, {
        _idlName: constant("HTMLVideoElement"),
      });

      // impl.Element.reflectURLAttribute(HTMLVideoElement,"poster");
      impl.Element.reflectIntegerAttribute(HTMLVideoElement, "width", 0, null,0);
      impl.Element.reflectIntegerAttribute(HTMLVideoElement, "height", 0, null,0);

      return HTMLVideoElement;
    });

    defineLazyProperty(impl, "HTMLTableDataCellElement", function() {
      function HTMLTableDataCellElement(doc, localName, prefix) {
        impl.HTMLTableCellElement.call(this, doc, localName, prefix);
      }

      HTMLTableDataCellElement.prototype = O.create(impl.HTMLTableCellElement.prototype, {
        _idlName: constant("HTMLTableDataCellElement"),
      });

      return HTMLTableDataCellElement;
    });

    defineLazyProperty(impl, "HTMLTableHeaderCellElement", function() {
      function HTMLTableHeaderCellElement(doc, localName, prefix) {
        impl.HTMLTableCellElement.call(this, doc, localName, prefix);
      }

      HTMLTableHeaderCellElement.prototype = O.create(impl.HTMLTableCellElement.prototype, {
        _idlName: constant("HTMLTableHeaderCellElement"),
      });

      impl.Element.reflectEnumeratedAttribute(HTMLTableHeaderCellElement,
        "scope", null, {
          row: "row",
          col: "col",
          rowgroup: "rowgroup",
          colgroup: "colgroup",
        },
        "");

      return HTMLTableHeaderCellElement;
    });

    defineLazyProperty(impl, "HTMLFrameSetElement", function() {
      function HTMLFrameSetElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLFrameSetElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLFrameSetElement"),
      });

      return HTMLFrameSetElement;
    });

    defineLazyProperty(impl, "HTMLFrameElement", function() {
      function HTMLFrameElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
      }

      HTMLFrameElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLFrameElement"),
      });

      return HTMLFrameElement;
    });



    /************************************************************************
     *  src/impl/HTMLScriptElement.js
     ************************************************************************/

//@line 1 "src/impl/HTMLScriptElement.js"
    defineLazyProperty(impl, "HTMLScriptElement", function() {
      const JavaScriptMimeTypes = {
        "application/ecmascript":true,
        "application/javascript":true,
        "application/x-ecmascript":true,
        "application/x-javascript":true,
        "text/ecmascript":true,
        "text/javascript":true,
        "text/javascript1.0":true,
        "text/javascript1.1":true,
        "text/javascript1.2":true,
        "text/javascript1.3":true,
        "text/javascript1.4":true,
        "text/javascript1.5":true,
        "text/jscript":true,
        "text/livescript":true,
        "text/x-ecmascript":true,
        "text/x-javascript":true
      };


      function HTMLScriptElement(doc, localName, prefix) {
        impl.HTMLElement.call(this, doc, localName, prefix);
        // Internal script flags, used by the parser and elsewhere
        this._already_started = false;
        this._parser_inserted = false;
        this._ready_to_execute = false;
        this._force_async = true;
        this._had_async_content_attribute = false;
        this._creatorDocument = doc; // in case ownerDocument changes later
      }

      // Script elements that are not parser inserted must call _prepare() when:
      // 1) a script is inserted into the document.  (see _roothook below)
      // 2) the script's children change
      //   XXX: need to make this one happen
      //   I could use a proxy array for childNodes and handle that here
      //   That might be more efficient than adding hooks in Node.
      //   Also, I sent email to whatwg mailing list about this.
      //   Firefox actually triggers a script if a text node child
      //   changes from the empty string to non-empty, and that would
      //   be hard to have a hook for. Or, I could use the modtime thing
      //   to look for any changes on any descendant and then check the
      //   text property. The transition from "" to non-empty text would
      //   be a _prepare() trigger.  But I'm hoping that the spec will change
      //   so that any child insertion (including an empty text node) \
      //   is enough.
      //
      // 3) when the a src attribute is defined
      //   (See _newattrhook below);
      //


      HTMLScriptElement.prototype = O.create(impl.HTMLElement.prototype, {
        _idlName: constant("HTMLScriptElement"),

        // Script elements need to know when they're inserted into the
        // document, so they define this hook method
        _roothook: constant(function() {
          if (!this._parser_inserted) this._prepare();
        }),

        // The Script element needs to know when its src and async attrs are set
        _newattrhook: constant(function(name, value) {
          switch(name) {
            case 'async':
              this._force_async = false;
              break;
            case 'src':
              if (!this._parser_inserted && this.rooted) this._prepare();
              break;
          }
        }),

        // The Script element needs to know when a child is added
        // This hook is only for direct children: it does not bubble up
        _addchildhook: constant(function(child) {
          // XXX what if multiple children are added at once
          // via a DocumentFragment, do we run all of them or only the first?
          if (!this._parser_inserted && this.rooted) this._prepare();
        }),

        // Finally, it needs to know when a Text child has changed
        // This hook only gets triggered for direct children, not all
        // descendants
        _textchangehook: constant(function(child) {
          if (!this._parser_inserted && this.rooted) this._prepare();
        }),

        // The async idl attr doesn't quite reflect the async content attr
        async: attribute(
          function() {
            if (this._force_async) return true;
            return this.getAttribute("async");
          },
          function(value) {
            this._force_async = false;
            if (value) {
              this._setattr("async", "");
            }
            else {
              this.removeAttribute("async");
            }
          }
        ),

        text: attribute(
          function() {
            var s = "";
            for(var i = 0, n = this.childNodes.length; i < n; i++) {
              var child = this.childNodes[i];
              if (child.nodeType === TEXT_NODE)
                s += child._data;
            }
            return s;
          },
          function(value) {
            this.removeChildren();
            if (value !== null && value !== "") {
              this.appendChild(this.ownerDocument.createTextNode(value));
            }
          }
        ),

        // The HTML "Prepare a Script" algorithm
        _prepare: constant(function() {
          // If the script element is marked as having "already started",
          // then the user agent must abort these steps at this point. The
          // script is not executed.
          if (this._already_started) return;

          // If the element has its "parser-inserted" flag set, then set
          // was-parser-inserted to true and unset the element's
          // "parser-inserted" flag. Otherwise, set was-parser-inserted to
          // false.
          var was_parser_inserted = this._parser_inserted;
          this._parser_inserted = false;

          // If was-parser-inserted is true and the element does not have an
          // async attribute, then set the element's "force-async" flag to
          // true.
          if (was_parser_inserted && !this.hasAttribute("async"))
            this._force_async = true;

          // If the element has no src attribute, and its child nodes, if
          // any, consist only of comment nodes and empty text nodes, then
          // the user agent must abort these steps at this point. The script
          // is not executed.
          if (!this.hasAttribute("src") && this.text === "") return;

          // If the element is not in a Document, then the user agent must
          // abort these steps at this point. The script is not executed.
          if (!this.rooted) return;

          // If either:
          //     the script element has a type attribute and its value is the
          //     empty string, or the script element has no type attribute
          //     but it has a language attribute and that attribute's value
          //     is the empty string, or the script element has neither a
          //     type attribute nor a language attribute, then
          //
          // ...let the script block's type for this script element be
          // "text/javascript".
          //
          // Otherwise, if the script element has a type attribute, let the
          // script block's type for this script element be the value of that
          // attribute with any leading or trailing sequences of space
          // characters removed.
          //
          // Otherwise, the element has a non-empty language attribute; let
          // the script block's type for this script element be the
          // concatenation of the string "text/" followed by the value of the
          // language attribute.
          //
          // The language attribute is never conforming, and is always
          // ignored if there is a type attribute present.
          var hastype = this.hasAttribute("type");
          var typeattr = hastype ? this.getAttribute("type") : undefined;
          var haslang = this.hasAttribute("language");
          var langattr = haslang ? this.getAttribute("language") : undefined;
          var scripttype;

          if ((typeattr === "") ||
            (!hastype && langattr === "") ||
            (!hastype && !haslang)) {
            scripttype = "text/javascript";
          }
          else if (hastype) {
            // Can't use trim() here, because it has a different
            // definition of whitespace than html does
            scripttype = htmlTrim(typeattr);
          }
          else {
            scripttype = "text/" + langattr;
          }

          // If the user agent does not support the scripting language given
          // by the script block's type for this script element, then the
          // user agent must abort these steps at this point. The script is
          // not executed.
          if (!JavaScriptMimeTypes[toLowerCase(scripttype)]) return;

          // If was-parser-inserted is true, then flag the element as
          // "parser-inserted" again, and set the element's "force-async"
          // flag to false.
          if (was_parser_inserted) {
            this._parser_inserted = true;
            this._force_async = false;
          }

          // The user agent must set the element's "already started" flag.
          this._already_started = true;

          // The state of the element at this moment is later used to
          // determine the script source.
          this._script_text = this.text;  // We'll use this in _execute

          // If the element is flagged as "parser-inserted", but the
          // element's Document is not the Document of the parser that
          // created the element, then abort these steps.
          if (this._parser_inserted &&
            this.ownerDocument !== this._creatorDocument)
            return;  // Script was moved to a new document

          // If scripting is disabled for the script element, then the user
          // agent must abort these steps at this point. The script is not
          // executed.
          //
          // The definition of scripting is disabled means that, amongst
          // others, the following scripts will not execute: scripts in
          // XMLHttpRequest's responseXML documents, scripts in
          // DOMParser-created documents, scripts in documents created by
          // XSLTProcessor's transformToDocument feature, and scripts that
          // are first inserted by a script into a Document that was created
          // using the createDocument() API. [XHR] [DOMPARSING] [DOMCORE]
          //
          // XXX: documents with a browsing context have scripting on
          // (except iframes with the sandbox attr). Standalone docs do not.
          // Its not clear to me when I should set this flag.  dom.js is
          // in a weird situation since we don't really have a window yet,
          // but we do want to run scripts.  For now, I think I'll have
          // the parser set this, and also set it on the initial
          // global document.
          //
          if (!this.ownerDocument._scripting_enabled) return;

          // If the script element has an event attribute and a for
          // attribute, then run these substeps:
          //
          //     Let for be the value of the for attribute.
          //
          //     Let event be the value of the event attribute.
          //
          //     Strip leading and trailing whitespace from event and for.
          //
          //     If for is not an ASCII case-insensitive match for the string
          //     "window", then the user agent must abort these steps at this
          //     point. The script is not executed.
          //
          //     If event is not an ASCII case-insensitive match for either
          //     the string "onload" or the string "onload()", then the user
          //     agent must abort these steps at this point. The script is
          //     not executed.

          var forattr = this.getAttribute("for") || "";
          var eventattr = this.getAttribute("event") || "";
          if (forattr || eventattr) {
            forattr = toLowerCase(htmlTrim(forattr));
            eventattr = toLowerCase(htmlTrim(eventattr));
            if (forattr !== "window" ||
              (event !== "onload" && event !== "onload()"))
              return;
          }


          // If the script element has a charset attribute, then let the
          // script block's character encoding for this script element be the
          // encoding given by the charset attribute.
          //
          // Otherwise, let the script block's fallback character encoding
          // for this script element be the same as the encoding of the
          // document itself.
          //
          // Only one of these two pieces of state is set.
          if (this.hasAttribute("charset")) {
            // XXX: ignoring charset issues for now
          }
          else {
            // XXX: ignoring charset issues for now
          }

          // If the element has a src attribute whose value is not the empty
          // string, then the value of that attribute must be resolved
          // relative to the element, and if that is successful, the
          // specified resource must then be fetched, from the origin of the
          // element's Document.
          //
          // If the src attribute's value is the empty string or if it could
          // not be resolved, then the user agent must queue a task to fire a
          // simple event named error at the element, and abort these steps.
          //
          // For historical reasons, if the URL is a javascript: URL, then
          // the user agent must not, despite the requirements in the
          // definition of the fetching algorithm, actually execute the
          // script in the URL; instead the user agent must act as if it had
          // received an empty HTTP 400 response.
          //
          // For performance reasons, user agents may start fetching the
          // script as soon as the attribute is set, instead, in the hope
          // that the element will be inserted into the document. Either way,
          // once the element is inserted into the document, the load must
          // have started. If the UA performs such prefetching, but the
          // element is never inserted in the document, or the src attribute
          // is dynamically changed, then the user agent will not execute the
          // script, and the fetching process will have been effectively
          // wasted.
          if (this.hasAttribute("src")) {
            // XXX
            // The spec for handling this is really, really complicated.
            // For now, I'm just going to try to get something basic working

            var url = this.getAttribute("src");

            if (isFaceted(url)) {
              url = window.policyEnv.concretize(null, url);
            }

            if (this.ownerDocument._parser) {
              this.ownerDocument._parser.pause();
            }

            /*
             // XXX: this is a hack
             // If we're running in node, and the document has an
             // _address, then we can resolve the URL
             if (this.ownerDocument._address &&
             typeof require === "function") {
             url = require('url').resolve(this.ownerDocument._address,
             url);
             }
             */
            // Resolve the script url against the document url
            var documenturl = new URL(this.ownerDocument.defaultView.location.href);
            url = documenturl.resolve(url);


            // XXX: this is experimental
            // If we're in a web worker, use importScripts
            // to load and execute the script.
            // Maybe this will give us better error messages
            if (global.importScripts) {
              try {
                importScripts(url);
              }
              catch(e) {
                error(e + " " + e.stack);
              }
              finally {
                this.ownerDocument._parser.resume();
              }
            }
            else {

              var script = this;
              var xhr = new XMLHttpRequest();

              // Web workers support this handler but not the old
              // onreadystatechange handler
              xhr.onloadend = function() {
                if (xhr.status === 200 ||
                  xhr.status === 0 /* file:// urls */) {
                  script._script_text = xhr.responseText;
                  script._execute();
                  delete script._script_text;
                }
                // Do this even if we failed
                if (script.ownerDocument._parser) {
                  script.ownerDocument._parser.resume();
                }
              };

              // My node version of XHR responds to this handler but
              // not to onloadend above.
              xhr.onreadystatechange = function() {
                if (xhr.readyState !== 4) return;
                if (xhr.status === 200 ||
                  xhr.status === 0 /* file:// urls */) {
                  script._script_text = xhr.responseText;
                  script._execute();
                  delete script._script_text;
                }

                // Do this even if we failed
                if (script.ownerDocument._parser) {
                  script.ownerDocument._parser.resume();
                }
              }

              xhr.open("GET", url);
              xhr.send();
            }
          }
          else {

            // XXX
            // Just execute inlines scripts now.
            // Later, I've got to deal with the all the cases below

            this._execute();
          }

          // Then, the first of the following options that describes the
          // situation must be followed:

          // If the element has a src attribute, and the element has a defer
          // attribute, and the element has been flagged as
          // "parser-inserted", and the element does not have an async
          // attribute

          //     The element must be added to the end of the list of scripts
          //     that will execute when the document has finished parsing
          //     associated with the Document of the parser that created the
          //     element.

          //     The task that the networking task source places on the task
          // queue once the fetching algorithm has completed must set the
          // element's "ready to be parser-executed" flag. The parser will
          // handle executing the script.  If the element has a src
          // attribute, and the element has been flagged as
          // "parser-inserted", and the element does not have an async
          // attribute

          //     The element is the pending parsing-blocking script of the
          //     Document of the parser that created the element. (There can
          //     only be one such script per Document at a time.)

          //     The task that the networking task source places on the task
          // queue once the fetching algorithm has completed must set the
          // element's "ready to be parser-executed" flag. The parser will
          // handle executing the script.  If the element does not have a src
          // attribute, and the element has been flagged as
          // "parser-inserted", and the Document of the HTML parser or XML
          // parser that created the script element has a style sheet that is
          // blocking scripts

          //     The element is the pending parsing-blocking script of the
          //     Document of the parser that created the element. (There can
          //     only be one such script per Document at a time.)

          //     Set the element's "ready to be parser-executed" flag. The
          // parser will handle executing the script.  If the element has a
          // src attribute, does not have an async attribute, and does not
          // have the "force-async" flag set

          //     The element must be added to the end of the list of scripts
          //     that will execute in order as soon as possible associated
          //     with the Document of the script element at the time the
          //     prepare a script algorithm started.

          //     The task that the networking task source places on the task
          //     queue once the fetching algorithm has completed must run the
          //     following steps:

          //         If the element is not now the first element in the list
          //         of scripts that will execute in order as soon as
          //         possible to which it was added above, then mark the
          //         element as ready but abort these steps without executing
          //         the script yet.

          //         Execution: Execute the script block corresponding to the
          //         first script element in this list of scripts that will
          //         execute in order as soon as possible.

          //         Remove the first element from this list of scripts that
          //         will execute in order as soon as possible.

          //         If this list of scripts that will execute in order as
          //         soon as possible is still not empty and the first entry
          //         has already been marked as ready, then jump back to the
          //         step labeled execution.

          // If the element has a src attribute

          //     The element must be added to the set of scripts that will
          //     execute as soon as possible of the Document of the script
          //     element at the time the prepare a script algorithm started.

          //     The task that the networking task source places on
          //     the task queue once the fetching algorithm has
          //     completed must execute the script block and then
          //     remove the element from the set of scripts that
          //     will execute as soon as possible.
          //
          // Otherwise The user agent must immediately execute the
          // script block, even if other scripts are already
          // executing.
        }),

        _execute: constant(function() {
          // We test this in _prepare(), but the spec says we
          // have to check again here.
          if (this._parser_inserted &&
            this.ownerDocument !== this._creatorDocument) return;

          // XXX
          // For now, we're just doing inline scripts, so I'm skipping
          // the steps about if the load was not successful.
          var code = this._script_text;

          // If the script is from an external file, then increment the
          // ignore-destructive-writes counter of the script element's
          // Document. Let neutralized doc be that Document.
          // XXX: ignoring this for inline scripts for now.

          // XXX
          // There is actually more to executing a script than this.
          // See http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#create-a-script
          try {
// XXX For now, we're just assuming that there is never more than
// one document at a time, and all scripts get executed against the
// same global object.
//                var olddoc = global.document;
//                global.document = wrap(this.ownerDocument);
            //evalScript(code);
            eval(code);
//                global.document = olddoc;
          }
          catch(e) {
            // XXX fire an onerror event before reporting
            error(e + " " + e.stack);
          }

          // Decrement the ignore-destructive-writes counter of neutralized
          // doc, if it was incremented in the earlier step.

          // If the script is from an external file, fire a simple event
          // named load at the script element.

          // Otherwise, the script is internal; queue a task to fire a simple
          // event named load at the script element.

        }),
      });

      // XXX impl.Element.reflectURLAttribute(HTMLScriptElement, "src");
      impl.Element.reflectStringAttribute(HTMLScriptElement, "type");
      impl.Element.reflectStringAttribute(HTMLScriptElement, "charset");
      impl.Element.reflectBooleanAttribute(HTMLScriptElement, "defer");


      return HTMLScriptElement;
    });

    /************************************************************************
     *  src/impl/URL.js
     ************************************************************************/

//@line 1 "src/impl/URL.js"
    function URL(url) {
      if (!url) return Object.create(URL.prototype);
      // Can't use String.trim() since it defines whitespace differently than HTML
      this.url = url.replace(/^[ \t\n\r\f]+|[ \t\n\r\f]+$/g, "");

      // See http://tools.ietf.org/html/rfc3986#appendix-B
      var match = URL.pattern.exec(this.url);
      if (match) {
        if (match[2]) this.scheme = match[2];
        if (match[4]) {
          // XXX ignoring userinfo before the hostname
          if (match[4].match(URL.portPattern)) {
            var pos = S.lastIndexOf(match[4], ":");
            this.host = substring(match[4], 0, pos);
            this.port = substring(match[4], pos+1);
          }
          else {
            this.host = match[4];
          }
        }
        if (match[5]) this.path = match[5];
        if (match[6]) this.query = match[7];
        if (match[8]) this.fragment = match[9];
      }
    }

    URL.pattern = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/;
    URL.portPattern = /:\d+$/
    URL.authorityPattern = /^[^:\/?#]+:\/\//;
    URL.hierarchyPattern = /^[^:\/?#]+:\//;

// Return a percentEncoded version of s.
// S should be a single-character string
// XXX: needs to do utf-8 encoding?
    URL.percentEncode = function percentEncode(s) {
      var c = charCodeAt(s, 0);
      if (c < 256) return "%" + c.toString(16);
      else throw Error("can't percent-encode codepoints > 255 yet");
    };

    URL.prototype = {
      constructor: URL,

      // XXX: not sure if this is the precise definition of absolute
      isAbsolute: function() { return !!this.scheme; },
      isAuthorityBased: function() {
        return URL.authorityPattern.test(this.url);
      },
      isHierarchical: function() {
        return URL.hierarchyPattern.test(this.url);
      },

      toString: function() {
        var s = "";
        if (this.scheme !== undefined) s += this.scheme + ":";
        if (this.host !== undefined) s += "//" + this.host;
        if (this.port !== undefined) s += ":" + this.port;
        if (this.path !== undefined) s += this.path;
        if (this.query !== undefined) s += "?" + this.query;
        if (this.fragment !== undefined) s += "#" + this.fragment;
        return s;
      },

      // See: http://tools.ietf.org/html/rfc3986#section-5.2
      resolve: function(relative) {
        var base = this;            // The base url we're resolving against
        var r = new URL(relative);  // The relative reference url to resolve
        var t = new URL();          // The absolute target url we will return

        if (r.scheme !== undefined) {
          t.scheme = r.scheme;
          t.host = r.host;
          t.port = r.port;
          t.path = remove_dot_segments(r.path);
          t.query = r.query;
        }
        else {
          t.scheme = base.scheme;
          if (r.host !== undefined) {
            t.host = r.host;
            t.port = r.port;
            t.path = remove_dot_segments(r.path);
            t.query = r.query;
          }
          else {
            t.host = base.host;
            t.port = base.port;
            if (!r.path) { // undefined or empty
              t.path = base.path;
              if (r.query !== undefined)
                t.query = r.query;
              else
                t.query = base.query;
            }
            else {
              if (r.path.charAt(0) === "/") {
                t.path = remove_dot_segments(r.path);
              }
              else {
                t.path = merge(base.path, r.path);
                t.path = remove_dot_segments(t.path);
              }
              t.query = r.query;
            }
          }
        }
        t.fragment = r.fragment;

        return t.toString();


        function merge(basepath, refpath) {
          if (base.host !== undefined && !base.path)
            return "/" + refpath;

          var lastslash = basepath.lastIndexOf("/");
          if (lastslash === -1)
            return refpath;
          else
            return basepath.substring(0, lastslash+1) + refpath;
        }

        function remove_dot_segments(path) {
          if (!path) return path;  // For "" or undefined

          var output = "";
          while(path.length > 0) {
            if (path === "." || path === "..") {
              path = "";
              break;
            }

            var twochars = path.substring(0,2);
            var threechars = path.substring(0,3);
            var fourchars = path.substring(0,4);
            if (threechars === "../") {
              path = path.substring(3);
            }
            else if (twochars === "./") {
              path = path.substring(2);
            }
            else if (threechars === "/./") {
              path = "/" + path.substring(3);
            }
            else if (twochars === "/." && path.length === 2) {
              path = "/";
            }
            else if (fourchars === "/../" ||
              (threechars === "/.." && path.length === 3)) {
              path = "/" + path.substring(4);

              output = output.replace(/\/?[^\/]*$/, "");
            }
            else {
              var segment = path.match(/(\/?([^\/]*))/)[0];
              output += segment;
              path = path.substring(segment.length);
            }
          }


          return output;
        }
      },
    };



    /************************************************************************
     *  src/impl/URLDecompositionAttributes.js
     ************************************************************************/

//@line 1 "src/impl/URLDecompositionAttributes.js"
// This is an abstract superclass for Location, HTMLAnchorElement and
// other types that have the standard complement of "URL decomposition
// IDL attributes".
// Subclasses must define getInput() and setOutput() methods.
// The getter and setter methods parse and rebuild the URL on each
// invocation; there is no attempt to cache the value and be more efficient
    function URLDecompositionAttributes() {}
    URLDecompositionAttributes.prototype = {
      constructor: URLDecompositionAttributes,

      get protocol() {
        var url = new URL(this.getInput());
        if (url.isAbsolute()) return url.scheme + ":";
        else return "";
      },

      get host() {
        var url = new URL(this.getInput());
        if (url.isAbsolute() && url.isAuthorityBased())
          return url.host + (url.port ? (":" + url.port) : "");
        else
          return "";
      },

      get hostname() {
        var url = new URL(this.getInput());
        if (url.isAbsolute() && url.isAuthorityBased())
          return url.host;
        else
          return "";
      },

      get port() {
        var url = new URL(this.getInput());
        if (url.isAbsolute() && url.isAuthorityBased() && url.port!==undefined)
          return url.port;
        else
          return "";
      },

      get pathname() {
        var url = new URL(this.getInput());
        if (url.isAbsolute() && url.isHierarchical())
          return url.path;
        else
          return "";
      },

      get search() {
        var url = new URL(this.getInput());
        if (url.isAbsolute() && url.isHierarchical() && url.query!==undefined)
          return "?" + url.query;
        else
          return "";
      },

      get hash() {
        var url = new URL(this.getInput());
        if (url.isAbsolute() && url.fragment != undefined)
          return "#" + url.fragment;
        else
          return "";
      },


      set protocol(v) {
        var output = this.getInput();
        var url = new URL(output);
        if (url.isAbsolute()) {
          v = v.replace(/:+$/, "");
          v = v.replace(/[^-+\.a-zA-z0-9]/g, URL.percentEncode);
          if (v.length > 0) {
            url.scheme = v;
            output = url.toString();
          }
        }
        this.setOutput(output);
      },

      set host(v) {
        var output = this.getInput();
        var url = new URL(output);
        if (url.isAbsolute() && url.isAuthorityBased()) {
          v = v.replace(/[^-+\._~!$&'()*,;:=a-zA-z0-9]/g, URL.percentEncode);
          if (v.length > 0) {
            url.host = v;
            delete url.port;
            output = url.toString();
          }
        }
        this.setOutput(output);
      },

      set hostname(v) {
        var output = this.getInput();
        var url = new URL(output);
        if (url.isAbsolute() && url.isAuthorityBased()) {
          v = v.replace(/^\/+/, "");
          v = v.replace(/[^-+\._~!$&'()*,;:=a-zA-z0-9]/g, URL.percentEncode);
          if (v.length > 0) {
            url.host = v;
            output = url.toString();
          }
        }
        this.setOutput(output);
      },

      set port(v) {
        var output = this.getInput();
        var url = new URL(output);
        if (url.isAbsolute() && url.isAuthorityBased()) {
          v = v.replace(/[^0-9].*$/, "");
          v = v.replace(/^0+/, "");
          if (v.length === 0) v = "0";
          if (parseInt(v, 10) <= 65535) {
            url.port = v;
            output = url.toString();
          }
        }
        this.setOutput(output);
      },

      set pathname(v) {
        var output = this.getInput();
        var url = new URL(output);
        if (url.isAbsolute() && url.isHierarchical()) {
          if (v.charAt(0) !== "/")
            v = "/" + v;
          v = v.replace(/[^-+\._~!$&'()*,;:=@\/a-zA-z0-9]/g,
            URL.percentEncode);
          url.path = v;
          output = url.toString();
        }
        this.setOutput(output);
      },

      set search(v) {
        var output = this.getInput();
        var url = new URL(output);
        if (url.isAbsolute() && url.isHierarchical()) {
          if (v.charAt(0) !== "?") v = v.substring(1);
          v = v.replace(/[^-+\._~!$&'()*,;:=@\/?a-zA-z0-9]/g,
            URL.percentEncode);
          url.query = v;
          output = url.toString();
        }
        this.setOutput(output);
      },

      set hash(v) {
        var output = this.getInput();
        var url = new URL(output);
        if (url.isAbsolute()) {
          if (v.charAt(0) !== "#") v = v.substring(1);
          v = v.replace(/[^-+\._~!$&'()*,;:=@\/?a-zA-z0-9]/g,
            URL.percentEncode);
          url.fragment = v;
          output = url.toString();
        }
        this.setOutput(output);
      }
    }



    /************************************************************************
     *  src/impl/Location.js
     ************************************************************************/

//@line 1 "src/impl/Location.js"
    function Location(window, href) {
      this._window = window;
      this._href = href;
    }

    Location.prototype = Object.create(URLDecompositionAttributes.prototype, {
      _idlName: constant("Location"),
      constructor: constant(Location),
      // The concrete methods that the superclass needs
      getInput: constant(function() { return this.href; }),
      setOutput: constant(function(v) { this.href = v; }),

      // Special behavior when href is set
      href: attribute(
        function() { return this._href; },
        function(v) { this.assign(v) }
      ),

      assign: constant(function(url) {
        // Resolve the new url against the current one
        // XXX:
        // This is not actually correct. It should be resolved against
        // the URL of the document of the script. For now, though, I only
        // support a single window and there is only one base url.
        // So this is good enough for now.
        var current = new URL(this._href);
        var newurl = current.resolve(url);
        var self = this; // for the XHR callback below

        // Save the new url
        this._href = newurl;

        // Start loading the new document!
        // XXX
        // This is just something hacked together.
        // The real algorithm is: http://www.whatwg.org/specs/web-apps/current-work/multipage/history.html#navigate
        var xhr = new XMLHttpRequest();

        xhr.onload = function() {
          var olddoc = self._window.document;
          var parser = new HTMLParser(newurl);
          var newdoc = unwrap(parser.document());
          newdoc.mutationHandler = olddoc.mutationHandler;

          // Get rid of any current content in the old doc
          // XXX
          // Should we have a special mutation event that means
          // discard the entire document because we're loading a new one?
          while(olddoc.hasChildNodes()) olddoc.removeChild(olddoc.firstChild);

          // Make the new document the current document in the window
          self._window.document = newdoc;
          newdoc.defaultView = self._window;

          // And parse the new file
          parser.parse(xhr.responseText, true);
        };

        xhr.open("GET", newurl);
        xhr.send();

      }),

      replace: constant(function(url) {
        // XXX
        // Since we aren't tracking history yet, replace is the same as assign
        this.assign(url);
      }),

      reload: constant(function() {
        // XXX:
        // Actually, the spec is a lot more complicated than this
        this.assign(this.href);
      }),

      // XXX: Does WebIDL allow the wrapper class to have its own toString
      // method? Or do I have to create a proxy just to fake out the string
      // conversion?
      // In FF, document.location.__proto__.hasOwnProperty("toString") is true
      toString: constant(function() {
        return this.href;
      }),
    });



    /************************************************************************
     *  src/impl/Window.js
     ************************************************************************/

//@line 1 "src/impl/Window.js"
// This is a simple constructor for a simple Window implementation
// We'll set things up (in src/main.js for now) so that it unwraps
// to the global object
    function Window() {
      this.document = new impl.DOMImplementation().createHTMLDocument("");
      this.document._scripting_enabled = true;
      this.policyEnv = new PolicyEnvironment();
      this.document.defaultView = this;
      this.location = new Location(this, "about:blank");
    }

    Window.prototype = O.create(impl.EventTarget.prototype, {
      _idlName: constant("Window"),

      history: constant({
        back: nyi,
        forward: nyi,
        go: nyi,
        _idlName: "History"
      }),

      navigator: constant({
        appName: "dom.js",
        appVersion: "0.1",
        platform: "JavaScript!",
        userAgent: "Servo",
        _idlName: "Navigator"
      }),

      // Self-referential properties
      window: attribute(function() { return this; }),
      self: attribute(function() { return this; }),
      frames: attribute(function() { return this; }),

      // Self-referential properties for a top-level window
      parent: attribute(function() { return this; }),
      top: attribute(function() { return this; }),

      // We don't support any other windows for now
      length: constant(0),           // no frames
      frameElement: constant(null),  // not part of a frame
      opener: constant(null),        // not opened by another window

      // The onload event handler.
      // XXX: need to support a bunch of other event types, too,
      // and have them interoperate with document.body.

      onload: attribute(
        function() {
          return this._getEventHandler("load");
        },
        function(v) {
          this._setEventHandler("load", v);
        }
      ),

      policyEnv: attribute(function() { return this.policyEnv; }),


    });



    /************************************************************************
     *  src/main.js
     ************************************************************************/

//@line 1 "src/main.js"
    /*
     // The document object is the entry point to the entire DOM
     defineLazyProperty(global, "document", function() {
     var doc = new impl.DOMImplementation().createHTMLDocument("");
     doc._scripting_enabled = true;
     return wrap(doc);
     });
     */

// Create a window implementation object
    var w = new Window();  // See src/impl/Window.js

// Arrange to have it wrap to the global object
// And have the global object unwrap to w
    w._idl = global;
    wmset(idlToImplMap, global, w);

// Now define window properties that do the right thing
// For other wrapper types this is automated by tools/idl2domjs
// but the window object is a special case.

    [
      "window",
      "self",
      "frames",
      "parent",
      "top",
      "opener",
      "document",
      "history",
      "navigator"
    ].forEach(function(property) {
      Object.defineProperty(global, property, {
        get: function() {
          return wrap(unwrap(this)[property]);
        },
        enumerable: false,
        configurable: true, // XXX: check this
      });
    });

    Object.defineProperty(global, "location", {
      get: function() {
        return wrap(unwrap(this).location);
      },
      set: function(v) {
        unwrap(this).location.href = v;
      },
      enumerable: false,
      configurable: true, // XXX: check this
    });


    Object.defineProperty(global, "onload", {
      get: function() {
        return unwrap(this).onload;
      },
      set: function(v) {
        unwrap(this).onload = toCallbackOrNull(v);
      },
      enumerable: true,
      configurable: true
    });


    global.addEventListener = function addEventListener(type, listener, capture) {
      unwrap(this).addEventListener(
        String(type),
        toCallbackOrNull(listener),
        OptionalBoolean(capture));
    };

    global.removeEventListener = function addEventListener(type, listener, capture){
      unwrap(this).removeEventListener(
        String(type),
        toCallbackOrNull(listener),
        OptionalBoolean(capture));
    };

// XXX
// This is a completely broken implementation put here just to see if we
// can get jQuery animations to work
//
    global.getComputedStyle = function getComputedStyle(elt) {
      return elt.style;
    };
}(this));
