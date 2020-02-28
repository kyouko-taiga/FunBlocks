import React from 'react'

import { Term } from 'FunBlocks/AST/TermNodes'

export interface TermViewContextInterface {

  /// The optional term in which a drop placeholder should be rendered on compatible drag events.
  dropPlaceholderContainer: Optional<Term>

  /// The index of the subterm of `dropPlaceholderContainer` before which the drop placeholder
  /// should be rendered compatible drag events.
  dropPlaceholderIndexInContainer: number

  /// The most nested term currently hovered by the mouse.
  mostNestedHoveredTerm: Optional<Term>

}

export const textViewContextValue = {
  dropPlaceholderContainer: null as Optional<Term>,
  dropPlaceholderIndexInContainer: -1,
  mostNestedHoveredTerm: null as Optional<Term>,
}

export const TermViewContext = React
  .createContext<TermViewContextInterface>(textViewContextValue)
