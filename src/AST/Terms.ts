import { Type } from './Types'

/// A term.
export interface Term {

  /// This term's ID.
  readonly id: string

  /// This term's label.
  readonly label: string

  /// This term's type, if defined.
  readonly type?: Type

  /// This term's parent, if any.
  parent: Expression

}

/// An expression.
export class Expression implements Term {

  /// A unique identifier for this expression.
  public readonly id: string

  /// The label of this expression.
  public readonly label: string

  /// The type of this expression, if defined.
  public readonly type: Type

  /// The subterms of this expression.
  public readonly subterms: Array<Term>

  /// The parent term of this expression.
  public parent: Expression

  public constructor(args: { label: string, type?: Type, subterms?: Term[] }) {
    this.id = `expr/${Math.random().toString(36).substr(2, 9)}-${args.label}`
    this.label = args.label
    this.subterms = args.subterms || []
    this.type = args.type || null
    this.parent = null

    for (const subterm of this.subterms) {
      subterm.parent = this
    }
  }

}

/// A variable.
export class Variable implements Term {

  /// A unique identifier for this expression.
  public readonly id: string

  /// The label of this variable.
  public readonly label: string

  /// The type of this variable, if defined.
  public readonly type: Type

  /// The parent term of this expression.
  public parent: Expression

  public constructor(args: { label: string, type?: Type }) {
    this.id = `var/${Math.random().toString(36).substr(2, 9)}-${args.label}`
    this.label = args.label
    this.type = args.type || null
    this.parent = null
  }

}

/// A rule.
export class Rule {

  /// A unique identifier for this rule.
  public readonly id: string

  /// The left part of this rule (i.e. the expression that should be matched).
  public readonly left: Term

  /// The right part of this rule (i.e. the expression that is rewritten).
  public readonly right: Term

  constructor(args: { left: Term, right: Term }) {
    this.id = `rule/${Math.random().toString(36).substr(2, 9)}`
    this.left = args.left
    this.right = args.right
  }

}
