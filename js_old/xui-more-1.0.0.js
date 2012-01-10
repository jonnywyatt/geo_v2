/*
    http://www.JSON.org/json2.js
    2010-08-25

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());


/*
 * XUI JavaScript Library v1.0.0
 * http://xuijs.com
 * 
 * Copyright (c) 2009 Brian LeRoux, Rob Ellis, Brock Whitten
 * Licensed under the MIT license.
 * 
 * Date: 2010-05-28T10:05:06-07:00
 */
(function() {

    var undefined,
        xui,
        window     = this,
        string     = ('string'), // prevents Goog compiler from removing primative and subsidising out allowing us to compress further
        document   = window.document,      // obvious really
        simpleExpr = /^#?([\w-]+)$/,   // for situations of dire need. Symbian and the such        
        idExpr     = /^#/,
        tagExpr    = /<([\w:]+)/, // so you can create elements on the fly a la x$('<img href="/foo" /><strong>yay</strong>')
        slice      = function (e) { return [].slice.call(e, 0); };
        try { var a = slice(document.documentElement.childNodes)[0].nodeType; }
        catch(e){ slice = function (e) { var ret=[]; for (var i=0; e[i]; i++) ret.push(e[i]); return ret; }; }
		
    window.x$ = window.xui = xui = function(q, context) {
        return new xui.fn.find(q, context);
    };

    // patch in forEach to help get the size down a little and avoid over the top currying on event.js_old and dom.js_old (shortcuts)
    if (! [].forEach) {
        Array.prototype.forEach = function(fn) {
            var len = this.length || 0,
                i = 0;
                that = arguments[1]; // wait, what's that!? awwww rem. here I thought I knew ya!
                                     // @rem - that that is a hat tip to your thats :)

            if (typeof fn == 'function') {
                for (; i < len; i++) {
                    fn.call(that, this[i], i, this);
                }
            }
        };
    }
    /**
     * Array Remove - By John Resig (MIT Licensed) 
     */
    function removex(array, from, to) {
        var rest = array.slice((to || from) + 1 || array.length);
        array.length = from < 0 ? array.length + from: from;
        return array.push.apply(array, rest);
    }

    xui.fn = xui.prototype = {

        extend: function(o) {
            for (var i in o) {
                xui.fn[i] = o[i];
            }
        },

        find: function(q, context) {
            var ele = [], tempNode;
                
            if (!q) {
                return this;
            } else if (context == undefined && this.length) {
                ele = this.each(function(el) {
                    ele = ele.concat(slice(xui(q, el)));
                }).reduce(ele);
            } else {
                context = context || document;
                // fast matching for pure ID selectors and simple element based selectors
                if (typeof q == string) {
                  if (simpleExpr.test(q)) {
                      ele = idExpr.test(q) ? [context.getElementById(q.substr(1))] : context.getElementsByTagName(q);
                  // match for full html tags to create elements on the go
                  } else if (tagExpr.test(q)) {
                      tempNode = document.createElement('i');
                      tempNode.innerHTML = q;
                      slice(tempNode.childNodes).forEach(function (el) {
                        ele.push(el);
                      });
                  } else {
                      // one selector, check if Sizzle is available and use it instead of querySelectorAll.
                      if (window.Sizzle !== undefined) {
                        ele = Sizzle(q);
                      } else {
                        ele = context.querySelectorAll(q);
                      }
                  }
                  // blanket slice
                  ele = slice(ele);
                } else if (q instanceof Array) {
                    ele = q;
                } else if (q.toString() == '[object NodeList]') {
                    ele = slice(q);
                } else {
                    // an element was passed in
                    ele = [q];
                }
            }
            // disabling the append style, could be a plugin (found in more/base):
            // xui.fn.add = function (q) { this.elements = this.elements.concat(this.reduce(xui(q).elements)); return this; }
            return this.set(ele);
        },

        /** 
         * Resets the body of elements contained in XUI
         * Note that due to the way this.length = 0 works
         * if you do console.dir() you can still see the 
         * old elements, but you can't access them. Confused?
         */
        set: function(elements) {
            var ret = xui();
            ret.cache = slice(this.length ? this : []);
            ret.length = 0;
            [].push.apply(ret, elements);
            return ret;
        },

        /**
        * Array Unique
        */
        reduce: function(elements, b) {
            var a = [],
            elements = elements || slice(this);
            elements.forEach(function(el) {
                // question the support of [].indexOf in older mobiles (RS will bring up 5800 to test)
                if (a.indexOf(el, 0, b) < 0)
                a.push(el);
            });

            return a;
        },

        /**
         * Has modifies the elements array and reurns all the elements that match (has) a CSS Query
         */
         has: function(q) {
             var list = xui(q);
             return this.filter(function () {
                 var that = this;
                 var found = null;
                 list.each(function (el) {
                     found = (found || el == that);
                 });
                 return found;
             });
         },

        /**
         * Both an internal utility function, but also allows developers to extend xui using custom filters
         */
        filter: function(fn) {
            var elements = [];
            return this.each(function(el, i) {
                if (fn.call(el, i)) elements.push(el);
            }).set(elements);
        },

        /**
         * Not modifies the elements array and reurns all the elements that DO NOT match a CSS Query
         */
        not: function(q) {
            var list = slice(this);
            return this.filter(function(i) {
                var found;
                xui(q).each(function(el) {
                    return found = list[i] != el;
                });
                return found;
            });
        },


        /**
         * Element iterator.
         * 
         * @return {XUI} Returns the XUI object. 
         */
        each: function(fn) {
            // we could compress this by using [].forEach.call - but we wouldn't be able to support
            // fn return false breaking the loop, a feature I quite like.
            for (var i = 0, len = this.length; i < len; ++i) {
                if (fn.call(this[i], this[i], i, this) === false)
                break;
            }
            return this;
        }
    };

    xui.fn.find.prototype = xui.fn;
    xui.extend = xui.fn.extend;

      // --- 
    /**
     *
     * @namespace {Dom}
     * @example
     *
     * Dom
     * ---
     *	
     * Manipulating the Document Object Model aka the DOM.
     * 
     */
    xui.extend({
    
        /**
    	 * For manipulating HTML markup in the DOM.
    	 *	
    	 * syntax:
    	 *
    	 * 		x$(window).html( location, html );
    	 *
    	 * or this method will accept just an html fragment with a default behavior of inner..
    	 *
    	 * 		x$(window).html( htmlFragment );
    	 * 
    	 * arguments:
    	 * 
    	 * - location:string can be one of inner, outer, top, bottom
    	 * - html:string any string of html markup or HTMLElement
    	 *
    	 * example:
    	 *
    	 *  	x$('#foo').html( 'inner',  '<strong>rock and roll</strong>' );
    	 *  	x$('#foo').html( 'outer',  '<p>lock and load</p>' );
    	 * 		x$('#foo').html( 'top',    '<div>bangers and mash</div>');
    	 *  	x$('#foo').html( 'bottom', '<em>mean and clean</em>');
    	 *  	x$('#foo').html( 'remove');	
    	 *  	x$('#foo').html( 'before', '<p>some warmup html</p>');
    	 *  	x$('#foo').html( 'after', '<p>more html!</p>');
    	 * 
    	 * or
    	 * 
    	 * 		x$('#foo').html('<p>sweet as honey</p>');
    	 * 
    	 */
        html: function(location, html) {
            clean(this);
    
            if (arguments.length == 0) {
                return this[0].innerHTML;
            }
            if (arguments.length == 1 && arguments[0] != 'remove') {
                html = location;
                location = 'inner';
            }
    
            return this.each(function(el) {
                var parent, 
                    list, 
                    len, 
                    i = 0;
                if (location == "inner") {
                    if (typeof html == string) {
                        el.innerHTML = html;
                        list = el.getElementsByTagName('SCRIPT');
                        len = list.length;
                        for (; i < len; i++) {
                            eval(list[i].text);
                        }
                    } else {
                        el.innerHTML = '';
                        el.appendChild(html);
                    }
                } else if (location == "outer") {
                    el.parentNode.replaceChild(wrapHelper(html, el), el);
                } else if (location == "top") {
                    el.insertBefore(wrapHelper(html, el), el.firstChild);
                } else if (location == "bottom") {
                    el.insertBefore(wrapHelper(html, el), null);
                } else if (location == "remove") {
                    el.parentNode.removeChild(el);
                } else if (location == "before") {
                    el.parentNode.insertBefore(wrapHelper(html, el.parentNode), el);
                } else if (location == "after") {
                    el.parentNode.insertBefore(wrapHelper(html, el.parentNode), el.nextSibling);
                }
            });
        },
        
        append: function (html) {
            return this.html(html, 'bottom');
        },
        
        prepend: function (html) {
          return this.html(html, 'top');
        },
    
        /**
    	 * Attribute getter/setter
    	 *
    	 */
        attr: function(attribute, val) {
            if (arguments.length == 2) {
                return this.each(function(el) {
                    el.setAttribute(attribute, val);
                });
            } else {
                var attrs = [];
                this.each(function(el) {
                    var val = el.getAttribute(attribute);
                    if (val != null)
                    attrs.push(val);
                });
                return attrs;
            }
        }
    // --
    });
    
    // private method for finding a dom element
    function getTag(el) {
        return (el.firstChild === null) ? {'UL':'LI','DL':'DT','TR':'TD'}[el.tagName] || el.tagName : el.firstChild.tagName;
    }
    
    function wrapHelper(html, el) {
      return (typeof html == string) ? wrap(html, getTag(el)) : html;
    }
    
    // private method
    // Wraps the HTML in a TAG, Tag is optional
    // If the html starts with a Tag, it will wrap the context in that tag.
    function wrap(xhtml, tag) {
    
        var attributes = {},
            re = /^<([A-Z][A-Z0-9]*)([^>]*)>(.*)<\/\1>/i,
            element,
            x,
            a,
            i = 0,
            attr,
            node,
            attrList;
            
        if (re.test(xhtml)) {
            result = re.exec(xhtml);
            tag = result[1];
    
            // if the node has any attributes, convert to object
            if (result[2] !== "") {
                attrList = result[2].split(/([A-Z]*\s*=\s*['|"][A-Z0-9:;#\s]*['|"])/i);
    
                for (; i < attrList.length; i++) {
                    attr = attrList[i].replace(/^\s*|\s*$/g, "");
                    if (attr !== "" && attr !== " ") {
                        node = attr.split('=');
                        attributes[node[0]] = node[1].replace(/(["']?)/g, '');
                    }
                }
            }
            xhtml = result[3];
        }
    
        element = document.createElement(tag);
    
        for (x in attributes) {
            a = document.createAttribute(x);
            a.nodeValue = attributes[x];
            element.setAttributeNode(a);
        }
    
        element.innerHTML = xhtml;
        return element;
    }
    
    
    /**
    * Removes all erronious nodes from the DOM.
    * 
    */
    function clean(collection) {
        var ns = /\S/;
        collection.each(function(el) {
            var d = el,
                n = d.firstChild,
                ni = -1,
                nx;
            while (n) {
                nx = n.nextSibling;
                if (n.nodeType == 3 && !ns.test(n.nodeValue)) {
                    d.removeChild(n);
                } else {
                    n.nodeIndex = ++ni; // FIXME not sure what this is for, and causes IE to bomb (the setter) - @rem
                }
                n = nx;
            }
        });
    }/**
     *
     * @namespace {Event}
     * @example
     *
     * Event
     * ---
     *	
     * A good old fashioned event handling system.
     * 
     */
    xui.extend({
    	
    	
    	/**	
    	 *
    	 * Register callbacks to DOM events.
    	 * 
    	 * @param {Event} type The event identifier as a string.
    	 * @param {Function} fn The callback function to invoke when the event is raised.
    	 * @return self
    	 * @example
    	 * 
    	 * ### on
    	 * 
    	 * Registers a callback function to a DOM event on the element collection.
    	 * 
    	 * For more information see:
    	 * 
    	 * - http://developer.apple.com/webapps/docs/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/chapter_7_section_1.html#//apple_ref/doc/uid/TP40006511-SW1
    	 *
    	 * syntax:
    	 *
    	 * 		x$('button').on( 'click', function(e){ alert('hey that tickles!') });
    	 * 
    	 * or...
    	 * 
    	 * 		x$('a.save').click(function(e){ alert('tee hee!') });
    	 *
    	 * arguments:
    	 *
    	 * - type:string the event to subscribe to click|load|etc
    	 * - fn:function a callback function to execute when the event is fired
    	 *
    	 * example:
    	 * 	
    	 * 		x$(window).load(function(e){
    	 * 			x$('.save').touchstart( function(evt){ alert('tee hee!') }).css(background:'grey');	
    	 *  	});
    	 * 	
    	 */
    	/*on: function(type, fn) {
    	    return this.each(function(el) {
                if (window.addEventListener) {
                    el.addEventListener(type, fn, false);
                }
    	    });
    	},*/
    	
    	touch: eventSupported('ontouchstart'),
    	
    	
    	
    	on: function(type, fn) {
            return this.each(function (el) {
                el.addEventListener(type, _createResponder(el, type, fn), false);
            });
        },
    
        un: function(type) {
            var that = this;
            return this.each(function (el) {
                var id = _getEventID(el), responders = _getRespondersForEvent(id, type), i = responders.length;
    
                while (i--) {
                    el.removeEventListener(type, responders[i], false);
                }
    
                delete cache[id];
      	    });
      	},
    
      	fire: function (type, data) {
            return this.each(function (el) {
                if (el == document && !el.dispatchEvent)
                    el = document.documentElement;
    
                var event = document.createEvent('HTMLEvents');
                event.initEvent(type, true, true);
                event.data = data || {};
                event.eventName = type;
                
                el.dispatchEvent(event);
      	    });
      	}
      
    // --
    });
    
    function eventSupported(event) {
        var element = document.createElement('i');
        return event in element || element.setAttribute && element.setAttribute(event, "return;") || false;
    }
    
    // lifted from Prototype's (big P) event model
    function _getEventID(element) {
        if (element._xuiEventID) return element._xuiEventID[0];
        return element._xuiEventID = [++_getEventID.id];
    }
    
    _getEventID.id = 1;
    
    function _getRespondersForEvent(id, eventName) {
        var c = cache[id] = cache[id] || {};
        return c[eventName] = c[eventName] || [];
    }
    
    function _createResponder(element, eventName, handler) {
        var id = _getEventID(element), r = _getRespondersForEvent(id, eventName);
    
        var responder = function(event) {
            if (handler.call(element, event) === false) {
                event.preventDefault();
                event.stopPropagation();
            } 
        };
        responder.handler = handler;
        r.push(responder);
        return responder;
    }/**
     *
     * @namespace {Fx}
     * @example
     *
     * Fx
     * ---
     * 
     * Animations, transforms and transitions for getting the most out of hardware accelerated CSS.
     * 
     */
    xui.extend({
    
    	/**
    	 *
    	 * Tween is a method for transforming a css property to a new value.
    	 * 
    	 * @param {Object} options [Array|Object]
    	 * @param {Function} callback
    	 * @return self
    	 * @example
    	 * 
    	 * ### tween
    	 *	
    	 * syntax:
    	 * 
    	 * x$(selector).tween(obj, callback);
    	 *
    	 * arguments:
    	 * 
    	 * - properties: object an object literal of element css properties to tween or an array containing object literals of css properties to tween sequentially.
    	 * - callback (optional): function to run when the animation is complete
    	 *
    	 * example:
    	 *
    	 * 	x$('#box').tween({ left:100px, backgroundColor:'blue' });
    	 * 	x$('#box').tween({ left:100px, backgroundColor:'blue' }, function() { alert('done!'); });
    	 * 	x$('#box').tween([{ left:100px, backgroundColor:'green', duration:.2 }, { right:'100px' }]); 
    	 * 
    	 */
    	// options: duration, after, easing
    	tween: function( props, callback ) {
    	    
    	    // creates an options obj for emile
    	    var emileOpts = function(o) {
    	        var options = {};
        		"duration after easing".split(' ').forEach( function(p) {
            		if (props[p]) {
            		    options[p] = props[p];
            		    delete props[p];
            		}
        		});
        		return options;
    	    }
    	    
    	    // serialize the properties into a string for emile
    	    var serialize = function(props) {
    		    var serialisedProps = [], key;
        		if (typeof props != string) {
          		    for (key in props) {
                        serialisedProps.push(key + ':' + props[key]);
        		    }
          		    serialisedProps = serialisedProps.join(';');
        		} else {
        		    serialisedProps = props;
        		}
        		return serialisedProps;
    		};
    	    
    	    
    		// queued animations
    		if (props instanceof Array) {
    		    // animate each passing the next to the last callback to enqueue
    		    props.forEach(function(a){
    		        
    		    });
    		}
    	
    	    
    	    
    	
    	
    	    // this branch means we're dealing with a single tween
    	    var opts = emileOpts(props);
    	    var prop = serialize(props);
    	    
    		if (typeof callback == 'function') options.after = callback;
    		
    		return this.each(function(e){
    			emile(e, prop, opts, callback);
    		});
    	}
    //---
    });/**
     *
     * @namespace {Style}
     * @example
     *
     * Style
     * ---
     *	
     * Anything related to how things look. Usually, this is CSS.
     * 
     */
    function hasClass(el, className) {
        return getClassRegEx(className).test(el.className);
    }
    
    // Via jQuery - used to avoid el.className = ' foo';
    // Used for trimming whitespace
    var rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;
    
    function trim(text) {
      return (text || "").replace( rtrim, "" );
    }
    
    xui.extend({
    
        /**
    	 * 
    	 * Sets a single CSS property to a new value.
    	 * 
    	 * @param {String} prop The property to set.
    	 * @param {String} val The value to set the property.
    	 * @return self
    	 * @example
    	 *
    	 * ### setStyle
    	 *	
    	 * syntax: 
    	 *
    	 * 	x$(selector).setStyle(property, value);
    	 *
    	 * arguments: 
    	 *
    	 * - property:string the property to modify
    	 * - value:string the property value to set
    	 *
    	 * example:
    	 * 
    	 * 	x$('.txt').setStyle('color', '#000');
    	 * 
    	 */
        setStyle: function(prop, val) {
            return this.each(function(el) {
                el.style[prop] = val;
            });
        },
    
        /**
    	 * 
    	 * Retuns a single CSS property. Can also invoke a callback to perform more specific processing tasks related to the property value.
    	 * 
    	 * @param {String} prop The property to retrieve.
    	 * @param {Function} callback A callback function to invoke with the property value.
    	 * @return self if a callback is passed, otherwise the individual property requested
    	 * @example
    	 *
    	 * ### getStyle
    	 *	
    	 * syntax: 
    	 *
    	 * 	x$(selector).getStyle(property, callback);
    	 *
    	 * arguments: 
    	 * 
    	 * - property:string a css key (for example, border-color NOT borderColor)
    	 * - callback:function (optional) a method to call on each element in the collection 
    	 *
    	 * example:
    	 *
    	 *	x$('ul#nav li.trunk').getStyle('font-size');
    	 *	
    	 * 	x$('a.globalnav').getStyle( 'background', function(prop){ prop == 'blue' ? 'green' : 'blue' });
    	 *
    	 */
        getStyle: function(prop, callback) {
            return (callback === undefined) ?
                
                getStyle(this[0], prop) :
                
                this.each(function(el) {
                    callback(getStyle(el, prop));
                });
        },
    
        /**
    	 *
    	 * Adds the classname to all the elements in the collection. 
    	 * 
    	 * @param {String} className The class name.
    	 * @return self
    	 * @example
    	 *
    	 * ### addClass
    	 *	
    	 * syntax:
    	 *
    	 * 	$(selector).addClass(className);
    	 * 
    	 * arguments:
    	 *
    	 * - className:string the name of the CSS class to apply
    	 *
    	 * example:
    	 * 
    	 * 	$('.foo').addClass('awesome');
    	 *
    	 */
        addClass: function(className) {
            return this.each(function(el) {
                if (hasClass(el, className) === false) {
                  el.className = trim(el.className + ' ' + className);
                }
            });
        },
        /**
    	 *
    	 * Checks to see if classname is one the element. If a callback isn't passed, hasClass expects only one element in collection
    	 * 
    	 * @param {String} className The class name.
    	 * @param {Function} callback A callback function (optional)
    	 * @return self if a callback is passed, otherwise true or false as to whether the element has the class
    	 * @example
    	 *
    	 * ### hasClass
    	 *	
    	 * syntax:
    	 *
    	 * 	$(selector).hasClass('className');
    	 * 	$(selector).hasClass('className', function(element) {});	 
    	 * 
    	 * arguments:
    	 *
    	 * - className:string the name of the CSS class to apply
    	 *
    	 * example:
    	 * 
    	 * 	$('#foo').hasClass('awesome'); // returns true or false
    	 * 	$('.foo').hasClass('awesome',function(e){}); // returns XUI object
    	 *
    	 */
        hasClass: function(className, callback) {
            return (callback === undefined && this.length == 1) ?
                hasClass(this[0], className) :
                this.each(function(el) {
                    if (hasClass(el, className)) {
                        callback(el);
                    }
                });
        },
    
        /**
    	 *
    	 * Removes the classname from all the elements in the collection. 
    	 * 
    	 * @param {String} className The class name.
    	 * @return self
    	 * @example
    	 *
    	 * ### removeClass
    	 *	
    	 * syntax:
    	 *
    	 * 	x$(selector).removeClass(className);
    	 * 
    	 * arguments:
    	 *
    	 * - className:string the name of the CSS class to remove.
    	 *
    	 * example:
    	 * 
    	 * 	x$('.bar').removeClass('awesome');
    	 * 
    	 */
        removeClass: function(className) {
            if (className === undefined) {
                this.each(function(el) {
                    el.className = '';
                });
            } else {
                var re = getClassRegEx(className);
                this.each(function(el) {
                    el.className = el.className.replace(re, '');
                });
            }
            return this;
        },
    
    
        /**
    	 *
    	 * Set a number of CSS properties at once.
    	 * 
    	 * @param {Object} props An object literal of CSS properties and corosponding values.
    	 * @return self
    	 * @example	
    	 *
    	 * ### css
    	 *	
    	 * syntax: 
    	 *
    	 * 	x$(selector).css(object);
    	 *
    	 * arguments: 
    	 *
    	 * - an object literal of css key/value pairs to set.
    	 *
    	 * example:
    	 * 
    	 * 	x$('h2.fugly').css({ backgroundColor:'blue', color:'white', border:'2px solid red' });
    	 *  
    	 */
        css: function(o) {
            for (var prop in o) {
                this.setStyle(prop, o[prop]);
            }
            return this;
        }
    // --
    });
    
    function getStyle(el, p) {
        // this *can* be written to be smaller - see below, but in fact it doesn't compress in gzip as well, the commented
        // out version actually *adds* 2 bytes.
        // return document.defaultView.getComputedStyle(el, "").getPropertyValue(p.replace(/([A-Z])/g, "-$1").toLowerCase());
        return document.defaultView.getComputedStyle(el, "").getPropertyValue(p.replace(/[A-Z]/g, function(m){ return '-'+m.toLowerCase();}));
    }
    
    // RS: now that I've moved these out, they'll compress better, however, do these variables
    // need to be instance based - if it's regarding the DOM, I'm guessing it's better they're
    // global within the scope of xui
    
    // -- private methods -- //
    var reClassNameCache = {},
        getClassRegEx = function(className) {
            var re = reClassNameCache[className];
            if (!re) {
                re = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)');
                reClassNameCache[className] = re;
            }
            return re;
        };/**
     *
     * @namespace {Xhr}
     * @example
     *
     *
     * Xhr
     * ---
     *	
     * Remoting methods and utils. 
     * 
     */
    xui.extend({	
     
    	/**
    	 * 
    	 * The classic Xml Http Request sometimes also known as the Greek God: Ajax. Not to be confused with AJAX the cleaning agent. 
    	 * This method has a few new tricks. It is always invoked on an element collection and follows the identical behaviour as the
    	 * `html` method. If there no callback is defined the response text will be inserted into the elements in the collection. 
    	 * 
    	 * @param {location} location [inner|outer|top|bottom|before|after]
    	 * @param {String} url The URL to request.
    	 * @param {Object} options The method options including a callback function to invoke when the request returns. 
    	 * @return self
    	 * @example
    	 *	
    	 * ### xhr
    
    	 * syntax:
    	 *
    	 *    xhr(location, url, options)
    	 *
    	 * or this method will accept just a url with a default behavior of inner...
    	 *
    	 * 		xhr(url, options);
    	 *
    	 * location
    	 * 
    	 * options:
    	 *
    	 * - method {String} [get|put|delete|post] Defaults to 'get'.
    	 * - async {Boolen} Asynchronous request. Defaults to false.
    	 * - data {String} A url encoded string of parameters to send.
    	 * - callback {Function} Called on 200 status (success)
         *
         * response 
         * - The response available to the callback function as 'this', it is not passed in. 
         * - this.reponseText will have the resulting data from the file.
    	 * 
    	 * example:
    	 *
    	 * 		x$('#status').xhr('inner', '/status.html');
    	 * 		x$('#status').xhr('outer', '/status.html');
    	 * 		x$('#status').xhr('top',   '/status.html');
    	 * 		x$('#status').xhr('bottom','/status.html');
    	 * 		x$('#status').xhr('before','/status.html');
    	 * 		x$('#status').xhr('after', '/status.html');
    	 *
    	 * or 
    	 *
    	 *    x$('#status').xhr('/status.html');
    	 * 
    	 *	  x$('#left-panel').xhr('/panel', {callback:function(){ alert("All Done!") }});
    	 *
    	 *	  x$('#left-panel').xhr('/panel', function(){ alert(this.responseText) }); 
    	 * 
    	 */
        xhr:function(location, url, options) {
    
          // this is to keep support for the old syntax (easy as that)
    		if (!/^(inner|outer|top|bottom|before|after)$/.test(location)) {
                options = url;
                url = location;
                location = 'inner';
            }
    
            var o = options ? options : {};
            
            if (typeof options == "function") {
                // FIXME kill the console logging
                // console.log('we been passed a func ' + options);
                // console.log(this);
                o = {};
                o.callback = options;
            };
            
            var that   = this,
                req    = new XMLHttpRequest(),
                method = o.method || 'get',
                async  = o.async || false,           
                params = o.data || null,
                i = 0;
    
            req.queryString = params;
            req.open(method, url, async);
    
            if (o.headers) {
                for (; i<o.headers.length; i++) {
                  req.setRequestHeader(o.headers[i].name, o.headers[i].value);
                }
            }
    
            req.handleResp = (o.callback != null) ? o.callback : function() { that.html(location, this.responseText); };
            function hdl(){ 
                if(req.status===0 || req.status==200 && req.readyState==4) req.handleResp(this.responseText); 
            }
            if(async) req.onreadystatechange = hdl;
            req.send(params);
            if(!async) hdl();
            return this;
        }
    // --
    });    xui.extend({
        
    	/**
    	 * Adds more DOM nodes to the existing element list.
    	 */
    	add: function(q) {
    	  [].push.apply(this, slice(xui(q)));
    	  return this.set(this.reduce());
    	},
    
    	/**
    	 * Pops the last selector from XUI
    	 */
    	end: function () {	
    		return this.set(this.cache || []);	 	
    	},
    
    	/**
    	 * Returns the first element in the collection.
    	 * 
    	 * @return Returns a single DOM element.
    	 */
    	first: function() {
    		return this.get(0);
    	},
    
    	/**
    	 * Returns the element in the collection at the 
    	 * given index
    	 *
    	 * @return Returns a single DOM element
    	 * */
    	get: function(index) {
    		return this[index];
    	},
    	
    	/**
    	 * Returns a collection containing the element
    	 * at the given index
    	 * */
    	eq: function(idx1,idx2) {
    		idx2 = idx2 ? idx2 + 1 : idx1 + 1;
    		return this.set([].slice.call(this, idx1, idx2));
    	},
    
    	/**
    	 * Returns the size of the collection
    	 *
    	 * @return Returns an integer size of collection (use xui.length instead)
    	 * */
    	size: function() {
    		return this.length;
    	}
    // --	
    });	
    "inner outer top bottom remove before after".split(' ').forEach(function (method) {
      xui.fn[method] = function (html) { return this.html(method, html); };
    });
    var cache = {};
    
    /**
     *
     * @namespace {Event}
     * @example
     *
     * Event
     * ---
     *	
     * A good new skool fashioned event handling system.
     *
     * - click
     * - load
     * - touchstart
     * - touchmove
     * - touchend
     * - touchcancel
     * - gesturestart
     * - gesturechange
     * - gestureend
     * - orientationchange
     *
     * 
     */
    // xui.extend({});
    
    
    "click load submit touchstart touchmove touchend touchcancel gesturestart gesturechange gestureend orientationchange".split(' ').forEach(function (event) {
      xui.fn[event] = function (fn) { return fn ? this.on(event, fn) : this.fire(event); };
    });
    
    // patched orientation support - Andriod 1 doesn't have native onorientationchange events
    if (!eventSupported('onorientationchange')) {
      (function () {
        var w = window.innerWidth, h = window.innerHeight;
        
        xui(window).on('resize', function () {
          var portraitSwitch = (window.innerWidth < w && window.innerHeight > h) && (window.innerWidth < window.innerHeight),
              landscapeSwitch = (window.innerWidth > w && window.innerHeight < h) && (window.innerWidth > window.innerHeight);
          if (portraitSwitch || landscapeSwitch) {
            window.orientation = portraitSwitch ? 0 : 90; // what about -90? Some support is better than none
            $('body').fire('orientationchange'); // will this bubble up?
            w = window.innerWidth;
            h = window.innerHeight;
          }
        });
      })();
    }/**
     *
     * @namespace {Form}
     * @example
     *
     *
     * Form
     * ---
     *	
     * Form related
     * 
     */
    xui.extend({
        /**
         * 
         * This method is private, it takes a form element and returns a string
         * 
         * @param {Element} form
         * @return encoded querystring
         * 
         */
        _toQueryString: function (docForm) {
            var submitString = '',
                formElement = '',
                lastElementName = '',
                length = docForm.length,
                i;
            
            for (i = 0 ; i < length ; i++) {
                formElement = docForm[i];
                switch (formElement.type) {
                case 'text' :
                case 'select-one' :
                case 'hidden' :
                case 'password' :
                case 'textarea' :
                    submitString += formElement.name + '=' + encodeURIComponent(formElement.value) + '&'; 
                    break; 
                case 'radio' :
                    if (formElement.checked) { 
                        submitString += formElement.name + '=' + encodeURIComponent(formElement.value) + '&'; 
                    } 
                    break; 
                case 'checkbox' :
                    if (formElement.checked)  {
                        if (formElement.name == lastElementName) {
                            if (submitString.lastIndexOf('&') === submitString.length - 1) { 
                                submitString = submitString.substring(0, submitString.length - 1); 
                            } 
                            submitString += ',' + encodeURIComponent(formElement.value); 
                        } else { 
                            submitString += formElement.name + '=' + encodeURIComponent(formElement.value);  
                        } 
                        submitString += '&'; 
                        lastElementName = formElement.name; 
                    } 
                    break;  
                }
            } 
            submitString = submitString.substring(0, submitString.length - 1); 
            return submitString;
        }
    // --
    });
    xui.extend({
        nativeAnimate: function (options, callback) {
            this.animationStack = [];
            if (options instanceof Array) {
                for (var i = 0; i < options.length; i++) {
                    this.animationStack.push(options[i]);
                }
            } else if (options instanceof Object) {
                this.animationStack.push(options);
            }
    
            this.start(callback);
            return this;
        },
    
        // -- private -- //
    
        // TODO move these methods into the tween method
        animationStack: [],
    
        start: function (callback) {
            var t = 0,
                len = this.animationStack.length,
                i, options, duration;
            
            for (i = 0; i < this.animationStack.length; i++) {
                options = this.animationStack[i];
                duration = options.duration === undefined ? 0.5 : options.duration;
                // We use setTimeout to stage the animations.
                window.setTimeout(function (s, o, i) {
                    s.animate(o);
                    if ((i === len - 1) && callback && typeof(callback) === 'function') {
                        callback();
                    }
                }, t * 1000 * duration, this, options, i);
                t += duration;
            }
    
            return this;
        },
      
        animate: function (options) {   
            var that = this,
                opt_after = options.after,
                easing = (options.easing === undefined) ? 'ease-in' : options.easing,
                before = (options.before === undefined) ? function () {} : options.before,
                after = (opt_after === undefined) ? function () {} : function () { opt_after.apply(that); },
                duration = (options.duration === undefined) ? 0.5 : options.duration,
                translate = options.by,
                rotate = options.rotate;
                
            options.easing = options.rotate = options.by = options.before = options.after = options.duration = undefined;
            before.apply(before.arguments);
       
            // this sets duration and easing equation on a style property change
            this.setStyle('-webkit-transition', 'all ' + duration + 's ' + easing);
       
            // sets the starting point and ending point for each css property tween
            this.each(function (el) {
                for (var prop in options) {
                    that.setStyle(prop, options[prop]);
                }
        
                if (translate) {
                    that.setStyle('-webkit-transform', that.translateOp(translate[0], translate[1]));
                }
                
                if (rotate) {
                    that.setStyle('-webkit-transform', that.rotateOp(rotate[0], rotate[1]));
                }
            });
    
            window.setTimeout(function () { that.setStyle('-webkit-transition', 'none'); }, duration * 1000);
            window.setTimeout(function () { that.setStyle('-webkit-transform', 'none'); }, duration * 1000);
            window.setTimeout(after, duration * 1000);
    
            return this || that; // haha
        },
        
        translateOp: function (xPixels, yPixels) {
            return 'translate(' + xPixels + 'px, ' + yPixels + 'px)';
        },
        
        rotateOp: function (axis, degree) {
            return 'rotate' + axis.toUpperCase() + '(' + degree + 'deg)';
        }
    // --
    });xui.extend({    
        /**
    	 * 
    	 * Another twist on remoting: lightweight and unobtrusive DOM databinding. Since we are often talking to a server with 
    	 * handy JSON objects we added the convienance the map property which allows you to map JSON nodes to DOM elements. 
    	 * 
    	 * @param {String} url The URL to request.
    	 * @param {Object} options The method options including a callback function to invoke when the request returns. 
    	 * @return self
    	 * @example
    	 * 
    	 * ### xhrjson 
    	 *	
    	 * syntax:
    	 *
    	 * 		xhrjson(url, options);
    	 * 
    	 * example:
    	 *  
    	 * The available options are the same as the xhr method with the addition of map. 
    	 * 
    	 * 		x$('#user').xhrjson( '/users/1.json', {map:{'username':'#name', 'image_url':'img#avatar[@src]'} });
    	 * 
    	 */
        xhrjson: function(url, options) {
            var that = this;
    		    var cb = typeof cb != 'function' ? function(x){return x} : options.callback;
    
            var callback = function() {
                var o = eval('(' + this.responseText + ')');
                for (var prop in o) {
                    xui(options.map[prop]).html(cb(o[prop]));
                }
            };
            options.callback = callback;
            this.xhr(url, options);
            return this;
        }
    // --
    });    // emile.js_old (c) 2009 Thomas Fuchs
    // Licensed under the terms of the MIT license.
    
    (function(emile, container){
      var parseEl = document.createElement('div'),
        props = ('backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth '+
        'borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize '+
        'fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight '+
        'maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft '+
        'paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' ');
    
      function interpolate(source,target,pos){ return (source+(target-source)*pos).toFixed(3); }
      function s(str, p, c){ return str.substr(p,c||1); }
      function color(source,target,pos){
        var i = 2, j, c, tmp, v = [], r = [];
        while(j=3,c=arguments[i-1],i--)
          if(s(c,0)=='r') { c = c.match(/\d+/g); while(j--) v.push(~~c[j]); } else {
            if(c.length==4) c='#'+s(c,1)+s(c,1)+s(c,2)+s(c,2)+s(c,3)+s(c,3);
            while(j--) v.push(parseInt(s(c,1+j*2,2), 16)); }
        while(j--) { tmp = ~~(v[j+3]+(v[j]-v[j+3])*pos); r.push(tmp<0?0:tmp>255?255:tmp); }
        return 'rgb('+r.join(',')+')';
      }
      
      function parse(prop){
        var p = parseFloat(prop), q = prop.replace(/^[\-\d\.]+/,'');
        return isNaN(p) ? { v: q, f: color, u: ''} : { v: p, f: interpolate, u: q };
      }
      
      function normalize(style){
        var css, rules = {}, i = props.length, v;
        parseEl.innerHTML = '<div style="'+style+'"></div>';
        css = parseEl.childNodes[0].style;
        while(i--) if(v = css[props[i]]) rules[props[i]] = parse(v);
        return rules;
      }  
      
      container[emile] = function(el, style, opts){
        el = typeof el == 'string' ? document.getElementById(el) : el;
        opts = opts || {};
        var target = normalize(style), comp = el.currentStyle ? el.currentStyle : getComputedStyle(el, null),
          prop, current = {}, start = +new Date, dur = opts.duration||200, finish = start+dur, interval,
          easing = opts.easing || function(pos){ return (-Math.cos(pos*Math.PI)/2) + 0.5; };
        for(prop in target) current[prop] = parse(comp[prop]);
        interval = setInterval(function(){
          var time = +new Date, pos = time>finish ? 1 : (time-start)/dur;
          for(prop in target)
            el.style[prop] = target[prop].f(current[prop].v,target[prop].v,easing(pos)) + target[prop].u;
          if(time>finish) { clearInterval(interval); opts.after && opts.after(); }
        },10);
      }
    })('emile', this);
      // ---
}());
