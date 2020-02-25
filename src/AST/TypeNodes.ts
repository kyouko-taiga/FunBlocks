import { SourceRange } from './SourceRange'

/// A type signature.
export interface TypeSign {

  readonly range: Optional<SourceRange>

}

/// A type reference signature.
export interface TypeRef extends TypeSign {

  readonly range: Optional<SourceRange>

}

/// The signature of an arrow type (i.e. a type of the form `A -> B`).
export class ArrowTypeSign implements TypeSign {

  public readonly left: TypeSign
  public readonly right: TypeSign
  public readonly range: Optional<SourceRange>

  public constructor(args: { left: TypeSign, right: TypeSign, range?: SourceRange }) {
    this.left = args.left
    this.right = args.right
    this.range = args.range || null
  }

}

/// A reference to a type declaration.
export class TypeDeclRef implements TypeRef {

  public readonly name: string
  public readonly arguments: Array<TypeRef>
  public readonly range: Optional<SourceRange>

  public constructor(args: { name: string, arguments: Array<TypeRef>, range?: SourceRange }) {
    this.name = args.name
    this.arguments = args.arguments
    this.range = args.range || null
  }

}

/// A reference to a type variable.
export class TypeVarRef implements TypeRef {

  public readonly label: string
  public readonly range: Optional<SourceRange>

  public constructor(args: { label: string, range?: SourceRange }) {
    this.label = args.label
    this.range = args.range || null
  }

}
