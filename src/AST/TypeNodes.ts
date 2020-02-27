import { Node, NodeInterface } from './Node'
import { SourceRange } from './SourceRange'

/// A type signature.
export interface TypeSign extends NodeInterface {

}

/// A type reference signature.
export interface TypeRef extends TypeSign {

}

/// The signature of an arrow type (i.e. a type of the form `A -> B`).
export class ArrowTypeSign extends Node implements TypeSign {

  /// This arrow type's domain.
  readonly left: TypeSign

  /// This arrow type's codomain.
  readonly right: TypeSign

  constructor({ range, left, right }: {
    range?: SourceRange,
    left: TypeSign,
    right: TypeSign,
  }) {
    super(range)
    this.left = left
    this.right = right
  }

}

/// A reference to a type declaration.
export class TypeDeclRef extends Node implements TypeRef {

  /// The name of the referred type.
  readonly name: string

  /// The type arguments used to specialize the referred type.
  readonly arguments: Array<TypeRef>

  constructor({ range, name, args }: {
    range?: SourceRange,
    name: string,
    args?: Array<TypeRef>,
  }) {
    super(range)
    this.name = name
    this.arguments = args || []
  }

}

/// A reference to a type variable.
export class TypeVarRef extends Node implements TypeRef {

  /// This type variable's label.
  readonly label: string

  constructor({ range, label }: {
    range?: SourceRange,
    label: string,
  }) {
    super(range)
    this.label = label
  }

}
