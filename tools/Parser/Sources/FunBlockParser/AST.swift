public protocol AST {}

public struct TypeDecl: AST, CustomStringConvertible {

  public let name: String

  public let parameters: [TypeVarRef]

  public let cases: [TypeCons]

  public var description: String {
    var result = "type \(name)"
    if !parameters.isEmpty {
      result += " " + parameters.map(String.init(describing:)).joined(separator: " ")
    }
    result += " :: " + cases.map(String.init(describing:)).joined(separator: " | ")
    return result
  }

}

public struct InitStateDecl: AST, CustomStringConvertible {

  public let state: Expr

  public var description: String {
    "init \(state)"
  }

}

public struct RuleDecl: AST, CustomStringConvertible {

  public let name: String

  public let arguments: [TypeRef]

  public let left: TypeSign

  public let right: TypeSign

  public var description: String {
    let tail = " :: \(left) => \(right)"
    return arguments.isEmpty
      ? "decl \(name)" + tail
      : "decl \(name) " + arguments.map({ "(\($0))" }).joined(separator: " ") + tail
  }

}

public struct RuleDef: AST, CustomStringConvertible {

  public let left: Expr

  public let right: Term

  public var description: String {
    "rule \(left) => \(right)"
  }

}

public struct TypeCons: AST, CustomStringConvertible {

  public let label: String

  public let arguments: [TypeRef]

  public var description: String {
    arguments.isEmpty
      ? label
      : label + " " + arguments.map({ "(\($0))" }).joined(separator: " ")
  }

}

public protocol TypeSign: AST {}

public struct ArrowTypeSign: TypeSign, CustomStringConvertible {

  let left: TypeSign

  let right: TypeSign

  public var description: String {
    "(\(left)) -> (\(right))"
  }

}

public protocol TypeRef: TypeSign {}

public struct TypeDeclRef: TypeRef, CustomStringConvertible {

  public let name: String

  public let arguments: [TypeRef]

  public var description: String {
    arguments.isEmpty
      ? name
      : name + " " + arguments.map({ "(\($0))" }).joined(separator: " ")
  }

}

public struct TypeVarRef: TypeRef, CustomStringConvertible {

  public let name: String

  public var description: String {
    "$" + name
  }

}

public protocol Term: AST {}

public struct Expr: Term, CustomStringConvertible {

  public let label: String

  public let subterms: [Term]

  public var description: String {
    subterms.isEmpty
      ? label
      : label + "(" + subterms.map(String.init(describing:)).joined(separator: ", ") + ")"
  }

}

public struct VarRef: Term, CustomStringConvertible {

  public let name: String

  public var description: String {
    "$" + name
  }

}
