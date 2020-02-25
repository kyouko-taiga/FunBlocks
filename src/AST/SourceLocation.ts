import { SourceRange } from './SourceRange'

/// A location in a text input buffer, given as two 1-based line and column indices.
export interface SourceLocation {

  /// The 1-indexed line number in the source text of the location.
  readonly line: number

  /// The column number in the source text of the location.
  readonly column: number

  /// The character offset in the source text of the location.
  readonly offset: number

}
