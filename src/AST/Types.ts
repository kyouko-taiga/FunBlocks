import Color from 'FunBlocks/Utils/Color'
import { Expression, Term, Variable } from './Terms'

/// The type of a term.
export interface Type {

  /// The color associated with the type.
  readonly baseColor: Color

}

/// An enumeration type.
///
/// An enumeration type defines a (possibly recursive) type by enumerating the records that compose
/// its domain. For example, the type `List = empty | cons(Element, List)` defines a list type that
/// is either `empty`, denoting an empty list, or `cons(head, tail)` where `head` is a record
/// prepended to the list denoted by `tail`.
export class EnumType implements Type {

  /// This type's name.
  public readonly name: string

  /// The color associated with the type.
  public readonly baseColor: Color

  /// The types that compose this sum type.
  public get cases(): Array<Expression> {
    return this._cases
  }

  public set cases(exprs: Array<Expression>) {
    // Make sure the cases are not redefined.
    if (this._cases !== null) {
      throw new Error(`invalid redefinition of the enum type '${this.name}'`)
    }

    // Make sure the cases are not typed with any other type.
    this._cases = []
    for (let expr of exprs) {
      if (!!expr.type && expr.type !== this) {
        throw new Error(`cannot define enum type '${this.name}' with case of type ${expr.type}`)
      }
      this._cases.push(new Expression({ ...expr, type: this }))
    }
  }

  private _cases: Array<Expression>

  public constructor(args: { name: string, baseColor?: Color, cases?: Array<Expression> }) {
    this.name = args.name
    this.baseColor = args.baseColor || Color.hsl(Math.random(), Math.random() / 2 + 0.5, 0.3)
    this._cases = null

    if (!!args.cases) {
      this.cases = args.cases
    }
  }

}

/// An arrow type.
export class ArrowType implements Type {

  /// The color associated with the type.
  public readonly baseColor: Color

  /// The type's domain.
  public readonly domain: Type

  /// The type's codomain.
  public readonly codomain: Type

  public constructor(args: { baseColor?: Color, domain: Type, codomain: Type }) {
    this.baseColor = args.baseColor || Color.hsl(Math.random(), Math.random() / 2 + 0.5, 0.3)
    this.domain = args.domain
    this.codomain = args.codomain
  }

}
