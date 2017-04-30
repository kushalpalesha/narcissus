function assertEquals(actual, expected, message) {
  if (expected === actual) {
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
    return assertEquals(f2.toString(), "<h?-1:-2>");
  };

  this.testFacetedUnaryMinus2 = function() {
    var f1 = policyEnv.mkSensitive("h", -1, -2);
    var f2 = -f1;
    return assertEquals(f2.toString(), "<h?1:2>");
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
    return assertEquals(f3.toString(), "<h?<l?4:4>:<l?5:5>>");
  };

  // Same principals
  this.testAddTwoFacetedValues2 = function () {
    var f1 = policyEnv.mkSensitive("h", 1, 2);
    var f2 = policyEnv.mkSensitive("h", 3, 3);
    var f3 = f1 + f2;
    return assertEquals(f3.toString(), "<h?4:5>");
  };

  this.testAddFacetedToNonFaceted1 = function() {
    var f1 = policyEnv.mkSensitive("h", 1, 2);
    var v2 = 5;
    var f3 = f1 + v2;
    return assertEquals(f3.toString(), "<h?6:7>");
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
    return assertEquals(v1.toString(), "<h?11:10>");
  };

  this.testFacetedIf2 = function() {
    var f1 = policyEnv.mkSensitive("h", 20, 55);
    var v1 = 8;
    if (f1 < 22) {
      v1 = 10;
    } else {
      v1 = 11;
    }
    return assertEquals(v1.toString(), "<h?10:11>");
  };

  this.testFacetedIf3 = function() {
    var f1 = policyEnv.mkSensitive("h", 25, 0);
    var v1;
    if (f1 > 0) {
      v1 = f1 - 1;
    }
    return assertEquals(v1.toString(), "<h?24:undefined>");
  };

  this.testFacetedIf2 = function() {
    var f1 = policyEnv.mkSensitive("h", 20, 55);
    var v1 = 8;
    if (f1 < 22) {
      v1 = 10;
    } else {
      v1 = 11;
    }
    return assertEquals(v1.toString(), "<h?10:11>");
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

    var result1 = assertEquals(policyEnv.partialConcretize({val1: 22, val2: 21}, a).toString(), "<y?10:15>");
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
    return assertEquals((x++).toString(), "<h?2:1>") && assertEquals((x).toString(), "<h?3:2>");
  };

  this.testFacetedDecrement = function () {
    var x = policyEnv.mkSensitive("h", 2, 1);
    return assertEquals((x--).toString(), "<h?2:1>") && assertEquals((x).toString(), "<h?1:0>");
  };

  this.testFacetedIncrement2 = function () {
    var x = policyEnv.mkSensitive("h", 2, 1);
    return assertEquals((++x).toString(), "<h?3:2>");
  };

  this.testFacetedDecrement2 = function () {
    var x = policyEnv.mkSensitive("h", 2, 1);
    return assertEquals((--x).toString(), "<h?1:0>");
  };

  this.testFor = function() {
    var x;
    for (x = 0; x < 10; x++) {
      var i = 1;
    }
    return assertEquals(x, 10);
  };

  this.testFacetedFunctionApplication = function() {
    var f1 = policyEnv.mkSensitive("h", 1, 2);
    var add = function(num, num2) {
      return num + num2;
    };
    var f2 = add(f1, 2);
    return assertEquals(f2.toString(), "<h?3:4>");
  };

  this.testDom = function() {
    document.body.appendChild(document.createTextNode("Hello"));
    var text = document.body.innerHTML;
    return assertEquals(text, "Hello");
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