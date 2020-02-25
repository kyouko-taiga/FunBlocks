import { SourceRange } from './SourceRange'

/// The abstract base class for all terms.
export abstract class Term {

  /// This term's ID.
  ///
  /// This property uniquely identifies a term instance, and is therefore suitable to be used as a
  // key in a dictionary or a serialized AST representation. Note that two equivalent terms (e.g.
  // two terms with the same label and no subterms) still have different identifiers.
  public readonly id: string

  /// This term's label.
  public readonly label: string

  /// This term's type, if defined.
  public readonly type: Type

  /// The range in the textual representation of the program that represents this node.
  public readonly range: Optional<SourceRange>

  _parent: Expr = null

  /// This term's parent, if any.
  public get parent(): Expr {
    return this._parent
  }

  /// This term's root.
  public get root(): Term {
    return this._parent !== null
      ? this._parent.root
      : this
  }

  /// A shallow copy of this term.
  public abstract get clone(): Term

  /// Returns a tree-like representation of this term, suitable to be json-serialized.
  public abstract get treeized(): Dictionary

  /// A textual description of this term.
  public abstract get description(): string

  protected constructor(id: string, label: string, type?: Type, range?: SourceRange) {
    this.id = id
    this.label = label
    this.type = type
    this.range = range || null
  }

  /// Returns whether this term is an ancestor of the given term.
  public isAncestor(other: Term): boolean {
    return (other.parent !== null)
        && ((other.parent.id === this.id) || this.isAncestor(other.parent))
  }

  /// Returns this term renamed with the given label.
  public abstract renamed(newLabel: string): Term

  /// Returns a term in which occurrences of variables bound in the given mapping are substituted
  /// for their corresponding term.
  ///
  /// - Parameter mapping: A mapping from variable labels to terms.
  public abstract reified(mapping: Dictionary<Term>): Term

  /// Returns a term in which occurrences of terms identified by the given IDs are substituted for
  /// their corresponding term in the given mapping.
  ///
  /// - Parameter mapping:
  ///   A mapping from term IDs to terms instances or `null`. The latter can be used to remove
  ///   subterms.
  ///
  /// - Note:
  ///   As terms are supposed to be immutable, all terms that are ancestor of a substituted subterm
  ///   must also be substituted by a new term, invalidating their former identifiers. It follows
  ///   that these identifiers cannot be used on subsequent calls to `substituting`. Instead, all
  ///    substitutions should be applied at once.
  public abstract substituting(mapping: Dictionary<Term>): Term

}

/// An expression.
export class Expr extends Term {

  /// The subterms of this expression.
  public readonly subterms: Array<Term>

  public get clone(): Expr {
    return new Expr({ label: this.label, type: this.type, subterms: this.subterms })
  }

  public get treeized(): Dictionary {
    return {
      _objectType: 'Expr',
      id: this.id,
      label: this.label,
      type: this.type,
      subterms: this.subterms.map((subterm) => subterm.treeized),
      parent: this.parent?.id || null,
    }
  }

  public get description(): string {
    let result = this.label
    if (this.subterms.length > 0) {
      result = result + `(${this.subterms.map((subterm) => subterm.description).join(', ')})`
    }
    return result
  }

  public constructor(args: {
    id?: string,
    label: string,
    type?: Type,
    subterms?: Term[],
    range?: SourceRange,
  }) {
    const id = args.id || `expr/${Math.random().toString(36).substr(2, 9)}-${args.label}`
    super(id, args.label, args.type, args.range)

    this.subterms = args.subterms || []
    for (const subterm of this.subterms) {
      subterm._parent = this
    }
  }

  /// Computes a variable mapping for which this term matches the given pattern.
  public match(pattern: Term, context: Dictionary<Term> = {}): Dictionary<Term> {
    // Check for trivial cases.
    if (this === pattern) {
      return {}
    }

    // The pattern's type has to match that of this term.
    if (this.type !== null && pattern.type !== null && this.type !== pattern.type) {
      return null
    }

    if (pattern instanceof VarRef) {
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
    if (pattern instanceof Expr) {
      if (this.label != pattern.label || this.subterms.length != pattern.subterms.length) {
        return null
      }

      let mapping = context
      for (let i = 0; i < this.subterms.length; ++i) {
        // The receiver of `match()` is supposed to be a state and therefore it should not contain
        // any variable in its subterms.
        console.assert(this.subterms[i] instanceof Expr)

        // Check if the subterms match, given the current context.
        mapping = (this.subterms[i] as Expr).match(pattern.subterms[i], mapping)
        if (mapping === null) {
          return null
        }
      }
      return mapping
    }

    // This term does not match the pattern.
    return null
  }

  public renamed(newLabel: string): Term {
    return new Expr({ label: newLabel, type: this.type, subterms: this.subterms })
  }

  public reified(mapping: Dictionary<Term>): Term {
    if (this.subterms.length == 0) {
      return this
    }

    let mutated = false
    const reifiedSubterms = []
    for (let i = 0; i < this.subterms.length; ++i) {
      const reified = this.subterms[i].reified(mapping)
      if (reified !== this.subterms[i]) {
        mutated = true
      }
      reifiedSubterms.push(reified)
    }

    return mutated
      ? new Expr({ label: this.label, type: this.type, subterms: reifiedSubterms })
      : this
  }

  public substituting(mapping: Dictionary<Term>): Term {
    if (this.id in mapping) {
      const nextMapping = { ...mapping }
      delete nextMapping[this.id]
      return mapping[this.id]?.substituting(nextMapping) || null
    }

    if (this.subterms.length == 0) {
      return this
    }

    let mutated = false
    const substitutedSubterms = []
    for (let i = 0; i < this.subterms.length; ++i) {
      const substituted = this.subterms[i].substituting(mapping)
      if (substituted !== this.subterms[i]) {
        mutated = true
        if (substituted === null) { continue }
      }
      substitutedSubterms.push(substituted)
    }

    return mutated
      ? new Expr({ label: this.label, type: this.type, subterms: substitutedSubterms })
      : this
  }

}

/// A variable.
export class VarRef extends Term {

  public get clone(): VarRef {
    return new VarRef({ label: this.label, type: this.type })
  }

  public get treeized(): Dictionary {
    return {
      _objectType: 'VarRef',
      id: this.id,
      label: this.label,
      type: this.type,
      parent: this.parent?.id || null,
    }
  }

  public get description(): string {
    return `$${this.label}`
  }

  public constructor(args: {
    id?: string,
    label: string,
    type?: Type,
    range?: SourceRange,
  }) {
    const id = args.id || `var/${Math.random().toString(36).substr(2, 9)}-${args.label}`
    super(id, args.label, args.type, args.range)
  }

  public renamed(newLabel: string): Term {
    return new VarRef({ label: newLabel, type: this.type })
  }

  public reified(mapping: Dictionary<Term>): Term {
    return this.label in mapping
      ? mapping[this.label]
      : this
  }

  public substituting(mapping: Dictionary<Term>): Term {
    return this.id in mapping
      ? mapping[this.id]
      : this
  }

}
