import { SourceLocation } from 'FunBlocks/AST/SourceLocation'
import { SourceRange } from 'FunBlocks/AST/SourceRange'
import { Token, TokenKind } from './Token'

/// Returns whether the given character is any whitespace character, excluding newlines.
const isSkip = (ch: string): boolean =>
  (ch === ' ') || (ch === '\t') || (ch === '\f') || (ch === '\v') || (ch === '\r')

/// Returns whether the given character represents any whitespace, including newlines.
const isWhitespace = (ch: string): boolean =>
  (ch === '\n') || isSkip(ch)

/// Returns whether the given character represents a newline.
const isNewline = (ch: string): boolean =>
  (ch === '\n')

/// A regular expression that matches operators.
const operatorRE = RegExp(/(->)|(=>)|[;,:|]/)

/// A regular expression that matches keywords, variable references and identifiers.
const identRE = RegExp(/^\$?\w+/)

/// A collection of tokens.
export interface TokenCollection {

  /// Returns an iterator over this collection.
  [Symbol.iterator](): Iterator<Token>

}

/// Returns a collection containing the tokens that constitute the given character string.
export const tokenize = (input: string): TokenCollection => {

  return {
    [Symbol.iterator]: () => createLexer(input),
  }

}

/// Creates a lexer over the given character string.
///
/// The returned lexer is given as an iterator that uses the input string as a stream to produce
/// tokens every time its `next` method is called.
export const createLexer = (input: string): Iterator<Token> => {

  /// Stores the lexer's current source location.
  let currentLoc: SourceLocation = { line: 1, column: 1, offset: 0 }

  /// Stores whether the lexer has scanned all the input.
  let done = false

  /// Returns the character at the given offset relative to the lexer's curret index, without
  /// consuming the input stream.
  const peek = (offset: number = 0): Optional<string> =>
    (currentLoc.offset + offset) < input.length
      ? input[currentLoc.offset + offset]
      : null

  /// Consumes a single character from the lexer's stream.
  const consume = (): Optional<string> => {
    // Make sure the stream isn't depleted.
    const ch = peek()
    if (ch === null) {
      return null
    }

    // Compute the next source location.
    const nextLoc = { line: -1, column: -1, offset: currentLoc.offset + 1 }
    if (ch === '\n') {
      nextLoc.line = currentLoc.line + 1
      nextLoc.column = 1
    } else {
      nextLoc.line = currentLoc.line
      nextLoc.column = currentLoc.column + 1
    }
    currentLoc = nextLoc as SourceLocation

    return ch
  }

  /// Consumes up to the given number of characters from the lexer's stream.
  const consumeUpTo = (count: number): string => {
    const startIndex = currentLoc.offset
    for (let i = 0; i < count; ++i) {
      if (peek() === null) {
        break
      }
      consume()
    }
    return input.substring(startIndex, currentLoc.offset)
  }

  /// Consumes characters from the lexer's stream as long as they satisfy the given predicate.
  const consumeWhile = (predicate: ((char: string) => boolean)): string => {
    const startIndex = currentLoc.offset
    while ((peek() !== null) && predicate(peek())) {
      consume()
    }
    return input.substring(startIndex, currentLoc.offset)
  }

  /// Creates a source range from the given location lexer's current one.
  const rangeFrom = (startLoc: SourceLocation): SourceRange => ({
    lowerBound: startLoc,
    upperBound: currentLoc,
  })

  /// A small helper that creates a result.
  const result = (kind: TokenKind, range: SourceRange): IteratorResult<Token> => ({
    value: { kind, range }
  })

  return {
    next: (): IteratorResult<Token> => {
      // Make sure the lexer's stream isn't depleted.
      if (done) {
        return { value: undefined, done }
      }

      // Handle characters that should be skipped.
      while (true) {
        // Ignore whitespaces, except newlines.
        consumeWhile(isSkip)

        const ch = peek()

        // Handle the end of stream.
        if (ch === null) {
          done = true
          return result(TokenKind.EOF, rangeFrom(currentLoc))
        }

        // Ignore comments.
        if ((ch === '/') && (peek(1) === '/')) {
          consumeUpTo(2)
          consumeWhile((c) => !isNewline(c))
        } else {
          break
        }
      }

      // From this point, all characters that had to be skipped have been consumed. It follows that
      // the next character will necessarily part of a token.
      const ch = peek()
      let kind: Optional<TokenKind> = null

      // Save the current location to build source ranges.
      const startLoc = { ...currentLoc }

      // Handle statement terminators.
      if ((ch === '\n') || (ch === ';')) {
        consume()
        kind = ch === '\n'
          ? TokenKind.Newline
          : TokenKind.Semicolon
        const rv = result(kind, rangeFrom(startLoc))

        // Skip all consecutive whitespaces.
        consumeWhile(isWhitespace)

        return rv
      }

      // Handle 2-character operators.
      switch (input.substring(currentLoc.offset, currentLoc.offset + 2)) {
      case '->': kind = TokenKind.Arrow; break
      case '=>': kind = TokenKind.ThickArrow; break
      case '::': kind = TokenKind.DoubleColon; break
      default: break
      }

      if (kind !== null) {
        consumeUpTo(2)
        return result(kind, rangeFrom(startLoc))
      }

      // Handle single character operators (note that ";" is processed earlier).
      switch (ch) {
      case '|': kind = TokenKind.Or; break
      case ',': kind = TokenKind.Comma; break
      case '(': kind = TokenKind.LeftParen; break
      case ')': kind = TokenKind.RightParen; break
      default: break
      }

      if (kind !== null) {
        consume()
        return result(kind, rangeFrom(startLoc))
      }

      // Handle keywords, variable references and identifiers by consuming all alphanumeric or "_"
      // characters at the prefix of the lexer's stream.
      let match = input.substring(currentLoc.offset).match(identRE)
      if (match === null) {
        consume()
        return result(TokenKind.Unrecognized, rangeFrom(startLoc))
      }

      // Determine if the prefix is a keyword or an identifier.
      const ident = match[0]
      switch (ident) {
      case 'type': kind = TokenKind.TypeKeyword; break
      case 'init': kind = TokenKind.InitKeyword; break
      case 'rule': kind = TokenKind.RuleKeyword; break
      case 'case': kind = TokenKind.CaseKeyword; break
      default:
        kind = ident[0] === '$'
          ? TokenKind.VarRef
          : TokenKind.Ident
        break
      }

      consumeUpTo(ident.length)
      return result(kind, rangeFrom(startLoc))
    }
  }

}
