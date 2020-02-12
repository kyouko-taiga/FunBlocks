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
  parent: Term

  /// This term's root.
  root: Term

  /// Returns a new term in which occurrences of variables bound in the given mapping are
  /// substituted by their corresponding term.
  reifying(mapping: { [key: string]: Term }): Term

  /// Returns a new term in which occurrences of subterms with the given ID are replaced by the
  /// given term.
  substituting(subtermID: string, newTerm: Term): Term

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
  public parent: Term

  /// The root term of this expression.
  public get root(): Term {
    return this.parent !== null
      ? this.parent.root
      : this
  }

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

  /// Computes a binding mapping variables to terms for which this term matches the given pattern.
  public match(pattern: Term, context: { [key: string]: Term } = {}): { [key: string]: Term } {
    // Check for trivial cases.
    if (this === pattern) {
      return {}
    }

    // The pattern's type has to match that of this term.
    if (this.type !== null && pattern.type !== null && this.type !== pattern.type) {
      return null
    }

    if (pattern instanceof Variable) {
      // Recall that patterns do not need to be linear. Hence if the pattern is a variable, we've
      // to check if it's already bound in the current context.
      if (pattern.label in context) {
        // Check whether the value bound to the variable matches this term.
        return this.match(context[pattern.label], context)
      } else {
        // Free variables always match.
        return { ...context, [pattern.label]: this }
      }
    }

    // Expressions match if their labels are the same, if they have the same arity and if there
    // exists a binding for which their subterms match.
    if (pattern instanceof Expression) {
      if (this.label != pattern.label || this.subterms.length != pattern.subterms.length) {
        return null
      }

      let mapping = context
      for (let i = 0; i < this.subterms.length; ++i) {
        // The receiver of `match()` is supposed to be a state and therefore it should not contain
        // any variable in its subterms.
        console.assert(this.subterms[i] instanceof Expression)

        // Check if the subterms match, given the current context.
        mapping = (this.subterms[i] as Expression).match(pattern.subterms[i], mapping)
        if (mapping === null) {
          return null
        }
      }
      return mapping
    }

    // This term does not match the pattern.
    return null
  }

  public reifying(mapping: { [key: string]: Term }): Term {
    return new Expression({
      label: this.label,
      type: this.type,
      subterms: this.subterms.map((subterm) => subterm.reifying(mapping)),
    })
  }

  public substituting(subtermID: string, newTerm: Term): Term {
    if (this.id === subtermID) {
      return newTerm
    } else {
      return new Expression({
        label: this.label,
        type: this.type,
        subterms: this.subterms.map((subterm) => subterm.substituting(subtermID, newTerm)),
      })
    }
  }

}

/// A variable.
export class Variable implements Term {

  /// A unique identifier for this variable.
  public readonly id: string

  /// The label of this variable.
  public readonly label: string

  /// The type of this variable, if defined.
  public readonly type: Type

  /// The parent term of this variable.
  public parent: Term

  /// The root term of this variable.
  public get root(): Term {
    return this.parent !== null
      ? this.parent.root
      : this
  }

  public constructor(args: { label: string, type?: Type }) {
    this.id = `var/${Math.random().toString(36).substr(2, 9)}-${args.label}`
    this.label = args.label
    this.type = args.type || null
    this.parent = null
  }

  public reifying(mapping: { [key: string]: Term }): Term {
    return mapping[this.label] || this
  }

  public substituting(subtermID: string, newTerm: Term): Term {
    return this.id === subtermID
      ? newTerm
      : this
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
