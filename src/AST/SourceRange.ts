import { SourceLocation } from './SourceLocation'

/// A half-open range in a text input buffer.
export interface SourceRange {

  /// The range’s lower bound.
  readonly lowerBound: SourceLocation

  /// The range’s upper bound.
  readonly upperBound: SourceLocation

}
