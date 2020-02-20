/// A type signature.
export interface TypeSign {
}

/// A type reference signature.
export interface TypeRef extends TypeSign {
}

/// The signature of an arrow type (i.e. a type of the form `A -> B`).
export class ArrowTypeSign implements TypeSign {

  public readonly left: TypeSign
  public readonly right: TypeSign

  public constructor(args: { left: TypeSign, right: TypeSign }) {
    this.left = args.left
    this.right = args.right
  }

}

/// A reference to a type declaration.
export class TypeDeclRef implements TypeRef {

  public readonly name: string
  public readonly arguments: Array<TypeRef>

  public constructor(args: { name: string, arguments: Array<TypeRef> }) {
    this.name = args.name
    this.arguments = args.arguments
  }

}

/// A reference to a type variable.
export class TypeVarRef implements TypeRef {

  public readonly label: string

  public constructor(args: { label: string }) {
    this.label = args.label
  }

}
