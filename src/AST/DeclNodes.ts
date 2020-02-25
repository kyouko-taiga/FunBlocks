import { SourceRange } from './SourceRange'
import { TypeRef, TypeSign, TypeVarRef } from './TypeNodes'

export type TopDecl = TypeDecl | InitStateDecl | RuleDecl | RuleCaseDecl

/// A type declaration.
export class TypeDecl {

  public readonly name: string
  public readonly parameters: Array<TypeVarRef>
  public readonly cases: Array<TypeCons>
  public readonly range: Optional<SourceRange>

  public constructor(args: {
    name: string,
    parameters?: Array<TypeVarRef>,
    cases: Array<TypeCons>,
    range?: SourceRange,
  }) {
    this.name = args.name
    this.parameters = args.parameters || []
    this.cases = args.cases
    this.range = args.range || null
  }

}

/// A type constructor.
export class TypeCons {

  public readonly label: String
  public readonly arguments: Array<TypeRef>
  public readonly range: Optional<SourceRange>

  public constructor(args: { label : String, arguments : Array<TypeRef>, range?: SourceRange }) {
    this.label = args.label
    this.arguments = args.arguments
    this.range = args.range || null
  }

}

/// The declaration of the program's initial state.
export class InitStateDecl {

  public readonly state: Term
  public readonly range: Optional<SourceRange>

  public constructor(args: { state: Term, range?: SourceRange }) {
    this.state = args.state
    this.range = args.range || null
  }

}

/// A rule declaration (i.e. the declaration of its signature).
export class RuleDecl {

  public readonly name: String
  public readonly parameters: Array<TypeRef>
  public readonly typeSign: TypeSign
  public readonly range: Optional<SourceRange>

  public constructor(args: {
    name: String,
    parameters: Array<TypeRef>,
    typeSign: TypeSign,
    range?: SourceRange,
  }) {
    this.name = args.name
    this.parameters = args.parameters
    this.typeSign = args.typeSign
    this.range = args.range || null
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

  public readonly range: Optional<SourceRange>

  public constructor(args: { id?: string, left: Term, right: Term, range?: SourceRange }) {
    this.id = args.id || `rule/${Math.random().toString(36).substr(2, 9)}`
    this.left = args.left
    this.right = args.right
    this.range = args.range || null
  }

}
