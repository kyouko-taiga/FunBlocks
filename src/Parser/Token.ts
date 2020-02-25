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
  /// "type"
  TypeKeyword,
  /// "init"
  InitKeyword,
  /// "rule"
  RuleKeyword,
  /// "case"
  CaseKeyword,
  /// "$" <ident-char> { <ident-char> }
  VarRef,
  /// <ident-char> { <ident-char> }
  Ident,
  /// "|"
  Or,
  /// "->"
  Arrow,
  /// "=>"
  ThickArrow,
  /// "::"
  DoubleColon,
  /// ","
  Comma,
  /// ";"
  Semicolon,
  /// "("
  LeftParen,
  /// ")"
  RightParen,
  /// "\n"
  Newline,
  /// <eof>
  EOF,
  /// Any unrecognized token.
  Unrecognized,
}
