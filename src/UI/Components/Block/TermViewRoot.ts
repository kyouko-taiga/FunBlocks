import React from 'react'

import { connectDraggedData } from 'FunBlocks/UI/Utils/DraggedDataConnector'
import { TermViewContainer } from './TermViewContainer'
import { TermViewRootProps, TermViewRootState } from './Types'

class _TermViewRoot extends React.Component<TermViewRootProps, TermViewRootState> {

  public static readonly defaultProps = {
    collapsible: true,
    editable: false,
  }

  public readonly state = {
    dropPlaceholderContainer: null as Optional<Term>,
    dropPlaceholderIndexInContainer: -1,
    hoveredTerm: null as Optional<Term>,
  }

  updateHoveredTerm(term: Optional<Term>) {
    this.setState({ hoveredTerm: term })
  }

  public render() {
    return React.createElement(TermViewContainer, {
      ...this.props,
      ...this.state,
      updateHoveredTerm: this.updateHoveredTerm.bind(this),
    })
  }

}

export const TermViewRoot = connectDraggedData(_TermViewRoot)
