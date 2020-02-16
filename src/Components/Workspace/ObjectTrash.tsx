import React from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { RootState } from 'FunBlocks/Store'

const styles = require('./Workspace.module')

type ObjectTrashProps = {
  draggedData: { type: string, payload?: any, callbacks?: Dictionary<Function> },
}

class ObjectTrash extends React.PureComponent<ObjectTrashProps> {

  render() {
    return (
      <div className={ styles.trash }>
        <div
          className={ styles.trashIcon }
          onDragOver={ this.didDragOver.bind(this) }
          onDrop={ this.didDrop.bind(this) }
        >
          <FontAwesomeIcon icon="trash" size="3x" />
        </div>
      </div>
    )
  }

  didDragOver(e: React.DragEvent<HTMLDivElement>) {
    // Ignore this event if the data attached to the drag event is not compatible (i.e. not an
    // expression nor a variable).
    if (this.props.draggedData.type !== 'Term') { return }

    // Allow data to be dropped onto this block.
    e.preventDefault()
  }

  didDrop(e: React.DragEvent<HTMLDivElement>) {
    // Make sure the dragged object is a term.
    if (this.props.draggedData.type !== 'Term') {
      console.warn(`ignored dragged payload of type '${this.props.draggedData.type}'`)
      return
    }

    // Modify the dragged term by removing it from its hierarchy.
    const draggedTerm = this.props.draggedData.payload
    const newRoot = draggedTerm.root.substituting({ [draggedTerm.id]: null })
    this.props.draggedData.callbacks?.onChange?.(newRoot)
  }

}

const mapStateToProps = (state: RootState) => ({ draggedData: state.draggedData })

export default connect(mapStateToProps)(ObjectTrash)
