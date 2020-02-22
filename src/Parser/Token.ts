import { SourceRange } from 'FunBlocks/AST/SourceRange'

/// A lexical token of FunBlocks' textual language.
///
/// A lexical token is a chunk of the text input to which a syntactic meaning is assigned.
export interface Token {

  /// The token's kind.
  readonly kind: TokenKind

  /// The source range that consitutes this token.
  readonly range: SourceRange

}

/// A category of lexical token.
export enum TokenKind {

  TypeKeyword,
  InitKeyword,
  DeclKeyword,
  CaseKeyword,
  VarRef,
  Ident,

  Or,
  Arrow,
  ThickArrow,
  DoubleColon,
  Comma,
  Semicolon,
  Newline,
  EOF,

  Unrecognized,

}
