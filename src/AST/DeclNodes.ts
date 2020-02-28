import { Diagnostic } from './Diagnostic'
import { Node, ObservableNode } from './Node'
import { SourceRange } from './SourceRange'
import { Term } from './TermNodes'
import { TypeRef, TypeSign, TypeVarRef } from './TypeNodes'

/// A translation unit declaration.
export class TranslationUnitDecl extends ObservableNode {

  /// The top-level declarations of this translation unit.
  public get decls(): Array<TopLevelDecl> {
    const decls = [ ...this._decls ]
    Object.freeze(decls)
    return decls
  }

  /// Sets the top-level declarations of this translation unit and notifies all observers.
  public set decls(newValue: Array<TopLevelDecl>) {
    this._decls = newValue
    this.notify()
  }

  private _decls: Array<TopLevelDecl>

  /// The diagnostics of this translation unit.
  public get diagnostics(): Array<Diagnostic> {
    const diagnostics = [ ...this._diagnostics ]
    Object.freeze(diagnostics)
    return diagnostics
  }

  /// Sets the diagnostics of this translation unit and notifies all observers.
  public set diagnostics(newValue: Array<Diagnostic>) {
    this._diagnostics = newValue
    this.notify()
  }

  private _diagnostics: Array<Diagnostic>

  constructor({ range, decls, diagnostics }: {
    range?: SourceRange,
    decls?: Array<TopLevelDecl>,
    diagnostics?: Array<Diagnostic>,
  }) {
    super(range)
    this._decls = decls || []
    this._diagnostics = diagnostics || []
  }

  /// Inserts a top-level declaration in this translation unit.
  insertDecl(decl: TopLevelDecl) {
    // Make sure that the declaration does not already belong to this translation unit.
    if (this._decls.indexOf(decl) == -1) {
      this._decls.push(decl)
      this.notify()
    }
  }

}

/// A top-level declaration.
export type TopLevelDecl = TypeDecl | InitStateDecl | RuleDecl | RuleCaseDecl

/// A type declaration.
///
/// A type is defined by a set of type constructors which describe the profile of the expressions
/// that constitute its domain. For instance, the type of a list of integer values can be defined
/// as follows:
///
///     type IntList :: empty | cons Int (IntList)
///
/// In this example, the type `IntList` is defined by a set of two type constructors, `empty` and
/// `cons`, that describe the profile of the terms that are of type `IntList`. The former does not
/// have any parameter and describes an expression labeled by `empty` without any subterms. The
/// latter has a two parameters referring to the types `Int` and `IntList` and describes an
/// expression labeled `cons` with two subterms, one of type `Int` and the other of type `IntList`.
///
/// Types themselves may also have parameters, in which case they are said *generic*. A type
/// parameter is merely a placeholder for another type. For instance, a generic list type can be
/// defined as follows:
///
///     type List $T :: empty | cons $T (List $T)
///
/// Here, the type `List` is generic and accepts a single type argument `$T`. It can now be
/// *instanciated* with any type `$T` to produce the type for a list of values of type `$T`. For
/// instance, we could declare the following rule:
///
///     rule max :: List Int -> Int
///
/// In this example, the type `List` is instanciated with the type `Int` to produce a the type of a
/// list of integer values, semantically equivalent to the `IntList` type we declared earlier.
export class TypeDecl extends Node {

  /// The name of the declared type.
  readonly name: string

  /// The parameters of the declared type if it is generic.
  readonly parameters: Array<TypeVarRef>

  /// The constructors of the declared type.
  readonly cases: Array<TypeConsDecl>

  constructor({ range, name, parameters, cases }: {
    range?: SourceRange,
    name: string,
    parameters?: Array<TypeVarRef>,
    cases?: Array<TypeConsDecl>,
  }) {
    super(range)
    this.name = name
    this.parameters = parameters || []
    this.cases = cases || []
  }

}

/// A type constructor declaration.
export class TypeConsDecl extends Node {

  /// The label of the constructor.
  readonly label: String

  /// The type arguments of the constructor.
  readonly args: Array<TypeRef>

  constructor({ range, label, args }: {
    range?: SourceRange,
    label: string,
    args?: Array<TypeRef>,
  }) {
    super(range)
    this.label = label
    this.args = args || []
  }

}

/// The declaration of the program's initial state.
export class InitStateDecl extends Node {

  /// The declared state.
  readonly state: Optional<Term>

  constructor({ range, state }: {
    range?: SourceRange,
    state?: Term,
  }) {
    super(range)
    this.state = state || null
  }

}

/// A rule declaration (i.e. the declaration of its signature).
export class RuleDecl extends Node {

  /// The name of the declared rule.
  readonly name: String

  /// The type parameters of the declared rule, if it is generic.
  readonly parameters: Array<TypeRef>

  /// The type signature of the declared rule.
  readonly signature: TypeSign

  constructor({ range, name, parameters, signature }: {
    range?: SourceRange,
    name: string,
    parameters?: Array<TypeRef>,
    signature: TypeSign,
  }) {
    super(range)
    this.name = name
    this.parameters = parameters || []
    this.signature = signature
  }

}

/// A rule case declaration.
export class RuleCaseDecl extends Node {

  /// The unique identifier of this rule case declaration instance.
  readonly id: string

  /// The left part of this rule case (i.e. the term that should be matched).
  readonly left: Optional<Term>

  /// The right part of this rule case (i.e. the term that is rewritten).
  readonly right: Optional<Term>

  constructor({ range, left, right }: {
    range?: SourceRange,
    left?: Term,
    right?: Term,
  }) {
    super(range)
    this.id = `RuleCaseDecl/${Math.random().toString(36).substr(2, 9)}`
    this.left = left || null
    this.right = right || null
  }

}
