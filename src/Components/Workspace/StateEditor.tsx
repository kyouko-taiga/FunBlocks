import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { updateInitialState } from 'FunBlocks/Actions/IDE'
import { Expression, Term } from 'FunBlocks/AST/Terms'
import { RootState } from 'FunBlocks/Store'
import Block from 'FunBlocks/Components/Block'

const styles = require('./Workspace.module')

type Props = {
  initialState: Term,
  draggedData: { type: string, payload?: any, callbacks?: Dictionary<Function> },
  updateInitialState(newState: Term): void,
}

class StateEditor extends React.PureComponent<Props> {

  render() {
    const content = this.props.initialState
      ? <Block
          editable
          term={ this.props.initialState }
          onChange={ this.didInitialStateChange.bind(this) }
        />
      : <div className={ styles.objectPlaceholder }>
          <FontAwesomeIcon icon="arrow-down" />
          <span className={ styles.label }>Drop an expression here</span>
        </div>

    return (
      <div
        className={ styles.stateEditor }
        onDragOver={ this.didDragOver.bind(this) }
        onDrop={ this.didDrop.bind(this) }
      >
        { content }
      </div>
    )
  }

  didInitialStateChange(newInitialState: Term) {
    this.props.updateInitialState(newInitialState)
  }

  didDragOver(e: React.DragEvent<HTMLDivElement>) {
    // Ignore this event if the program's initial state is defined.
    if (!!this.props.initialState) { return }

    // Ignore this event if the data attached to the drag event is not an expression.
    if (this.props.draggedData.type !== 'Term') { return }
    if (!(this.props.draggedData.payload instanceof Expression)) { return }

    // Allow data to be dropped onto this block.
    e.preventDefault()
  }

  didDrop(e: React.DragEvent<HTMLDivElement>) {
    // Ignore this event if the program's initial state is defined.
    if (!!this.props.initialState) { return }

    // Make sure the dragged object is a term.
    const draggedData = this.props.draggedData
    if (draggedData.type !== 'Term' || !(draggedData.payload instanceof Expression)) {
      console.warn(`ignored dragged payload of type '${this.props.draggedData.type}'`)
      return
    }

    // Set the program's initial state.
    console.assert(this.props.draggedData.payload instanceof Term)
    this.props.updateInitialState(this.props.draggedData.payload)
  }

}

const mapStateToProps = (state: RootState) => ({
  initialState: state.program.initialState,
  draggedData: state.draggedData,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateInitialState: (newState: Term) => dispatch(updateInitialState(newState)),
})

export default connect(mapStateToProps, mapDispatchToProps)(StateEditor)
