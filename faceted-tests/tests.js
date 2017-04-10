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
    v2 = -v1;
    return assertEquals(v2, -5);
  };

  this.testUnaryMinus2 = function() {
    var v1 = -5;
    v2 = -v1;
    return assertEquals(v2, 5);
  };

  this.testFacetedUnaryMinus1 = function() {
    var f1 = policyLibrary.cloak("h", 1, 2);
    f2 = -f1;
    return assertEquals(f2.toString(), "<h?-1:-2>");
  };

  this.testFacetedUnaryMinus2 = function() {
    var f1 = policyLibrary.cloak("h", -1, -2);
    f2 = -f1;
    return assertEquals(f2.toString(), "<h?1:2>");
  };

  this.testBinaryAddition = function() {
    var v1 = 2;
    var v2 = 3;
    v3 = v1 + v2;
    return assertEquals(v3.toString(), "5");
  };

  // Different principles
  this.testAddTwoFacetedValues1 = function () {
    var f1 = policyLibrary.cloak("h", 1, 2);
    var f2 = policyLibrary.cloak("l", 3, 3);
    f3 = f1 + f2;
    return assertEquals(f3.toString(), "<h?<l?4:4>:<l?5:5>>");
  };

  // Same principles
  this.testAddTwoFacetedValues2 = function () {
    var f1 = policyLibrary.cloak("h", 1, 2);
    var f2 = policyLibrary.cloak("h", 3, 3);
    f3 = f1 + f2;
    return assertEquals(f3.toString(), "<h?4:5>");
  };

  this.testAddFacetedToNonFaceted1 = function() {
    var f1 = policyLibrary.cloak("h", 1, 2);
    var v2 = 5;
    f3 = f1 + v2;
    return assertEquals(f3.toString(), "<h?6:7>");
  };

  this.testNonFacetedIfTrue = function() {
    var v1 = 10;
    if (10 == v1) {
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
    var f1 = policyLibrary.cloak("h", false, true);
    var v1 = 8;
    if (f1) {
      v1 = 10;
    } else {
      v1 = 11;
    }
    return assertEquals(v1.toString(), "<h?11:10>");
  };

}

var testCaseObject = new TestCases();
var failCount = 0;
var passCount = 0;
var policyLibrary = new PolicyLibrary();
for (var testCase in testCaseObject) {
  if ("test" === testCase.substring(0,4)) {
    if (testCaseObject[testCase]()) {
      passCount++;
      print("Passed");
    } else {
      failCount++;
    }
  }
}
print("Passed: " + passCount + "\tFailed: " + failCount);
