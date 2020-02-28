import React from 'react'
import { connect as connectStore } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as AST from 'FunBlocks/AST'
import { program } from 'FunBlocks/Program'
import Block from 'FunBlocks/UI/Components/Block'
import { RootState } from 'FunBlocks/UI/Store'
import { connectObservable } from 'FunBlocks/UI/Utils/ObservableConnector'

const styles = require('./Workspace.module')

interface Props {
  initialState: Optional<AST.Term>
  draggedData: { type: string, payload?: any, callbacks?: Dictionary<Function> }
}

class StateEditor extends React.PureComponent<Props> {

  render() {
    return (
      <div
        className={ styles.stateEditor }
        onDragOver={ this.didDragOver.bind(this) }
        onDrop={ this.didDrop.bind(this) }
      >
        { this.renderContent() }
      </div>
    )
  }

  renderContent() {
    if (this.props.initialState) {
      return (
        <Block term={ this.props.initialState } editable />
      )
    } else {
      return (
        <div className={ styles.objectPlaceholder }>
          <FontAwesomeIcon icon="arrow-down" />
          <span className={ styles.label }>Drop an expression here</span>
        </div>
      )
    }
  }

  didDragOver(e: React.DragEvent<HTMLDivElement>) {
    // Ignore this event if the program's initial state is defined.
    if (!!this.props.initialState) { return }

    // Ignore this event if the data attached to the drag event is not an expression.
    if (this.props.draggedData.type !== 'Term') { return }
    if (!(this.props.draggedData.payload instanceof AST.Expr)) { return }

    // Allow data to be dropped onto this block.
    e.preventDefault()
  }

  didDrop(e: React.DragEvent<HTMLDivElement>) {
    // Ignore this event if the program's initial state is defined.
    if (!!this.props.initialState) { return }

    // Make sure the dragged object is a term.
    const draggedData = this.props.draggedData
    if (draggedData.type !== 'Term' || !(draggedData.payload instanceof AST.Expr)) {
      console.warn(`ignored dragged payload of type '${this.props.draggedData.type}'`)
      return
    }

    // Set the program's initial state.
    const state = this.props.draggedData.payload
    console.assert((state instanceof AST.Expr))
    program.units.Main.insertDecl(new AST.InitStateDecl({ state }))
  }

}

// Connect `draggedData` from Redux
const mapStateToProps = (state: RootState) => ({ draggedData: state.draggedData })
const ConnectedStateEditor = connectStore(mapStateToProps)(StateEditor)

// Subscribe the component to the main translation unit to extract its initial state.
const observeUnit = (unit: AST.TranslationUnitDecl): { initialState: Optional<AST.Term> } => {
  for (let decl of unit.decls) {
    if (decl instanceof AST.InitStateDecl) {
      return { initialState: decl.state }
    }
  }
  return { initialState: null }
}
export default connectObservable(program.units.Main, observeUnit)(ConnectedStateEditor)
