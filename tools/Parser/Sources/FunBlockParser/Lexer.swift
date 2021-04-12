func tokenize(_ stream: String) throws -> [Token] {
  var tokens: [Token] = []
  var currentIndex = stream.startIndex

  while currentIndex != stream.endIndex {
    // Process new lines as a special case to merge repeated new lines.
    if stream[currentIndex].isNewline {
      tokens.append(Token(kind: .newline, value: stream[currentIndex ... currentIndex]))
      let skipCount = stream
        .suffix(from: currentIndex)
        .prefix(while: { $0.isNewline })
        .count

      currentIndex = stream.index(currentIndex, offsetBy: skipCount)
      continue
    }

    // Skip other whitespace characters.
    if stream[currentIndex].isWhitespace {
      currentIndex = stream.index(after: currentIndex)
      continue
    }

    // Skip comments.
    if stream.suffix(from: currentIndex).starts(with: "//") {
      let skipCount = stream
        .suffix(from: currentIndex)
        .prefix(while: { !$0.isNewline })
        .count

      currentIndex = stream.index(currentIndex, offsetBy: skipCount)
      continue
    }

    // Process keywords and identifiers.
    if stream[currentIndex].isIdentifier {
      let substring = stream
        .suffix(from: currentIndex)
        .prefix(while: { $0.isIdentifier })

      let token: Token
      switch substring {
      case "type": token = Token(kind: .type, value: substring)
      case "init": token = Token(kind: .init_, value: substring)
      case "case": token = Token(kind: .case_, value: substring)
      case "rule": token = Token(kind: .rule, value: substring)
      default    : token = Token(kind: .identifier, value: substring)
      }

      tokens.append(token)
      currentIndex = stream.index(currentIndex, offsetBy: substring.count)
      continue
    }

    // Process variable identifiers.
    if stream[currentIndex] == "$" {
      let tokenCharacterCount = 1 + stream
        .suffix(from: stream.index(after: currentIndex))
        .prefix(while: { $0.isIdentifier })
        .count

      let nextIndex = stream.index(currentIndex, offsetBy: tokenCharacterCount)
      tokens.append(Token(kind: .variableIdentifier, value: stream[currentIndex ..< nextIndex]))
      currentIndex = nextIndex
      continue
    }

    // Process 2-characters tokens.
    if stream.distance(from: currentIndex, to: stream.endIndex) >= 2 {
      let substring = stream[currentIndex ..< stream.index(currentIndex, offsetBy: 2)]

      var token: Token? = nil
      switch substring {
      case "=>": token = Token(kind: .thickArrow, value: substring)
      case "->": token = Token(kind: .arrow, value: substring)
      case "::": token = Token(kind: .doubleColon, value: substring)
      default  : break
      }

      if token != nil {
        tokens.append(token!)
        currentIndex = stream.index(currentIndex, offsetBy: 2)
        continue
      }
    }

    // Process 1-character tokens.
    let substring = stream[currentIndex ... currentIndex]

    let token: Token
    switch stream[currentIndex] {
    case ",": token = Token(kind: .comma, value: substring)
    case ";": token = Token(kind: .semicolon, value: substring)
    case "(": token = Token(kind: .leftParen, value: substring)
    case ")": token = Token(kind: .rightParen, value: substring)
    case "=": token = Token(kind: .equal, value: substring)
    case "|": token = Token(kind: .pipe, value: substring)
    case ":": token = Token(kind: .colon, value: substring)
    default : token = Token(kind: .error, value: substring)
    }

    tokens.append(token)
    currentIndex = stream.index(after: currentIndex)
  }

  return tokens + [Token(kind: .eof, value: stream[stream.endIndex ..< stream.endIndex])]
}

extension Character {

  var isIdentifier: Bool { self == "_" || self.isLetter || self.isNumber }

}
