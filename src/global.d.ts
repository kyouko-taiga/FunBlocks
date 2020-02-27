/// An optional value (i.e. a value of type `T` or `null`).
type Optional<T> = T | null

/// A mapping from string to values of type `T`.
interface Dictionary<T=any> {

  [key: string]: T

}

/// A redux action without any payload.
type Action<Meta=void> = import("redux").Action<string> & { meta?: Meta }

/// A redux with a payload.
type PayloadAction<Payload, Meta=void> = Action<Meta> & { readonly payload: Payload }

/// A type.
interface Type {

  /// The color associated with the type.
  readonly baseColor: import("FunBlocks/UI/Utils/Color")

}

/// A term (e.g. an expression or a variable).
type Term = import("FunBlocks/AST").Term

/// A FunBlocks' program.
interface Program {

  /// The program's initial state.
  readonly initialState: Term

  /// The program's rewriting rules.
  readonly ruleCases: Array<import("FunBlocks/AST").RuleCaseDecl>

}
