import { TypeRef, TypeSign, TypeVarRef } from './TypeNodes'

/// A type declaration.
export class TypeDecl {

  public readonly name: string
  public readonly parameters: Array<TypeVarRef>
  public readonly cases: Array<TypeConsDecl>

  public constructor(args: {
    name: string,
    parameters?: Array<TypeVarRef>,
    cases: Array<TypeConsDecl>,
  }) {
    this.name = args.name
    this.parameters = args.parameters || []
    this.cases = args.cases
  }

}

/// A type constructor declaration.
export class TypeConsDecl {

  public readonly label: String
  public readonly arguments: Array<TypeRef>

  public constructor(args: { label : String, arguments : Array<TypeRef> }) {
    this.label = args.label
    this.arguments = args.arguments
  }

}

/// The declaration of the program's initial state.
export class InitStateDecl {

  public readonly state: Term

  public constructor(args: { state: Term }) {
    this.state = args.state
  }

}

/// A rule declaration (i.e. the declaration of its signature).
export class RuleDecl {

  public readonly name: String
  public readonly arguments: Array<TypeRef>
  public readonly left: TypeSign
  public readonly right: TypeSign

  public constructor(args: {
    name: String,
    arguments: Array<TypeRef>,
    left: TypeSign,
    right: TypeSign,
  }) {
    this.name = args.name
    this.arguments = args.arguments
    this.left = args.left
    this.right = args.right
  }

}

/// A rule case declaration.
export class RuleCaseDecl {

  /// A unique identifier for this rule case.
  public readonly id: string

  /// The left part of this rule case (i.e. the term that should be matched).
  public readonly left: Term

  /// The right part of this rule case (i.e. the term that is rewritten).
  public readonly right: Term

  public constructor(args: { id?: string, left: Term, right: Term }) {
    this.id = args.id || `rule/${Math.random().toString(36).substr(2, 9)}`
    this.left = args.left
    this.right = args.right
  }

}
