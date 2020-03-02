import { SourceRange } from './SourceRange'

/// An issue associated with a translation unit.
export interface Diagnostic {

  /// The diagnostic's message.
  readonly message: string

  /// The source range related to this diagnostic.
  readonly range: SourceRange

}
