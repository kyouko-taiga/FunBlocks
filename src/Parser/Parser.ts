import * as AST from 'FunBlocks/AST'
import { tokenize } from './Lexer'
import { Token, TokenKind } from './Token'

/// Returns whether the given token kind corresponds to a keyword.
const isKeywordKind = (kind: TokenKind): boolean =>
  (kind >= TokenKind.TypeKeyword) && (kind <= TokenKind.CaseKeyword)

/// Returns whether the given token kind corresponds to a statement delimiter.
const isStatementDelimiterKind = (kind: TokenKind): boolean =>
  (kind === TokenKind.Newline) || (kind === TokenKind.Semicolon) || (kind === TokenKind.EOF)

/// Parses the given input to produce a set of top-level declarations.
export const parse = (input: string): AST.TranslationUnitDecl => {

  // Tokenize the input.
  const tokens: Array<Token> = Array.from(tokenize(input))

  /// Stores the parser's current position in the token stream.
  let currentTokenIndex = 0

  /// Returns the value of a token in the parser's input.
  const value = (tk: Token): string =>
    input.substring(tk.range.lowerBound.offset, tk.range.upperBound.offset)

  /// Returns the token at the given offset relative to the parser's current index, without
  /// consuming the token stream.
  const peek = (offset: number = 0): Optional<Token> =>
    (currentTokenIndex + offset) < tokens.length
      ? tokens[currentTokenIndex + offset]
      : null

  /// Consumes a single token from the parser's stream.
  const consume = (): Optional<Token> => {
    // Make sure the stream isn't depleted.
    const tk = peek()
    if (tk === null) {
      return null
    } else {
      currentTokenIndex = currentTokenIndex + 1
      return tk
    }
  }

  /// Consumes a single token of the given kind(s) from the parser's stream.
  const consumeKind = (...kinds: Array<TokenKind>): Optional<Token> => {
    const tk = peek()
    if (tk === null || (kinds.indexOf(tk.kind) == -1)) {
      return null
    } else {
      currentTokenIndex = currentTokenIndex + 1
      return tk
    }
  }

  /// Consumes any number of consecutive newlines.
  const consumeManyNewlines = (): void => {
    let tk = peek()
    while ((tk !== null) && (tk.kind === TokenKind.Newline)) {
      consume()
      tk = peek()
    }
  }

  /// Helper to create invalid expression nodes.
  const invalidExpr = (): AST.Expr => new AST.Expr({
    label: '__error',
    range: peek()?.range,
  })

  /// Helper to create invalid type declaration references.
  const invalidTypeDeclRef = (): AST.TypeDeclRef => new AST.TypeDeclRef({
    name: '__error',
    range: peek()?.range,
  })

  /// Helper that builds diagnostics of the form 'expected <construction>'
  const expectedIssue = (expected: string): AST.Diagnostic => {
    return {
      message: `expected ${expected}`,
      range: peek()?.range,
    }
  }

  /// Helper that builds a diagnostics for ambiguous consecutive statements.
  const ambiguousConsecutiveStatementIssue = (): AST.Diagnostic => {
    return {
      message: 'consecutive statements should be separated by \';\'',
      range: peek()?.range
    }
  }

  // MARK: Top-level declaration parsers.

  /// Parses a single top-level declaration.
  const parseTopLevelDecl = (newDiags: Array<AST.Diagnostic>): Optional<AST.TopLevelDecl> => {
    switch (peek()?.kind) {
    case TokenKind.TypeKeyword:
      return parseTypeDecl(newDiags)

    case TokenKind.InitKeyword:
      return parseInitStateDecl(newDiags)

    case TokenKind.RuleKeyword:
      return parseRuleDecl(newDiags)

    case TokenKind.CaseKeyword:
      return parseRuleCaseDecl(newDiags)

    default:
      newDiags.push(expectedIssue('declaration'))
      return null
    }
  }

  /// Parses a type declaration.
  const parseTypeDecl = (newDiags: Array<AST.Diagnostic>): Optional<AST.TypeDecl> => {
    // Parse the statement keyword `type`.
    const startTk = consumeKind(TokenKind.TypeKeyword)
    if (startTk === null) {
      newDiags.push(expectedIssue('type'))
      return null
    }

    // Parse the name of the declared type.
    const nameTk = consumeKind(TokenKind.Ident)
    if (nameTk === null) {
      newDiags.push(expectedIssue('identifier'))
    }

    // Parse a possibly empty list of type arguments.
    const parameters = parseTypeParamList(newDiags)

    // Parse `::`.
    let savePoint = currentTokenIndex
    consumeManyNewlines()
    if (consumeKind(TokenKind.DoubleColon) === null) {
      currentTokenIndex = savePoint
      newDiags.push(expectedIssue('\'::\''))
    }

    // Parse a list of type constructors separated by "|".
    const cases = parseList(newDiags, TokenKind.Or, parseTypeDeclCase)

    /// Parse a statement delimiter.
    const endTk = consumeKind(TokenKind.Newline, TokenKind.Semicolon, TokenKind.EOF)
    if (endTk === null) {
      newDiags.push(ambiguousConsecutiveStatementIssue())
    }

    return new AST.TypeDecl({
      name: (nameTk !== null) ? value(nameTk) : '__error',
      parameters: parameters,
      cases: cases,
      range: {
        lowerBound: startTk.range.lowerBound,
        upperBound: (endTk !== null)
          ? endTk.range.upperBound
          : peek(-1).range.upperBound,
      },
    })
  }

  /// Parses a possibly empty list of type parameters.
  ///
  /// Although type parameter lists are not supposed to contain anything but type variables, this
  /// parser accepts any type argument and filters out non-variable in a second step, in order to
  /// produce richer error messages.
  const parseTypeParamList = (newDiags: Array<AST.Diagnostic>): Array<AST.TypeVarRef> => {
    const parameters = parseSpaceSeparatedList(newDiags, parseTypeArg)

    // Filter out all non-vaiable type references.
    for (let i = 0; i < parameters.length; ++i) {
      if (!(parameters[i] instanceof AST.TypeVarRef)) {
        newDiags.push(expectedIssue('type variable identifier'))
        parameters.splice(i, 1)
      } else {
        i = i + 1
      }
    }

    return parameters as Array<AST.TypeVarRef>
  }

  /// Parses a type declaration case.
  const parseTypeDeclCase = (newDiags: Array<AST.Diagnostic>): Optional<AST.TypeConsDecl> =>
    parseParenthesized(newDiags, parseTypeConsDecl)

  /// Parses an initial state declaration.
  const parseInitStateDecl = (newDiags: Array<AST.Diagnostic>): Optional<AST.InitStateDecl> => {
    // Parse the statement keyword `init`.
    const startTk = consumeKind(TokenKind.InitKeyword)
    if (startTk === null) {
      newDiags.push(expectedIssue('init'))
      return null
    }

    // Parse an expression.
    const state = parseTerm(newDiags) || invalidExpr()

    /// Parse a statement delimiter.
    const endTk = consumeKind(TokenKind.Newline, TokenKind.Semicolon, TokenKind.EOF)
    if (endTk === null) {
      newDiags.push(ambiguousConsecutiveStatementIssue())
    }

    return new AST.InitStateDecl({
      state: state,
      range: {
        lowerBound: startTk.range.lowerBound,
        upperBound: endTk !== null
          ? endTk.range.upperBound
          : peek(-1).range.upperBound,
      },
    })
  }

  /// Parses a rule declaration.
  const parseRuleDecl = (newDiags: Array<AST.Diagnostic>): Optional<AST.RuleDecl> => {
    // Parse the statement keyword `rule`.
    const startTk = consumeKind(TokenKind.RuleKeyword)
    if (startTk === null) {
      newDiags.push(expectedIssue('rule'))
      return null
    }

    // Parse the name of the declared type.
    const nameTk = consumeKind(TokenKind.Ident)
    if (nameTk === null) {
      newDiags.push(expectedIssue('identifier'))
    }

    // Parse a possibly empty list of type arguments.
    const parameters = parseTypeParamList(newDiags)

    // Parse `::`.
    let savePoint = currentTokenIndex
    consumeManyNewlines()
    if (consumeKind(TokenKind.DoubleColon) === null) {
      currentTokenIndex = savePoint
      newDiags.push(expectedIssue('\'::\''))
    }

    // Parse a type signature.
    savePoint = currentTokenIndex
    consumeManyNewlines()
    let signature = parseTypeSign(newDiags)
    if (signature === null) {
      currentTokenIndex = savePoint
      signature = invalidTypeDeclRef()
    }

    /// Parse a statement delimiter.
    const endTk = consumeKind(TokenKind.Newline, TokenKind.Semicolon, TokenKind.EOF)
    if (endTk === null) {
      newDiags.push(ambiguousConsecutiveStatementIssue())
    }

    return new AST.RuleDecl({
      name: (nameTk !== null) ? value(nameTk) : '__error',
      parameters: parameters,
      signature: signature,
      range: {
        lowerBound: startTk.range.lowerBound,
        upperBound: endTk !== null
          ? endTk.range.upperBound
          : peek(-1).range.upperBound,
      },
    })
  }

  /// Parses a rule case declaration.
  const parseRuleCaseDecl = (newDiags: Array<AST.Diagnostic>): Optional<AST.RuleCaseDecl> => {
    // Parse the statement keyword `case`.
    const startTk = consumeKind(TokenKind.CaseKeyword)
    if (startTk === null) {
      newDiags.push(expectedIssue('case'))
      return null
    }

    // Parse the left term of the case.
    const left = parseTerm(newDiags) || invalidExpr()

    // Parse `=>`.
    let savePoint = currentTokenIndex
    consumeManyNewlines()
    if (consumeKind(TokenKind.ThickArrow) === null) {
      if (consumeKind(TokenKind.Arrow) !== null) {
        // A common mistake is to misuse the regular arrow symbol in case declarations.
        newDiags.push({
          message: 'rewriting rules should be written with \'=>\' rather than \'->\'',
          range: peek(-1).range,
        })
      } else {
        currentTokenIndex = savePoint
        newDiags.push(expectedIssue('\'=>\''))
      }
    }

    // Parse the right term of the case.
    savePoint = currentTokenIndex
    consumeManyNewlines()
    let right = parseTerm(newDiags)
    if (right === null) {
      currentTokenIndex = savePoint
      right = invalidExpr()
    }

    /// Parse a statement delimiter.
    const endTk = consumeKind(TokenKind.Newline, TokenKind.Semicolon, TokenKind.EOF)
    if (endTk === null) {
      newDiags.push(ambiguousConsecutiveStatementIssue())
    }

    return new AST.RuleCaseDecl({
      left: left,
      right: right,
      range: {
        lowerBound: startTk.range.lowerBound,
        upperBound: endTk !== null
          ? endTk.range.upperBound
          : peek(-1).range.upperBound,
      },
    })
  }

  // MARK: Type definition parsers.

  /// Parses a type constructor.
  const parseTypeConsDecl = (newDiags: Array<AST.Diagnostic>): Optional<AST.TypeConsDecl> => {
    // Parse the constructor's label.
    const labelTk = peek()
    if (labelTk?.kind === TokenKind.Ident) {
      // Commit to this parser, since we got the expected leading token.
      consume()
    } else if (labelTk?.kind === TokenKind.VarRef || isKeywordKind(labelTk?.kind)) {
      // If the parsed token is a variable identifier or a keyword, we emit an issue but commit
      // nonetheless.
      consume()
      newDiags.push({
        message: `${value(labelTk)} is not a valid type constructor identifier`,
        range: peek().range,
      })
    } else {
      // Otherwise, we completely give up.
      newDiags.push(expectedIssue('type constructor identifier'))
      return null
    }

    // Parse a possibly empty list of type arguments.
    const typeArgList = parseSpaceSeparatedList(newDiags, parseTypeArg)

    return new AST.TypeConsDecl({
      label: value(labelTk),
      args: typeArgList,
      range: {
        lowerBound: labelTk.range.lowerBound,
        upperBound: (typeArgList.length > 0)
          ? typeArgList[typeArgList.length - 1].range.upperBound
          : labelTk.range.upperBound,
      },
    })
  }

  /// Parses a type argument.
  const parseTypeArg = (newDiags: Array<AST.Diagnostic>): Optional<AST.TypeRef> =>
    parseParenthesized(newDiags, parseTypeRef)

  /// Parses a type reference.
  const parseTypeRef = (newDiags: Array<AST.Diagnostic>): Optional<AST.TypeRef> => {
    return peek()?.kind === TokenKind.VarRef
      ? parseTypeVarRef(newDiags)
      : parseTypeDeclRef(newDiags)
  }

  /// Parses a type declaration reference.
  const parseTypeDeclRef = (newDiags: Array<AST.Diagnostic>): Optional<AST.TypeDeclRef> => {
    // Parse the declaration's name.
    const nameTk = peek()
    if (nameTk?.kind === TokenKind.Ident) {
      // Commit to this parser, since we got the expected leading token.
      consume()
    } else if (isKeywordKind(nameTk?.kind)) {
      // If the parsed token is a keyword, we emit an issue but commit nonetheless.
      consume()
      newDiags.push({
        message: `${value(nameTk)} is not a valid type identifier`,
        range: peek().range,
      })
    } else {
      // Otherwise, we completely give up.
      newDiags.push(expectedIssue('type identifier'))
      return null
    }

    // Parse a possibly empty list of type arguments.
    const typeArgList = parseSpaceSeparatedList(newDiags, parseTypeArg)

    return new AST.TypeDeclRef({
      name: value(nameTk),
      args: typeArgList,
      range: {
        lowerBound: nameTk.range.lowerBound,
        upperBound: (typeArgList.length > 0)
          ? typeArgList[typeArgList.length - 1].range.upperBound
          : nameTk.range.upperBound,
      },
    })
  }

  /// Parses a type variable reference.
  const parseTypeVarRef = (newDiags: Array<AST.Diagnostic>): Optional<AST.TypeVarRef> => {
    const labelTk = consumeKind(TokenKind.VarRef)
    if (labelTk === null) {
      newDiags.push(expectedIssue('type variable'))
      return null
    }

    return new AST.TypeVarRef({
      label: value(labelTk).substring(1),
      range: labelTk.range,
    })
  }

  /// Parse a type signature.
  const parseTypeSign = (newDiags: Array<AST.Diagnostic>): Optional<AST.TypeSign> => {
    // Parse a type reference first.
    const left = parseTypeRef(newDiags)
    if (left === null) {
      return null
    }

    // If the parsed reference is not followed by an arrow, then return the it as the signature.
    const savePoint = currentTokenIndex
    consumeManyNewlines()
    if (consumeKind(TokenKind.Arrow) === null) {
      if (consumeKind(TokenKind.ThickArrow) !== null) {
        // A common mistake is to misuse the think arrow symbol in type signatures.
        newDiags.push({
          message: 'arrow types should be written with \'->\' rather than \'=>\'',
          range: peek(-1).range,
        })
      } else {
        currentTokenIndex = savePoint
        return left
      }
    }

    // If the parsed reference is followed by an arrow, parse any type signature as the right part
    // of an arrow type.
    consumeManyNewlines()
    const right = parseTypeSign(newDiags) || invalidTypeDeclRef()

    return new AST.ArrowTypeSign({
      left: left,
      right: right,
      range: {
        lowerBound: left.range.lowerBound,
        upperBound: right.range.upperBound,
      }
    })
  }

  // MARK: Term parsers.

  /// Parses a term.
  const parseTerm = (newDiags: Array<AST.Diagnostic>): Optional<AST.Term> => {
    return peek()?.kind === TokenKind.VarRef
      ? parseVarRef(newDiags)
      : parseExpr(newDiags)
  }

  /// Parses an expression.
  const parseExpr = (newDiags: Array<AST.Diagnostic>): Optional<AST.Expr> => {
    // Parse the expression's label.
    const labelTk = peek()
    if (labelTk?.kind === TokenKind.Ident) {
      // Commit to this parser, since we got the expected leading token.
      consume()
    } else if (isKeywordKind(labelTk?.kind)) {
      // If the parsed token is a keyword, we emit an issue but commit nonetheless.
      consume()
      newDiags.push({
        message: `${value(labelTk)} is not a valid type constructor identifier`,
        range: peek().range,
      })
    } else {
      // Otherwise, we completely give up.
      newDiags.push(expectedIssue('type constructor identifier'))
      return null
    }

    // Parse an optional list of subterms. Note that we require the list to start on the same line.
    let subterms: Array<AST.Term> = []
    if (consumeKind(TokenKind.LeftParen) !== null) {
      subterms = parseList(newDiags, TokenKind.Comma, parseTerm)

      // Parse the right parenthesis.
      const savePoint = currentTokenIndex
      consumeManyNewlines()
      if (consumeKind(TokenKind.RightParen) === null) {
        currentTokenIndex = savePoint
        newDiags.push(expectedIssue('closing parenthesis \')\''))
      }
    }

    return new AST.Expr({
      label: value(labelTk),
      subterms: subterms,
      range: {
        lowerBound: labelTk.range.lowerBound,
        upperBound: (subterms.length > 0)
          ? subterms[subterms.length - 1].range.upperBound
          : labelTk.range.upperBound,
      },
    })
  }

  /// Parses a variable reference.
  const parseVarRef = (newDiags: Array<AST.Diagnostic>): Optional<AST.VarRef> => {
    const labelTk = consumeKind(TokenKind.VarRef)
    if (labelTk === null) {
      newDiags.push(expectedIssue('variable'))
      return null
    }

    return new AST.VarRef({
      label: value(labelTk).substring(1),
      range: labelTk.range,
    })
  }

  // MARK: Generic parsers.

  /// Parses a list of elements separated by spaces, excluding newlines.
  ///
  /// This parser uses the return value of its sub-parser (i.e. the `parseElement` parameter) to
  /// determine the end of the list. If the sub-parser fails without committing, then this parser
  /// considers that the remainder of the stream is not part of the list and it returns the list of
  /// the elements it could parse so far.
  const parseSpaceSeparatedList = <Element extends {}>(
    newDiags: Array<AST.Diagnostic>,
    parseElement: ((newDiags: Array<AST.Diagnostic>) => Optional<Element>)
  ): Array<Element> => {
    const elements: Array<Element> = []

    // Parse as many elements as possible.
    while (true) {
      // Attempt to parse a new element.
      const elementDiags: Array<AST.Diagnostic> = []
      const element = parseElement(elementDiags)
      if (element !== null) {
        // If we could parse an element (i.e. if the sub-parser committed), then keep it together
        // with the diagnostics we might have encountered.
        newDiags.push(...elementDiags)
        elements.push(element)
      } else {
        // If we couldn't parse an element at all (i.e. if the sub-parser didn't commit), then
        // discard all diagnostics and exit.
        break
      }
    }

    return elements
  }

  /// Parses a list of elements separated by tokens of the given kind.
  ///
  /// Unlike `parseSpaceSeparatedList`, this parse can skip newlines between elements, as it uses
  /// (the absence of) `delimiter` to determine the end of the list. If the sub-parser (i.e. the
  /// `parseElement` parameter) fails without committing, then this parser attempts to recover at
  /// the next list delimiter, unless none occurs before a statement delimiter.
  const parseList = <Element extends {}>(
    newDiags: Array<AST.Diagnostic>,
    delimiter: TokenKind,
    parseElement: ((newDiags: Array<AST.Diagnostic>) => Optional<Element>)
  ): Array<Element> => {
    const elements: Array<Element> = []

    // Parse as many elements as possible.
    while (true) {
      // Skip leading new lines.
      let savePoint = currentTokenIndex
      consumeManyNewlines()

      // Attempt to parse a new element.
      const elementDiags: Array<AST.Diagnostic> = []
      const element = parseElement(elementDiags)
      if (element !== null) {
        // If we could parse an element (i.e. if the sub-parser committed), then keep it together
        // with the diagnostics we might have encountered.
        newDiags.push(...elementDiags)
        elements.push(element)
      } else {
        // If we couldn't parse an element at all (i.e. if the sub-parser didn't commit), then skip
        // all tokens until the next list or statement delimiter.
        while (peek().kind !== delimiter && !isStatementDelimiterKind(peek().kind)) {
          consume()
        }

        // If the current token is a list delimiter, then assume we're still parsing the list and
        // simply recover from that point. Otherwise, backtrack and exit.
        if (peek().kind === delimiter) {
          newDiags.push(...elementDiags)
        } else {
          currentTokenIndex = savePoint
          break
        }
      }

      // Continue if we can parse a list delimiter, or exit Otherwise.
      savePoint = currentTokenIndex
      consumeManyNewlines()
      if (peek().kind === delimiter) {
        consume()
      } else {
        currentTokenIndex = savePoint
        break
      }
    }

    return elements
  }

  /// Parses a parenthesized element.
  const parseParenthesized = <Element extends {}>(
    newDiags: Array<AST.Diagnostic>,
    parseElement: ((newDiags: Array<AST.Diagnostic>) => Optional<Element>)
  ): Optional<Element> => {
    if (peek()?.kind === TokenKind.LeftParen) {
      // If the current token is a left parenthesis, then we commit and parse an element enclosed
      // in parenthesis. The recursion ensures that we can parse any number of nested parenthesis.
      consume()
      consumeManyNewlines()
      const element = parseParenthesized(newDiags, parseElement)

      // Parse the right parenthesis.
      const savePoint = currentTokenIndex
      consumeManyNewlines()
      if (consumeKind(TokenKind.RightParen) === null) {
        currentTokenIndex = savePoint
        newDiags.push(expectedIssue('closing parenthesis \')\''))
      }

      return element
    } else {
      return parseElement(newDiags)
    }
  }

  // MARK: Program parsing.

  const diags: Array<AST.Diagnostic> = []
  const decls: Array<AST.TopLevelDecl> = []

  while((peek() !== null) && (peek().kind !== TokenKind.EOF)) {
    consumeManyNewlines()
    const decl = parseTopLevelDecl(diags)
    if (decl !== null) {
      decls.push(decl)
    } else {
      while (!isStatementDelimiterKind(peek()?.kind)) {
        consume()
      }
    }
  }

  return {
    diagnostics: diags,
    decls: decls,
    range: {
      lowerBound: tokens[0].range.lowerBound,
      upperBound: tokens[input.length - 1].range.upperBound,
    },
  }

}
