import Diesel

enum FunBlockParser {

  static func initialize() {
    defineArrowTypeSign()
    defineTypeDeclRef()
    defineExpr()
  }

  static func parse<TokenCollection>(_ input: TokenCollection) -> [AST]
    where TokenCollection: Collection, TokenCollection.Element == Token
  {
    let result = program.parse(ArraySlice(tokens))
    switch result {
    case .success(let statements, let remainder):
      if let token = remainder.first {
        print("unexpected token \(token)")
      }
      return statements

    case .failure(let error):
      print(error)
      return []
    }
  }

  static let program = newline.many
    .then(topLevelStmt, combine: { _, b in b }).many

  // MARK: Top-level statements

  /// Parses a top-level statement.
  static let topLevelStmt = typeDecl.map({ $0 as AST })
    .else(initStateDecl.map({ $0 as AST }))
    .else(ruleDecl.map({ $0 as AST }))
    .else(ruleCase.map({ $0 as AST }))

  /// Parses a type declaration.
  static let typeDecl = token(.type)
    .then(newline.many)
    .then(token(.identifier), combine: { _, b in b })
    .then(newline.many, combine: { a, _ in a })
    .then(typeParamList.optional)
    .then(token(.doubleColon).surrounded(by: newline.many), combine: { a, _ in a })
    .then(newline.many, combine: { a, _ in a })
    .then(enumTypeBody)
    .then(terminator, combine: { a, _ in a })
    .map({ (args) -> TypeDecl in
      TypeDecl(
        name: String(args.0.0.value),
        parameters: args.0.1 ?? [],
        cases: args.1)
    })

  /// Parses an initial state declaration.
  static let initStateDecl = token(.init_)
    .then(newline.many)
    .then(expr, combine: { _, b in b })
    .then(terminator, combine: { a, _ in a })
    .map({ state in InitStateDecl(state: state) })

  /// Parses a rule declaration.
  static let ruleDecl = token(.rule)
    .then(newline.many)
    .then(token(.identifier), combine: { _, b in b })
    .then(newline.many, combine: { a, _ in a })
    .then(typeParamList.optional)
    .then(token(.doubleColon).surrounded(by: newline.many), combine: { a, _ in a })
    .then(typeSign.else(parenthesized(typeSign)))
    .then(token(.thickArrow).surrounded(by: newline.many), combine: { a, _ in a })
    .then(typeSign.else(parenthesized(typeSign)))
    .then(terminator, combine: { a, _ in a })
    .map({ args -> RuleDecl in
      RuleDecl(
        name: String(args.0.0.0.value),
        arguments: args.0.0.1 ?? [],
        left: args.0.1,
        right: args.1)
    })

  /// Parses a rule case declaration.
  static let ruleCase = token(.case_)
    .then(newline.many)
    .then(expr.else(parenthesized(expr)), combine: { _, b in b })
    .then(token(.thickArrow).surrounded(by: newline.many), combine: { a, _ in a })
    .then(term.else(parenthesized(term)))
    .then(terminator, combine: { a, _ in a })
    .map({ left, right in RuleDef(left: left, right: right) })

  // MARK: Types

  /// Parses a type signature.
  static let typeSign = arrowTypeSign.map({ $0 as TypeSign })
    .else(typeRef.map({ $0 as TypeSign }))

  /// Parses an arrow type signature.
  private(set) static var arrowTypeSign = ForwardParser<ArrowTypeSign, ArraySlice<Token>>()

  static func defineArrowTypeSign() {
    // Notice that the non-parenthesized alternative is not a type signature, so as to avoid the
    // infinite recursion that would otherwise occur on the arrow type signature parser.
    let left = parenthesized(typeSign).else(typeRef.map({ $0 as TypeSign }))
    let right = typeSign.else(parenthesized(typeSign))

    arrowTypeSign.define(left
      .then(token(.arrow).surrounded(by: newline.many), combine: { a, _ in a })
      .then(right)
      .map({ left, right in ArrowTypeSign(left: left, right: right) }))
  }

  /// Parses an enum type declaration body.
  static let enumTypeBody = typeCons
    .then(token(.pipe).surrounded(by: newline.many).then(typeCons, combine: { _, b in b }).many)
    .map({ head, tail in [head] + tail })

  /// Parses a type constructor.
  static let typeCons = token(.identifier)
    .then(newline.many.then(typeArgList, combine: { _, b in b }).optional)
    .map({ token, args in
      TypeCons(label: String(token.value), arguments: args ?? [])
    })

  /// Parses a type parameter list.
  static let typeParamList = typeVarRef
     .then(newline.many.then(typeVarRef, combine: { _, b in b }).many)
     .map({ head, tail in [head] + tail })

  /// Parses a type reference.
  static let typeRef = typeDeclRef.map({ $0 as TypeRef })
    .else(typeVarRef.map({ $0 as TypeRef }))

  /// Parses a type declaration reference.
  private(set) static var typeDeclRef = ForwardParser<TypeDeclRef, ArraySlice<Token>>()

  static func defineTypeDeclRef() {
    typeDeclRef.define(token(.identifier)
      .then(newline.many.then(typeArgList, combine: { _, b in b }).optional)
      .map({ token, args in
        TypeDeclRef(name: String(token.value), arguments: args ?? [])
      }))
  }

  /// Parses a type variable reference.
  static let typeVarRef = token(.variableIdentifier)
    .map({ token in TypeVarRef(name: String(token.value.dropFirst())) })

  /// Parses a type argument list.
  static let typeArgList = typeArg
    .then(newline.many.then(typeArg, combine: { _, b in b }).many)
    .map({ head, tail in [head] + tail })

  /// Parses a type argument.
  static let typeArg = typeRef.else(parenthesized(typeRef))

  // MARK: Terms

  /// Parses a term.
  static let term = expr.map({ $0 as Term })
    .else(varRef.map({ $0 as VarRef }))

  /// Parses a term comma-separated list.
  static let termList = term
    .then(token(.comma).surrounded(by: newline.many).then(term, combine: { _, b in b }).many)
    .map({ head, tail in [head] + tail })

  /// Parses an expression.
  private(set) static var expr = ForwardParser<Expr, ArraySlice<Token>>()

  static func defineExpr() {
    expr.define(token(.identifier)
      .then(parenthesized(termList).optional)
      .map({ token, subterms in
        return Expr(label: String(token.value), subterms: subterms ?? [])
      }))
  }

  /// Parses a variable reference.
  static let varRef = token(.variableIdentifier)
    .map({ token in VarRef(name: String(token.value.dropFirst())) })

  static let newline = token(.newline)

  static let terminator = newline.else(token(.semicolon)).else(token(.eof))

}

private func parenthesized<P>(_ parser: P) -> AnyParser<P.Element, ArraySlice<Token>>
  where P: Parser, P.Stream == ArraySlice<Token>
{
  AnyParser(token(.leftParen)
    .then(parser.surrounded(by: token(.newline).many), combine: { _, b in b })
    .then(token(.rightParen), combine: { a, _ in a }))
}

private func token(_ kind: Token.Kind) -> ElementParser<ArraySlice<Token>> {
  return element { $0.kind == kind }
}
