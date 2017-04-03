var interpreter       = require('./interpreter.js');
var facetedGlobalBase = interpreter.globalBase;

const SENSITIVE_LABEL = "sensitive";
const VALUE           = "value";
const LOW_VALUE       = "low";

/*******************************************************
 * browser.policy
 *
 *******************************************************/
var infoPolicies = new PolicyLibrary();
var x = new infoPolicies.Label("sensitiveInputText");
infoPolicies.restrict(x, function(secret) {
  return secret === "hashValue";
});
/*************************************************************/


function Element(doc, localName) {
  this.ownerDocument = doc;
  this.name        = localName;
  this.attributes  = {};
  this.childNodes  = [];
  this.isSensitive = false;
}

Element.prototype = {
  getAttribute: function(name) {
    var attrValue = this.attributes[name];
    if (name === VALUE) {
      if (this.isSensitive) {
        // try to resolve policy
      }
    }
    return this.attributes[name];
  },
  setAttribute: function (name, value) {
    if (name in this.attributes) {
      this.attributes[name] = value
    }
  }
};

function Document(){
  this.elements = {};

}

Document.prototype = {

  createElement: function(id, localName) {
    this.elements[id] = new Element(this, localName);
  },
  getElementById: function(id) {
    var element = this.elements[id];
    if (SENSITIVE_LABEL in element.attributes) {

      // Get label
      var label = element.attributes[SENSITIVE_LABEL];

      // Set public view
      var lowValue = "[redacted]";
      if (LOW_VALUE in element.attributes) {
        lowValue = element.attributes[LOW_VALUE];
      }

      // Create facetedValue
      if (label in infoPolicies.PolicyEnvironment) {
        element.attributes[VALUE] = policyLibrary.cloak(label, element.attributes[VALUE], lowValue);
        element.isSensitive = true;
      } else {
        print("Warning: policy for sensitive label provided does not exist in the policy environment\n" +
          "FacetedValue will not be created. This could be a potential privacy leak.");
      }
    }
    return this.elements[id];
  }
};

facetedGlobalBase.__proto__.Document = Document;