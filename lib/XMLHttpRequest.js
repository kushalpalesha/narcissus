/**
 *
 * @class XMLHttpRequest
 * @author Originally implemented by Yehuda Katz
 * Original source code available here: https://github.com/thatcher/env-js/blob/master/src/xhr/xmlhttprequest.js
 * This module doesn't really perform any network activity primarily because SpiderMonkey does not support it.
 * I am only using this as a stub for the dom.js script tag to work.
 */

(function(){

// this implementation can be used without requiring a DOMParser
// assuming you dont try to use it to get xml/html documents
  exports.XMLHttpRequest = XMLHttpRequest = function(){
    this.headers = {};
    this.responseHeaders = {};
    this.aborted = false;//non-standard
  };

// defined by the standard: http://www.w3.org/TR/XMLHttpRequest/#xmlhttprequest
// but not provided by Firefox.  Safari and others do define it.
  XMLHttpRequest.UNSENT = 0;
  XMLHttpRequest.OPEN = 1;
  XMLHttpRequest.HEADERS_RECEIVED = 2;
  XMLHttpRequest.LOADING = 3;
  XMLHttpRequest.DONE = 4;

  XMLHttpRequest.prototype = {
    open: function(method, url, async, user, password){
      this.readyState = 1;
      this.async = (async === false)?false:true;
      this.method = method || "GET";
      this.url = url;
      this.onreadystatechange();
    },
    setRequestHeader: function(header, value){
      this.headers[header] = value;
    },
    send: function(data, parsedoc/*non-standard*/, redirect_count){
      var _this = this;
      parsedoc = (parsedoc === undefined)?true:!!parsedoc;
      redirect_count = (redirect_count === undefined) ? 0 : redirect_count;
      function makeRequest(){
        var cookie = Envjs.getCookies(_this.url),
          redirecting = false;
        if(cookie){
          _this.setRequestHeader('COOKIE', cookie);
        }
        if(window&&window.navigator&&window.navigator.userAgent){
          _this.setRequestHeader('User-Agent', window.navigator.userAgent);
        }

        if (!_this.aborted  && !redirecting){
          _this.onreadystatechange();
        }

      }//end makeRequest

      if (this.async){
        //DONE: what we really need to do here is rejoin the
        //      current thread and call onreadystatechange via
        //      setTimeout so the callback is essentially applied
        //      at the end of the current callstack
        print("Asynchronously loading resource from:" + this.url);
      }else{
        makeRequest();
      }
    },
    abort: function(){
      this.aborted = true;
    },
    onreadystatechange: function(){
      //Instance specific
    },
    getResponseHeader: function(header){
      var rHeader, returnedHeaders;
      if (this.readyState < 3){
        throw new Error("INVALID_STATE_ERR");
      } else {
        returnedHeaders = [];
        for (rHeader in this.responseHeaders) {
          if ((rHeader+'').match(new RegExp(header, "i"))) {
            returnedHeaders.push(this.responseHeaders[rHeader]);
          }
        }

        if (returnedHeaders.length){
          returnedHeaders = returnedHeaders.join(", ");
          return returnedHeaders;
        }
      }
      return null;
    },
    getAllResponseHeaders: function(){
      var header, returnedHeaders = [];
      if (this.readyState < 3){
        throw new Error("INVALID_STATE_ERR");
      } else {
        for (header in this.responseHeaders) {
          if(this.responseHeader.hasOwnProperty(header)){
            returnedHeaders.push( header + ": " + this.responseHeaders[header] );
          }
        }
      }
      return returnedHeaders.join("\r\n");
    },
    async: true,
    readyState: 0,
    responseText: "",
    status: 0,
    statusText: ""
  };

}(/*XMLHttpREquest*/));