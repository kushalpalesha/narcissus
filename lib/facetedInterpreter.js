var interpreter = require('./interpreter.js');
var definitions = require('./definitions.js');

// Elements from base interpreter to override for facetedBehaviour
var FacetExecContext = interpreter.ExecutionContext;
var facetedGlobalBase = interpreter.globalBase;

/**
 * Preserving original behaviour of these functions
 */
var BaseExecContext = {
  getValue: interpreter.ExecutionContext.prototype.getValue,
  putValue: interpreter.ExecutionContext.prototype.putValue,
  evalBinOp: interpreter.ExecutionContext.prototype.evalBinOp,
  evalUnaryOp: interpreter.ExecutionContext.prototype.evalUnaryOp,
  evalIfBlock: interpreter.ExecutionContext.prototype.evalIfBlock
};

/**
 * If block behaviour when condition is faceted
 *
 * @param cond
 * @param thenPart
 * @param elsePart
 */
FacetExecContext.prototype.evalIfBlock = function(cond, thenPart, elsePart) {
  var execContext = FacetExecContext.current;
  if (cond instanceof FacetedValue) {
    evaluateEach(cond, function(v, x) {
      if (v) {
        interpreter.execute(thenPart, x);
      } else if (elsePart) {
        interpreter.execute(elsePart, x);
      }
    }, execContext);
  } else {
    BaseExecContext.evalIfBlock.call(this, cond, thenPart, elsePart);
  }
};

/**
 * If called for a facetedValue, a pruned representation based on the current
 * execution context is returned.
 * If v is not a facetedValue then the original behaviour of getValue is invoked.
 *
 * @param  {*} v
 * @param {ProgramCounter} pc
 * @return {*}
 */
FacetExecContext.prototype.getValue = function(v, pc) {
  if (v instanceof FacetedValue) {
    if (!pc) {
      pc = getPC();
    }
    return derefFacetedValue(v, pc);
  } else {
    return BaseExecContext.getValue.call(this, v);
  }
};

/**
 *
 * @param v
 * @param w
 * @param vn
 * @param pc
 * @returns {*}
 */
FacetExecContext.prototype.putValue = function(v, w, vn, pc) {
  if (!pc) {
    pc = getPC();
    if (pc.isEmpty()) {
      return BaseExecContext.putValue.call(this, v, w, vn);
    } else {
      if (v instanceof FacetedValue) {
        return evaluateEachPair(v, w, function(ref, val, x) {
          return putValue(ref, val, x.vn, x.pc)
        }, {pc: pc, vn:vn});
      } else if (v instanceof interpreter.Reference) {
        var base = v.base || global;
        var oldVal = base[v.propertyName];
        var newVal = base[v.propertyName] = buildVal(pc, w, oldVal);
        return w;
      } else {
        throw new ReferenceError("Invalid assignment left-hand side",
          vn.filename, vn.lineno);
      }
    }
  }
};

/**
 * Prune a FacetedValue by stripping out parts where the label is part of the programCounter in the current
 * ExecutionContext
 *
 * @param  {FacetedValue} v  [description]
 * @param  {ProgramCounter} pc [description]
 *
 * @return {*} v
 */
function derefFacetedValue(v, pc) {
  var high  = v.high,
      low   = v.low,
      label = v.label;
  var execCtxt = FacetExecContext.current;
  if (pc.contains(label)) {
    return execCtxt.getValue(high, pc);
  } else if (pc.contains(label.reverse())) {
    return execCtxt.getValue(low, pc);
  } else {
    return buildVal(new ProgramCounter(label),
              execCtxt.getValue(high, pc.join(label)),
              execCtxt.getValue(low, pc.join(label.reverse())));
  }
}

/**
 * This function builds faceted values based on the contents of the program counter provided.
 *
 * @param  {ProgramCounter} pc
 * @param  {FacetedValue} vn
 * @param  {FacetedValue} vo
 *
 * @return {FacetedValue} val
 */
function buildVal(pc, vn, vo) {
  var va = vn ? vn.high : vn,
    vb = vn ? vn.low : vn,
    vc = vo ? vo.high : vo,
    vd = vo ? vo.low : vo,
    rest = pc.rest();
  if (pc.isEmpty()) {
    return vn;
  } else if (head(pc) === head(vn) && head(vn) === head(vo)) {
    let k = vn.label;
    if (!pc.first().bar)
      return new FacetedValue(k, buildVal(rest,va,vc), vd);
    else
      return new FacetedValue(k, vc, buildVal(rest,vb,vd));
  } else if (head(vn) === head(vo) && head(vn) < head(pc)) {
      let k = vn.label;
      return new FacetedValue(k, buildVal(pc,va,vc), buildVal(pc,vb,vd));
  } else if (head(pc) === head(vn) && head(vn) < head(vo)) {
      let k = vn.label;
      if (!pc.first().bar)
          return new FacetedValue(k, buildVal(rest,va,vo), vo);
      else
          return new FacetedValue(k, vo, buildVal(rest,vb,vo));
  } else if (head(pc) === head(vo) && head(vo) < head(vn)) {
      let k = vo.label;
      if (!pc.first().bar)
          return new FacetedValue(k, buildVal(rest,vn,vc), vd);
      else
          return new FacetedValue(k, vc, buildVal(rest,vn,vd));
  } else if (head(pc) < head(vn) && head(pc) < head(vo)) {
      let firstLab = pc.first();
      let k = firstLab.bar ? firstLab.reverse() : firstLab;
      if (!firstLab.bar)
          return new FacetedValue(k, buildVal(rest,vn,vo), vo);
      else
          return new FacetedValue(k, vo, buildVal(rest,vn,vo));
  } else if (head(vn) < head(pc) && head(vn) < head(vo)) {
      let k = vn.label;
      return new FacetedValue(k, buildVal(pc,va,vo), buildVal(pc,vb,vo));
  } else if (head(vo) < head(pc) && head(vo) < head(vn)) {
      let k = vo.label;
      return new FacetedValue(k, buildVal(pc,vn,vc), buildVal(pc,vn,vd));
  } else {
      throw new Error('Unhandled case for buildVal');
  }
}

/**
 * Same as getValue, different behaviour for facetedValues and original
 * behaviour for other cases.
 *
 * @param  {*} v1
 * @param  {*} v2
 * @param  {string} op
 *
 * @return {*}
 */
FacetExecContext.prototype.evalBinOp = function(v1, v2, op) {
  if (v1 instanceof FacetedValue || v2 instanceof FacetedValue) {
    if (!FacetExecContext.current.programCounter) {
      FacetExecContext.current.programCounter = new ProgramCounter();
    }
    return evaluateEachPair(v1, v2, function(v1, v2) {
            return eval('v1 ' + op + ' v2');
        }, FacetExecContext.current);
  } else {
    return BaseExecContext.evalBinOp.call(this, v1, v2, op);
  }
};

/**
 * Another overriding function which has a different behaviour for facetedValues
 * and invokes the original behaviour for other types.
 *
 * @param  {*} v
 * @param  {string} op - operator (+|-|!|~)
 *
 * @return {*}
 */
FacetExecContext.prototype.evalUnaryOp = function(v, op) {
  if (v instanceof FacetedValue) {
    //TODO: make this cleaner (non-repeated)
    if (!FacetExecContext.current.programCounter) {
      FacetExecContext.current.programCounter = new ProgramCounter();
    }
    return evaluateEach(v, function(v) {
      return eval(op + "v");
    }, FacetExecContext.current);
  } else {
    return BaseExecContext.evalUnaryOp.call(this, v, op);
  }

};

/**
 * Applies the function "f" to both facets of the value v. The function also
 * dereferences facetedValue if applicable.
 *
 * @param  {*} v [description]
 * @param  {Function} f [description]
 * @param  {ExecutionContext} x [description]
 *
 * @return {[type]}   [description]
 */
function evaluateEach(v, f, x) {
  let pc = x.programCounter;
  if (!(v instanceof FacetedValue)) {
    return f(v, x);
  }

  if (pc.contains(v.label)) {
    return evaluateEach(v.high, f, x);
  } else if (pc.contains(v.label.reverse())) {
    return evaluateEach(v.low, f, x);
  } else {
    let va, vu;
    try {
      x.programCounter = pc.join(v.label);
      va = evaluateEach(v.high, f, x);
      x.programCounter = pc.join(v.label.reverse());
      vu = evaluateEach(v.low, f, x);
      x.programCounter = pc;
    } catch (e) {
      // Terminate program to avoid leaking data through exceptions
      throw e;
    }
    return new FacetedValue(v.label, va, vu);
  }
}

//TODO: Figure out a better way of organizing labels
const MAX_LABEL = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';

/**
 * Returns the label of the root element of the given FacetedValue.
 * For a ProgramCounter, the first label is returned
 * For other types predefined "MAX" label is returned.
 *
 * @param  {(FacetedValue|ProgramCounter)} v
 *
 * @return {String} labelValue
 */
function head(v) {
  if (v instanceof FacetedValue) {
    return v.label.unsigned();
  }
  if (v instanceof ProgramCounter && v.first()) {
    return v.first().unsigned();
  } else return MAX_LABEL;
}

// Sorts alphabetically, but ignores case
function compareLabels(a, b) {
  var al = a.unsigned(),
      bl = b.unsigned();
  if (al === bl) return 0;
  else if (al === MAX_LABEL) return 1;
  else if (bl === MAX_LABEL) return -1;
  else if (al < bl) return -1;
  else return 1;
}

/**
 * This method is similar to evaluateEach for a binary operation on two facetedValues instead of one. Many more cases
 * need to be handled in the case of two facetedValues.
 *
 * @param  {(FacetedValue|*)} v1
 * @param  {(FacetedValue|*)} v2
 * @param  {Function} f
 * @param  {ExecutionContext} x
 *
 * @return {FacetedValue} facetedValue
 */
function evaluateEachPair(v1, v2, f, x) {
  let pc = x.programCounter;
  if (!(v1 instanceof FacetedValue || v2 instanceof FacetedValue)) {
    return f(v1, v2, x);
  }

  let k = head(v1) < head(v2) ? v1.label : v2.label;

  if (pc.contains(k)) {
    if (head(v1) === head(v2)) {
      return evaluateEachPair(v1.high, v2.high, f, x);
    } else if (v1 && v1.label === k) {
      return evaluateEachPair(v1.high, v2, f, x);
    } else {
      return evaluateEachPair(v1, v2.high, f, x);
    }
  }
  else if (pc.contains(k.reverse())) {
    if (head(v1) === head(v2)) {
      return evaluateEachPair(v1.low, v2.low, f, x);
    } else if (v1 && v1.label === k) {
      return evaluateEachPair(v1.low, v2, f, x);
    } else {
      return evaluateEachPair(v1, v2.low, f, x);
    }
  } else {
    if (head(v1) === head(v2)) {
      let va, vu;
      try {
        x.programCounter = pc.join(k);
        va = evaluateEachPair(v1.high, v2.high, f, x);
        x.programCounter = pc.join(k.reverse());
        vu = evaluateEachPair(v1.low, v2.low, f, x);
        x.programCounter = pc;
      } catch (e) {
          // Terminate program to avoid leaking data through exceptions
          //throw END_SIGNAL;
          throw e;
      }
      return new FacetedValue(k, va, vu);
    } else if (v1 && v1.label === k) {
      let va, vu;
      try {
        x.programCounter = pc.join(k);
        va = evaluateEachPair(v1.high, v2, f, x);
        x.programCounter = pc.join(k.reverse());
        vu = evaluateEachPair(v1.low, v2, f, x);
        x.programCounter = pc;
      } catch (e) {
          // Terminate program to avoid leaking data through exceptions
          //throw END_SIGNAL;
          throw e;
      }
      return new FacetedValue(k, va, vu);
    } else {
      let va, vu;
      try {
        x.programCounter = pc.join(k);
        va = evaluateEachPair(v1, v2.high, f, x);
        x.programCounter = pc.join(k.reverse());
        vu = evaluateEachPair(v1, v2.low, f, x);
        x.programCounter = pc;
      } catch (e) {
          // Terminate program to avoid leaking data through exceptions
          //throw END_SIGNAL;
          throw e;
        }
        return new FacetedValue(k, va, vu);
    }
  }
  throw new Error('Unhandled case of evaluateEachPair');
}

/**
 * ProgramCounter keeps track of the principal labels in the current
 * ExecutionContext defining what facets the current execution flow can access.
 *
 * @param {Label} initialLabel
 */
function ProgramCounter(initialLabel) {
  this.labelSet = [];
  if (initialLabel && !(initialLabel instanceof Label))
    throw new Error('Not a label');
  if (initialLabel)
    this.labelSet.push(initialLabel);
}

/**
 * @param  {Label} label
 *
 * @return {Boolean} result
 */
ProgramCounter.prototype.contains = function(label) {
  for (var i in this.labelSet) {
    let l = this.labelSet[i];
    if (l.value === label.value) return true;
  }
  return false;
};

/**
 * Only works for lower case strings
 * @param  {string} labelStr
 *
 * @return {Boolean} result
 */
ProgramCounter.prototype.containsStr = function(labelStr) {
    return this.contains(new Label(labelStr));
};

/**
 * Creates a duplicate of the current ProgramCounter and adds 'label' to the
 * new ProgramCounter if it doesn't already exist.
 *
 * @param  {Label} label
 *
 * @return {ProgramCounter} newPC
 */
ProgramCounter.prototype.join = function(label) {
    if (this.contains(label)) return this;
    var newPC = new ProgramCounter();
    // This a way of duplicating the array
    newPC.labelSet = this.labelSet.slice(0);
    newPC.labelSet.push(label);
    newPC.labelSet.sort(compareLabels);
    return newPC;
};

/**
 * Returns first label of the programCounter
 *
 * @return {Label} firstLabel
 */
ProgramCounter.prototype.first = function() {
  if (this.labelSet.length < 1) return null;
  else return this.labelSet[0];
};

/**
 * Returns ProgramCounter object without the first label in the current object
 *
 * @return {ProgramCounter} newPC
 */
ProgramCounter.prototype.rest = function() {
  if (this.labelSet.length < 1) return new ProgramCounter();
  else {
    var newPC = new ProgramCounter();
    newPC.labelSet = this.labelSet.slice(1);
    return newPC;
  }
};

/**
 * @return {Boolean} result
 */
ProgramCounter.prototype.isEmpty = function() {
  return this.labelSet.length < 1;
};

/**
 * @return {string} string
 */
ProgramCounter.prototype.toString = function() {
  return '{' + this.labelSet + '}';
};

/**
 * Label object associated with a prinicipal
 *
 * @param {string} value
 * @param {Boolean} bar
 */
function Label(value, bar) {
  this.value = bar ? value.toUpperCase() : value.toLowerCase();
  this.bar = bar;
};

/**
 * Reverse polarity of label. This helps tracking of implicit flows.
 *
 * @return {Label} reverseLabel
 */
Label.prototype.reverse = function() {
  return new  Label(this.value, !this.bar);
};

/**
 * @return {string} string
 */
Label.prototype.unsigned = function() {
  return this.value.toLowerCase();
};

/**
 * @return {string} string
 */
Label.prototype.toString = function() {
  return this.value;
};

/**
 * Representation of a facetedValue
 *
 * @param {Label} label - Label of principal associated with this value
 * @param {*} high - authorized view / private value
 * @param {*} low  - unauthorized view / public value
 */
function FacetedValue(label, high, low) {
  this.label = label;
  this.high = high;
  this.low = low;
}

/**
 * string representation of FacetedValue
 *
 * @return {string} string
 */
FacetedValue.prototype.toString = function() {
  return '<' + this.label + '?' + this.high + ':' + this.low + '>';
};

/**
 * Sets the programCounter in the current executionContext
 *
 * @param {ProgramCounter} pc
 */
function setPC(pc) {
  FacetExecContext.current.programCounter = pc;
}

/**
 * PolicyLibrary: Policy Agnostic Programming library
 * PolicyEnvironment stores all policies associated with labels
 */
function PolicyLibrary() {
  this.PolicyEnvironment = {};
}

PolicyLibrary.prototype = {
  mkLabel: function (labelName) {
    return new Label(labelName, false);
  },

  /**
   *
   * @param label
   * @param policy
   */
  restrict: function(label, policy) {
    //TODO: do i need to fix this?
    //if (typeof policy === "function" && typeof policy() === "boolean") {
    if (typeof policy === "function") {
      this.PolicyEnvironment[label] = policy;
    } else {
      print("Policy is not a function");
      quit();
    }
  },

  mkSensitive: cloak,

  /**
   *
   * @param context
   * @param val
   * @returns {*}
   */
  concretize: function (context, val) {
    if (val instanceof FacetedValue) {
      var label = head(val);
      var policy = this.PolicyEnvironment[label];
      if (policy(context)) {
        return this.concretize(context, val.high);
      } else {
        return this.concretize(context, val.low);
      }
    } else {
      return val;
    }
  },

  partialConcretize: function (context, val) {
    if (val instanceof FacetedValue) {
      var label = head(val);
      var policy = this.PolicyEnvironment[label];
      if (policy(context)) {
        val = val.high;
      } else {
        val = val.low;
      }
    }
    return val;
  }
};

/**
 * Returns programCounter of current executionContext
 *
 * @return {ProgramCounter} programCounter
 */
function getPC() {
  if (!FacetExecContext.current.programCounter) {
    // If no programCounter, initialize empty programCounter
    FacetExecContext.current.programCounter = new ProgramCounter();
  }
  return FacetExecContext.current.programCounter;
}

/**
 * Returns a facetedValue restricting access to if current programCounter does
 * not contain the 'principal' label or reverse of 'principal' label.
 * If current programCounter contains the 'principal' label then no need to
 * restrict access to 'value'.
 * If current programCounter contains reverse of the 'principal' label then
 * return undefined.
 *
 * @param  {*} highValue
 * @param  {*} lowValue
 * @param  {*} label
 *
 * @return {*}
 */
function cloak(label, highValue, lowValue) {
  if (!label)
    throw new Error('Must specify a principal.');
  if (!(label instanceof Label)) {
    label = new Label(label);
  }
  var pc = getPC();
  if (pc.contains(label))
    return highValue;
  else if (pc.contains(label.reverse()))
    return lowValue;
  else
    return new FacetedValue(label, highValue, lowValue);
}

// Functions that can be used by programs to incorporate faceted Behaviour.
definitions.defineProperty(facetedGlobalBase, "PolicyLibrary", PolicyLibrary, true, true);
interpreter.resetEnvironment();