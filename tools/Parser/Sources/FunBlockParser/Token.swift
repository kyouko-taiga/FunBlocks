public struct Token {

  public enum Kind {
    case newline
    case comma
    case semicolon
    case leftParen
    case rightParen
    case equal
    case pipe
    case colon
    case doubleColon
    case thickArrow
    case arrow
    case identifier
    case variableIdentifier
    case type
    case _init
    case decl
    case rule
    case eof
    case error
  }

  public let kind: Kind
  public let value: Substring

}
