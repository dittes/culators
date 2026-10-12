const OPERATORS = new Set(['+', '-', '*', '/']);
const MAX_SIGNIFICANT_DIGITS = 12;
const MAX_ENTRY_LENGTH = 24;

const symbolFor = key => ({ '*': '×', '/': '÷' })[key] || key;

function significantDigits(text) {
  const digits = text.replace(/[^0-9]/g, '').replace(/^0+/, '');
  return digits.length;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return null;
  if (Object.is(value, -0) || value === 0) return '0';
  // Keep results readable while avoiding long binary floating-point tails.
  return String(Number(value.toPrecision(12)));
}

export function createCalculator() {
  let entry = '0';
  let entryFresh = true;
  let accumulator = null;
  let pendingOperator = null;
  let repeatOperator = null;
  let repeatOperand = null;
  let memory = 0;
  let memoryActive = false;
  let error = '';
  let justCalculated = false;
  let expression = '';

  const value = () => Number(entry);

  function fail(message = 'Result is outside the supported range.') {
    error = message;
    entry = '0';
    entryFresh = true;
    accumulator = null;
    pendingOperator = null;
    repeatOperator = null;
    repeatOperand = null;
    expression = '';
    justCalculated = false;
  }

  function acceptResult(result) {
    const formatted = formatNumber(result);
    if (formatted === null) {
      fail('Result is outside the supported range.');
      return false;
    }
    entry = formatted;
    entryFresh = true;
    return true;
  }

  function calculate(left, operator, right) {
    if (operator === '/' && right === 0) return null;
    switch (operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      default: return null;
    }
  }

  function displayText() {
    if (error) return 'Error';
    return entry;
  }

  function snapshot() {
    let shownExpression = expression;
    if (pendingOperator && !entryFresh) {
      shownExpression = `${formatNumber(accumulator)} ${symbolFor(pendingOperator)}`;
    }
    return {
      display: displayText(),
      expression: shownExpression,
      memoryActive,
      error,
      justCalculated
    };
  }

  function beginFreshInput() {
    if (error) {
      error = '';
      entry = '0';
      entryFresh = true;
      accumulator = null;
      pendingOperator = null;
      repeatOperator = null;
      repeatOperand = null;
      expression = '';
      justCalculated = false;
    }
    if (justCalculated && !pendingOperator) {
      expression = '';
      repeatOperator = null;
      repeatOperand = null;
      justCalculated = false;
    }
    if (entryFresh) {
      entry = '0';
      entryFresh = false;
    }
  }

  function pressDigit(digit) {
    beginFreshInput();
    if (significantDigits(entry) >= MAX_SIGNIFICANT_DIGITS) return;
    if (entry === '0' || entry === '-0') {
      entry = digit === '0' ? (entry.startsWith('-') ? '-0' : '0') : (entry.startsWith('-') ? `-${digit}` : digit);
    } else {
      const next = entry + digit;
      if (next.length <= MAX_ENTRY_LENGTH) entry = next;
    }
  }

  function pressDecimal() {
    beginFreshInput();
    if (!entry.includes('.')) {
      if (entry.length + 1 <= MAX_ENTRY_LENGTH) entry += '.';
    }
  }

  function pressOperator(operator) {
    if (error) return;
    if (pendingOperator && !entryFresh) {
      const left = accumulator;
      const right = value();
      const result = calculate(left, pendingOperator, right);
      if (result === null) return fail('Cannot divide by zero.');
      if (!acceptResult(result)) return;
      accumulator = Number(entry);
    } else if (accumulator === null || !pendingOperator) {
      accumulator = value();
    }
    pendingOperator = operator;
    repeatOperator = null;
    repeatOperand = null;
    expression = `${formatNumber(accumulator)} ${symbolFor(operator)}`;
    entryFresh = true;
    justCalculated = false;
  }

  function pressEquals() {
    if (error) return;
    if (pendingOperator && accumulator !== null) {
      const operator = pendingOperator;
      const left = accumulator;
      const right = entryFresh ? left : value();
      const result = calculate(left, operator, right);
      if (result === null) return fail('Cannot divide by zero.');
      if (!acceptResult(result)) return;
      expression = `${formatNumber(left)} ${symbolFor(operator)} ${formatNumber(right)} =`;
      repeatOperator = operator;
      repeatOperand = right;
      pendingOperator = null;
      accumulator = null;
      justCalculated = true;
      return;
    }
    if (justCalculated && repeatOperator && repeatOperand !== null) {
      const left = value();
      const result = calculate(left, repeatOperator, repeatOperand);
      if (result === null) return fail('Cannot divide by zero.');
      if (!acceptResult(result)) return;
      expression = `${formatNumber(left)} ${symbolFor(repeatOperator)} ${formatNumber(repeatOperand)} =`;
      justCalculated = true;
    }
  }

  function pressPercent() {
    if (error) return;
    const input = entryFresh ? 0 : value();
    let result = input / 100;
    if (pendingOperator === '+' || pendingOperator === '-') result = accumulator * input / 100;
    if (!acceptResult(result)) return;
    entryFresh = false;
    justCalculated = !pendingOperator;
  }

  function pressUnary(operation) {
    if (error) return;
    const before = value();
    let result;
    let name;
    switch (operation) {
      case 'sign': result = -before; name = '±'; break;
      case 'sqrt': if (before < 0) return fail('Square root needs a nonnegative number.'); result = Math.sqrt(before); name = '√'; break;
      case 'square': result = before * before; name = 'square'; break;
      case 'reciprocal': if (before === 0) return fail('Cannot take the reciprocal of zero.'); result = 1 / before; name = '1/'; break;
      default: return;
    }
    if (!acceptResult(result)) return;
    if (operation !== 'sign') expression = `${name}(${formatNumber(before)})`;
    entryFresh = false;
    justCalculated = !pendingOperator;
    if (operation === 'sign') justCalculated = !pendingOperator;
  }

  function clear() {
    entry = '0';
    entryFresh = true;
    accumulator = null;
    pendingOperator = null;
    repeatOperator = null;
    repeatOperand = null;
    error = '';
    justCalculated = false;
    expression = '';
  }

  function clearEntry() {
    entry = '0';
    entryFresh = false;
    error = '';
    justCalculated = false;
    if (!pendingOperator) {
      accumulator = null;
      repeatOperator = null;
      repeatOperand = null;
      expression = '';
    }
  }

  function backspace() {
    if (error) return;
    if (entryFresh) {
      if (justCalculated) {
        entryFresh = false;
        justCalculated = false;
      } else return;
    }
    const next = entry.length <= 1 || (entry.length === 2 && entry.startsWith('-'))
      ? '0'
      : entry.slice(0, -1);
    entry = next === '-' ? '0' : next;
  }

  function memoryAdd(direction) {
    if (error) return;
    const next = memory + direction * value();
    if (!Number.isFinite(next)) return fail();
    memory = Number(formatNumber(next));
    memoryActive = true;
  }

  function press(key) {
    if (typeof key !== 'string') throw new TypeError('Calculator key must be a string.');
    if (/^[0-9]$/.test(key)) pressDigit(key);
    else if (key === '.') pressDecimal();
    else if (OPERATORS.has(key)) pressOperator(key);
    else switch (key) {
      case '=': pressEquals(); break;
      case 'percent': pressPercent(); break;
      case 'sign': case 'sqrt': case 'square': case 'reciprocal': pressUnary(key); break;
      case 'backspace': backspace(); break;
      case 'clear': clear(); break;
      case 'clearEntry': clearEntry(); break;
      case 'mc': memory = 0; memoryActive = false; break;
      case 'mr':
        if (!error) {
          entry = formatNumber(memory) ?? '0';
          entryFresh = false;
          justCalculated = false;
        }
        break;
      case 'm+': memoryAdd(1); break;
      case 'm-': memoryAdd(-1); break;
      default: throw new RangeError(`Unknown calculator key: ${key}`);
    }
    return snapshot();
  }

  return { press, snapshot };
}
