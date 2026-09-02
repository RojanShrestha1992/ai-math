/**
 * LaTeX Parser Utility
 *
 * Converts LaTeX notation (as produced by MathLive) into Math.js-compatible
 * expression strings. This is the critical bridge between the frontend's
 * math input and the backend's computation engine.
 *
 * @module latexParser
 */

const math = require('mathjs')

// Known function names that must NOT be split by implicit multiplication.
const FUNCTION_NAMES = [
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh', 'log', 'ln', 'sqrt',
  'abs', 'exp', 'ceil', 'floor', 'round', 'sign', 'nthRoot',
  'derivative', 'integrate', 'sum', 'limit'
]

// Constants that should be treated as values, not variables.
const CONSTANTS = ['pi', 'e', 'Infinity', 'tau', 'phi']

const MAX_ITERATIONS = 20

/**
 * Convert a LaTeX string into a Math.js-compatible expression string.
 *
 * @param {string} latex - The raw LaTeX input.
 * @returns {string} A Math.js-compatible expression string.
 * @throws {Error} If the input is empty, null, or unparseable.
 */
function latexToExpression(latex) {
  if (latex === null || latex === undefined) {
    throw new Error('LaTeX input is required')
  }

  const trimmed = String(latex).trim()
  if (trimmed.length === 0) {
    throw new Error('LaTeX input cannot be empty')
  }

  try {
    let expr = trimmed

    // Iteratively apply structural replacements (fractions, roots, etc.)
    // until no more changes occur, with a safety iteration limit.
    let previous = ''
    let iterations = 0
    while (expr !== previous && iterations < MAX_ITERATIONS) {
      previous = expr
      expr = applyStructuralReplacements(expr)
      iterations += 1
    }

    // Apply simple token replacements (functions, constants, symbols).
    expr = applyTokenReplacements(expr)

    // Move exponents on function names after their argument: sin^2(x) -> sin(x)^2
    expr = moveFunctionExponents(expr)

    // Add implicit multiplication operators.
    expr = addImplicitMultiplication(expr)

    // Clean up whitespace and redundant parentheses.
    expr = cleanUp(expr)

    console.log(`[latexParser] "${latex}" -> "${expr}"`)
    return expr
  } catch (error) {
    console.error(`[latexParser] Failed to parse LaTeX: "${latex}"`, error.message)
    throw new Error(`Could not parse LaTeX: "${latex}"`)
  }
}

/**
 * Apply structural replacements that may nest (fractions, roots, wrappers).
 * These are applied iteratively so nested structures resolve correctly.
 *
 * @param {string} expr - The current expression string.
 * @returns {string} The expression with structural replacements applied.
 */
function applyStructuralReplacements(expr) {
  let result = expr

  // \frac{d}{dx}(...) derivative notation -> derivative(...)
  result = result.replace(/\\frac\{d\}\{dx\}/g, 'derivative')

  // \frac{a}{b} -> (a)/(b)  (also \dfrac, \tfrac) — handles nested braces
  result = replaceFraction(result)

  // \sqrt[n]{x} -> nthRoot(x, n)  and  \sqrt{x} -> sqrt(x)
  result = replaceSqrt(result)

  // \left\| ... \right\| -> abs(...)
  result = result.replace(/\\left\|/g, 'abs(')
  result = result.replace(/\\right\|/g, ')')

  // \left( \right) -> ( )
  result = result.replace(/\\left\(/g, '(')
  result = result.replace(/\\right\)/g, ')')

  // \left[ \right] -> [ ]
  result = result.replace(/\\left\[/g, '[')
  result = result.replace(/\\right\]/g, ']')

  // \left\{ \right\} -> { }
  result = result.replace(/\\left\{/g, '{')
  result = result.replace(/\\right\}/g, '}')

  // \mathrm{...} -> ...  (remove wrapper)
  result = replaceBalanced(result, /\\mathrm/, (content) => content)

  // \text{...} -> ...  (remove wrapper)
  result = replaceBalanced(result, /\\text/, (content) => content)

  // Convert ^{...} exponents -> ^...  (e.g. x^{2} -> x^2)
  result = replaceBalanced(result, /\^/, (content) => `^${content}`)

  // Convert _{...} subscripts -> _...  (e.g. x_{i} -> x_i)
  result = replaceBalanced(result, /\_/, (content) => `_${content}`)

  // Convert remaining {group} braces to parentheses for grouping.
  result = replaceBalanced(result, /\{/, (content) => `(${content})`)

  return result
}

/**
 * Replace \sqrt[n]{x} -> nthRoot(x, n) and \sqrt{x} -> sqrt(x), handling
 * nested braces and an optional bracket index argument.
 *
 * @param {string} expr - The expression string.
 * @returns {string} The expression with square roots replaced.
 */
function replaceSqrt(expr) {
  const regex = /\\sqrt/g
  let result = expr
  let match

  const matches = []
  while ((match = regex.exec(result)) !== null) {
    matches.push({ index: match.index, length: match[0].length })
  }

  // Process from the end so earlier indices remain valid.
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const { index, length } = matches[i]
    let cursor = index + length

    let indexArg = null
    if (result[cursor] === '[') {
      const bracketEnd = findClosing(result, cursor, '[', ']')
      indexArg = result.slice(cursor + 1, bracketEnd)
      cursor = bracketEnd + 1
    }

    if (result[cursor] !== '{') continue
    const braceEnd = findClosing(result, cursor, '{', '}')
    const radicand = result.slice(cursor + 1, braceEnd)
    cursor = braceEnd + 1

    const replacement = indexArg !== null
      ? `nthRoot(${radicand}, ${indexArg})`
      : `sqrt(${radicand})`

    const prefix = result.slice(0, index)
    const suffix = result.slice(cursor)
    result = `${prefix}${replacement}${suffix}`
  }

  return result
}

/**
 * Replace \frac{a}{b} (and variants) with (a)/(b), handling nested braces
 * in both arguments.
 *
 * @param {string} expr - The expression string.
 * @returns {string} The expression with fractions replaced.
 */
function replaceFraction(expr) {
  const regex = /\\[dt]?frac/g
  let result = expr
  let match

  const matches = []
  while ((match = regex.exec(result)) !== null) {
    matches.push(match.index)
  }

  // Process from the end so earlier indices remain valid.
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const index = matches[i]
    const cmdLen = result.slice(index).match(/\\[dt]?frac/)[0].length
    let cursor = index + cmdLen

    if (result[cursor] !== '{') continue
    const numEnd = findClosing(result, cursor, '{', '}')
    const numerator = result.slice(cursor + 1, numEnd)
    cursor = numEnd + 1

    if (result[cursor] !== '{') continue
    const denEnd = findClosing(result, cursor, '{', '}')
    const denominator = result.slice(cursor + 1, denEnd)
    cursor = denEnd + 1

    const prefix = result.slice(0, index)
    const suffix = result.slice(cursor)
    result = `${prefix}(${numerator})/(${denominator})${suffix}`
  }

  return result
}

/**
 * Replace a LaTeX command that takes a single brace-delimited argument,
 * handling nested braces. Supports an optional leading bracket argument
 * (e.g. \sqrt[n]).
 *
 * @param {string} expr - The expression string.
 * @param {RegExp} commandRegex - Regex matching the command.
 * @param {Function} replacer - Function receiving the argument(s) and
 *   returning the replacement string.
 * @param {boolean} hasBracketArg - Whether the command has a [n] argument.
 * @returns {string} The expression with the command replaced.
 */
function replaceBalanced(expr, commandRegex, replacer, hasBracketArg = false) {
  let result = expr
  const regex = new RegExp(commandRegex.source, 'g')
  let match

  const matches = []
  while ((match = regex.exec(result)) !== null) {
    matches.push({ index: match.index, length: match[0].length })
  }

  // Process from the end so earlier indices remain valid.
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const { index, length } = matches[i]
    let cursor = index + length

    let bracketArg = null
    if (hasBracketArg) {
      if (result[cursor] === '[') {
        const bracketEnd = findClosing(result, cursor, '[', ']')
        bracketArg = result.slice(cursor + 1, bracketEnd)
        cursor = bracketEnd + 1
      }
    }

    if (result[cursor] !== '{') continue
    const braceEnd = findClosing(result, cursor, '{', '}')
    const content = result.slice(cursor + 1, braceEnd)
    cursor = braceEnd + 1

    const replacement = hasBracketArg
      ? replacer(bracketArg, content)
      : replacer(content)

    const prefix = result.slice(0, index)
    const suffix = result.slice(cursor)
    result = `${prefix}${replacement}${suffix}`
  }

  return result
}

/**
 * Find the index of the closing delimiter for a balanced pair starting at
 * the opening delimiter index.
 *
 * @param {string} str - The string to search.
 * @param {number} openIndex - Index of the opening delimiter.
 * @param {string} open - The opening character.
 * @param {string} close - The closing character.
 * @returns {number} Index of the matching closing delimiter.
 */
function findClosing(str, openIndex, open, close) {
  let depth = 0
  for (let i = openIndex; i < str.length; i += 1) {
    if (str[i] === open) depth += 1
    else if (str[i] === close) {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return str.length - 1
}

/**
 * Apply simple token replacements (functions, constants, symbols, spaces).
 *
 * @param {string} expr - The current expression string.
 * @returns {string} The expression with token replacements applied.
 */
function applyTokenReplacements(expr) {
  let result = expr

  // Degree symbol: ^{\\circ} -> deg
  result = result.replace(/\^\{?\\circ\}?/g, 'deg')

  // \ln -> log (Math.js uses log for natural log)
  result = result.replace(/\\ln\b/g, 'log')

  // \pm -> ± (keep as symbol, handled in solver)
  result = result.replace(/\\pm\b/g, '±')

  // \cdot -> *  (always replace: \cdot4 must become *4)
  result = result.replace(/\\cdot/g, '*')

  // \times -> *  (always replace: \times4 must become *4)
  result = result.replace(/\\times/g, '*')

  // \div -> /
  result = result.replace(/\\div\b/g, '/')

  // \neq -> !=
  result = result.replace(/\\neq\b/g, '!=')

  // \leq -> <=
  result = result.replace(/\\leq\b/g, '<=')

  // \geq -> >=
  result = result.replace(/\\geq\b/g, '>=')

  // \infty -> Infinity
  result = result.replace(/\\infty\b/g, 'Infinity')

  // \int -> integrate (placeholder, not solved in MVP)
  result = result.replace(/\\int\b/g, 'integrate')

  // \sum -> sum (placeholder)
  result = result.replace(/\\sum\b/g, 'sum')

  // \lim -> limit (placeholder)
  result = result.replace(/\\lim\b/g, 'limit')

  // \frac{d}{dx} derivative notation -> derivative placeholder
  result = result.replace(/\\frac\{d\}\{dx\}/g, 'derivative')

  // Greek letters and constants: remove backslash
  result = result.replace(/\\(pi|theta|alpha|beta|gamma|delta|epsilon|zeta|eta|lambda|mu|nu|xi|rho|sigma|tau|phi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Phi|Psi|Omega)\b/g, '$1')

  // Remove backslash from remaining function names
  result = result.replace(/\\(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|log|sqrt|abs|exp|ceil|floor|round|sign|nthRoot)\b/g, '$1')

  // Spaces: thin space, thick space, non-breaking space -> regular space
  result = result.replace(/\\,/g, ' ')
  result = result.replace(/\\;/g, ' ')
  result = result.replace(/\\!/g, '')
  result = result.replace(/~/g, ' ')

  // Remove any remaining backslashes (unknown commands)
  result = result.replace(/\\/g, '')

  return result
}

/**
 * Move exponents applied to function names after their argument.
 * e.g. sin^2(x) -> sin(x)^2, cos^3(x) -> cos(x)^3.
 * Math.js interprets sin^2(x) incorrectly, so this normalization is needed.
 *
 * @param {string} expr - The expression string.
 * @returns {string} The expression with function exponents moved.
 */
function moveFunctionExponents(expr) {
  const names = FUNCTION_NAMES.join('|')
  const pattern = new RegExp(`\\b(${names})\\^([0-9]+)\\(`, 'g')
  let result = expr
  let match

  // Collect all matches first (with their positions) to avoid mutation issues.
  const matches = []
  while ((match = pattern.exec(result)) !== null) {
    matches.push({ index: match.index, fn: match[1], exp: match[2] })
  }

  // Process from the end so earlier indices remain valid.
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const { index, fn, exp } = matches[i]
    const openIndex = result.indexOf('(', index)
    const closeIndex = findClosing(result, openIndex, '(', ')')
    const inner = result.slice(openIndex + 1, closeIndex)
    const prefix = result.slice(0, index)
    const suffix = result.slice(closeIndex + 1)
    result = `${prefix}${fn}(${inner})^${exp}${suffix}`
  }

  return result
}

/**
 * Add explicit multiplication operators where Math.js requires them.
 * Protects function names so they are not split into individual letters.
 *
 * @param {string} expr - The expression string.
 * @returns {string} The expression with implicit multiplication added.
 */
function addImplicitMultiplication(expr) {
  let result = expr

  // Protect function names by replacing them with placeholders.
  const placeholders = {}
  FUNCTION_NAMES.forEach((name, index) => {
    const token = `__FN${index}__`
    placeholders[token] = name
    result = result.replace(new RegExp(`\\b${name}\\b`, 'g'), token)
  })

  // Number followed by variable: 2x -> 2*x
  result = result.replace(/(\d)([a-zA-Z])/g, '$1*$2')

  // Number followed by ( : 2(x+1) -> 2*(x+1)
  result = result.replace(/(\d)\(/g, '$1*(')

  // ) followed by ( : (x+1)(x-1) -> (x+1)*(x-1)
  result = result.replace(/\)\(/g, ')*(')

  // ) followed by variable: (x+1)y -> (x+1)*y
  result = result.replace(/\)([a-zA-Z])/g, ')*$1')

  // Variable followed by ( : x(x+1) -> x*(x+1)
  result = result.replace(/([a-zA-Z])\(/g, '$1*(')

  // Number followed by fraction result: 2(1)/(2) already handled by number-( rule

  // Restore function names from placeholders.
  Object.entries(placeholders).forEach(([token, name]) => {
    result = result.replace(new RegExp(token, 'g'), name)
  })

  return result
}

/**
 * Clean up whitespace and redundant parentheses.
 *
 * @param {string} expr - The expression string.
 * @returns {string} The cleaned expression string.
 */
function cleanUp(expr) {
  let result = expr

  // Collapse multiple spaces into one.
  result = result.replace(/\s+/g, ' ').trim()

  // Remove spaces around operators for a compact, Math.js-friendly form.
  result = result.replace(/\s*([+\-*/=<>])\s*/g, '$1')

  // Remove spaces after ( and before ).
  result = result.replace(/\(\s+/g, '(')
  result = result.replace(/\s+\)/g, ')')

  // Remove spaces after commas (e.g. nthRoot(8, 3) -> nthRoot(8,3)).
  result = result.replace(/,\s+/g, ',')

  // Remove redundant double parentheses like ((x)) -> (x)
  result = result.replace(/\(\(([^()]*)\)\)/g, '($1)')

  return result
}

/**
 * Determine whether an expression is an equation (contains a single = sign).
 *
 * @param {string} expression - The parsed expression string.
 * @returns {boolean} True if the expression is an equation.
 */
function isEquation(expression) {
  if (!expression) return false
  // Exclude ==, <=, >=, !=
  const cleaned = expression
    .replace(/==/g, '')
    .replace(/<=/g, '')
    .replace(/>=/g, '')
    .replace(/!=/g, '')
  return cleaned.includes('=')
}

/**
 * Split an equation at the first = sign.
 *
 * @param {string} expression - The parsed equation string.
 * @returns {{ lhs: string, rhs: string }} The left and right hand sides.
 */
function splitEquation(expression) {
  const index = expression.indexOf('=')
  if (index === -1) {
    return { lhs: expression, rhs: '' }
  }
  return {
    lhs: expression.slice(0, index),
    rhs: expression.slice(index + 1)
  }
}

/**
 * Extract unique variable names from an expression, excluding function
 * names and constants.
 *
 * @param {string} expression - The parsed expression string.
 * @returns {string[]} Array of unique variable names.
 */
function extractVariables(expression) {
  if (!expression) return []

  // Remove function names and constants so they are not treated as variables.
  let cleaned = expression
  FUNCTION_NAMES.forEach((name) => {
    cleaned = cleaned.replace(new RegExp(`\\b${name}\\b`, 'g'), ' ')
  })
  CONSTANTS.forEach((name) => {
    cleaned = cleaned.replace(new RegExp(`\\b${name}\\b`, 'g'), ' ')
  })

  // Match single-letter variables (and multi-letter like theta, alpha).
  const matches = cleaned.match(/[a-zA-Z]+/g) || []
  const variables = new Set()
  matches.forEach((token) => {
    // Single letters are variables; multi-letter tokens are variables only
    // if they are not known functions/constants (already removed above).
    if (token.length === 1) {
      variables.add(token)
    } else if (!FUNCTION_NAMES.includes(token) && !CONSTANTS.includes(token)) {
      variables.add(token)
    }
  })

  return Array.from(variables)
}

/**
 * Determine the highest power of a variable in an expression.
 *
 * @param {string} expression - The parsed expression string.
 * @param {string} variable - The variable to find the degree of.
 * @returns {number} The degree (highest power) of the variable.
 */
function getDegree(expression, variable) {
  if (!expression || !variable) return 0

  try {
    const node = math.parse(expression)
    let maxDegree = 0
    let variableSeen = false

    const visit = (current) => {
      if (current.isSymbolNode && current.name === variable) {
        variableSeen = true
      }
      if (current.isOperatorNode && current.op === '^') {
        const base = current.args[0]
        const exponent = current.args[1]
        // Check if the base contains the variable.
        if (containsVariable(base, variable)) {
          if (exponent.isConstantNode) {
            const value = Number(exponent.value)
            if (Number.isFinite(value) && value > maxDegree) {
              maxDegree = value
            }
          } else {
            // Non-constant exponent: treat as degree 1 (conservative).
            if (maxDegree < 1) maxDegree = 1
          }
        }
      }
      if (current.args) {
        current.args.forEach(visit)
      }
    }

    visit(node)

    // If the variable appears but no explicit power was found, it is degree 1.
    if (variableSeen && maxDegree === 0) {
      maxDegree = 1
    }
    return maxDegree
  } catch (error) {
    // Fall back to regex-based approximation.
    const regex = new RegExp(`${variable}\\^\\{?([0-9]+)\\}?`, 'g')
    let match
    let maxDegree = 0
    while ((match = regex.exec(expression)) !== null) {
      const degree = Number(match[1])
      if (degree > maxDegree) maxDegree = degree
    }
    // If the variable appears without an explicit power, it is degree 1.
    if (maxDegree === 0 && new RegExp(`\\b${variable}\\b`).test(expression)) {
      maxDegree = 1
    }
    return maxDegree
  }
}

/**
 * Check whether a Math.js node contains a given variable.
 *
 * @param {object} node - A Math.js node.
 * @param {string} variable - The variable name.
 * @returns {boolean} True if the node references the variable.
 */
function containsVariable(node, variable) {
  if (node.isSymbolNode) {
    return node.name === variable
  }
  if (node.args) {
    return node.args.some((arg) => containsVariable(arg, variable))
  }
  return false
}

module.exports = {
  latexToExpression,
  isEquation,
  splitEquation,
  extractVariables,
  getDegree,
  FUNCTION_NAMES,
  CONSTANTS
}
