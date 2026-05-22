const ALLOWED_PATTERN = /^[\d.+\-*/()\s]+$/

/**
 * Evalúa expresiones con +, -, *, / y paréntesis sin usar eval().
 * @param {string} expression
 * @returns {number}
 */
export function safeEvaluateExpression(expression) {
  const trimmed = expression?.trim()
  if (!trimmed) {
    throw new Error('Ingresá un importe')
  }

  if (!ALLOWED_PATTERN.test(trimmed)) {
    throw new Error('Caracteres no permitidos en la expresión')
  }

  const tokens = tokenize(trimmed)
  if (tokens.length === 0) {
    throw new Error('Expresión inválida')
  }

  const rpn = toRpn(tokens)
  const result = evaluateRpn(rpn)

  if (!Number.isFinite(result)) {
    throw new Error('Resultado inválido')
  }

  return Math.round(result * 100) / 100
}

function tokenize(expression) {
  const tokens = []
  let i = 0

  while (i < expression.length) {
    const char = expression[i]

    if (char === ' ') {
      i += 1
      continue
    }

    if ('+-*/()'.includes(char)) {
      const prev = tokens[tokens.length - 1]
      const isUnary =
        char === '-' &&
        (!prev || (typeof prev === 'string' && '+-*/('.includes(prev)))

      if (isUnary) {
        tokens.push('u-')
      } else {
        tokens.push(char)
      }
      i += 1
      continue
    }

    if (char === '.' || (char >= '0' && char <= '9')) {
      let numStr = ''
      while (i < expression.length && (expression[i] === '.' || expression[i] >= '0' && expression[i] <= '9')) {
        numStr += expression[i]
        i += 1
      }
      const value = Number(numStr)
      if (Number.isNaN(value)) {
        throw new Error('Número inválido')
      }
      tokens.push(value)
      continue
    }

    throw new Error('Expresión inválida')
  }

  return tokens
}

const PRECEDENCE = { 'u-': 3, '*': 2, '/': 2, '+': 1, '-': 1 }

function toRpn(tokens) {
  const output = []
  const operators = []

  for (const token of tokens) {
    if (typeof token === 'number') {
      output.push(token)
      continue
    }

    if (token === 'u-') {
      operators.push(token)
      continue
    }

    if (token === '(') {
      operators.push(token)
      continue
    }

    if (token === ')') {
      while (operators.length && operators[operators.length - 1] !== '(') {
        output.push(operators.pop())
      }
      if (operators.pop() !== '(') {
        throw new Error('Paréntesis desbalanceados')
      }
      if (operators[operators.length - 1] === 'u-') {
        output.push(operators.pop())
      }
      continue
    }

    while (
      operators.length &&
      operators[operators.length - 1] !== '(' &&
      PRECEDENCE[operators[operators.length - 1]] >= PRECEDENCE[token]
    ) {
      output.push(operators.pop())
    }
    operators.push(token)
  }

  while (operators.length) {
    const op = operators.pop()
    if (op === '(' || op === ')') {
      throw new Error('Paréntesis desbalanceados')
    }
    output.push(op)
  }

  return output
}

function evaluateRpn(tokens) {
  const stack = []

  for (const token of tokens) {
    if (typeof token === 'number') {
      stack.push(token)
      continue
    }

    if (token === 'u-') {
      const value = stack.pop()
      stack.push(-value)
      continue
    }

    const b = stack.pop()
    const a = stack.pop()

    switch (token) {
      case '+':
        stack.push(a + b)
        break
      case '-':
        stack.push(a - b)
        break
      case '*':
        stack.push(a * b)
        break
      case '/':
        if (b === 0) throw new Error('No se puede dividir por cero')
        stack.push(a / b)
        break
      default:
        throw new Error('Operador desconocido')
    }
  }

  if (stack.length !== 1) {
    throw new Error('Expresión inválida')
  }

  return stack[0]
}

/**
 * Formatea un número con separadores de miles y 2 decimales.
 */
export function formatAmountDisplay(value, locale = 'es-AR') {
  if (value == null || Number.isNaN(value)) return ''
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
