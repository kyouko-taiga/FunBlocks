import React from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as AST from 'FunBlocks/AST'
import { DraggedData } from 'FunBlocks/UI/Reducers/DraggedData'
import { RootState } from 'FunBlocks/UI/Store'

const styles = require('./RuleBlock.module')

type Props = {
  /// Inidicates whether the placeholder should accept variables on drop events (default `false`).
  allowsVariables?: boolean,
  /// The data associated with drag events.
  draggedData: DraggedData,
  /// A callback that is called when a valid term is dropped onto this placeholder.
  onDrop(term: Term): void,
}

class BlockPlaceholder extends React.PureComponent<Props> {

  static defaultProps = {
    allowsVariables: false,
  }

  render() {
    return (
      <div
        className={ styles.placeholder }
        onDragOver={ this.didDragOver.bind(this) }
        onDrop={ this.didDrop.bind(this) }
      >
        <FontAwesomeIcon icon="arrow-down" />
      </div>
    )
  }

  didDragOver(e: React.DragEvent<HTMLDivElement>) {
    // Ignore this event if the data attached to the drag event is not a term.
    if (this.props.draggedData.type !== 'Term') { return }

    // Ignore this event if the data attached to the drag event is a variable, unless the
    // `allowsVariables` flag is set.
    if ((this.props.draggedData.payload instanceof AST.VarRef) && !this.props.allowsVariables) {
      return
    }

    // Allow data to be dropped onto this block.
    e.preventDefault()
  }

  didDrop(e: React.DragEvent<HTMLDivElement>) {
    // Make sure the dragged object is a term.
    const draggedData = this.props.draggedData
    if (draggedData.type !== 'Term') {
      console.warn(`ignored dragged payload of type '${this.props.draggedData.type}'`)
      return
    }

    // Ignore this event if the data attached to the drag event is a variable, unless the
    // `allowsVariables` flag is set.
    if ((this.props.draggedData.payload instanceof AST.VarRef) && !this.props.allowsVariables) {
      return
    }

    // Notify the drop.
    this.props.onDrop(this.props.draggedData.payload)
  }

}

const mapStateToProps = (state: RootState) => ({ draggedData: state.draggedData })

export default connect(mapStateToProps)(BlockPlaceholder)
