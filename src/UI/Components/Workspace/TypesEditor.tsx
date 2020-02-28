import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as AST from 'FunBlocks/AST'
// import { insertRuleCase, removeRuleCase, updateRuleCase } from 'FunBlocks/UI/Actions/IDE'
import { RootState } from 'FunBlocks/UI/Store'
import Block from 'FunBlocks/UI/Components/Block'
import RuleBlock from 'FunBlocks/UI/Components/RuleBlock'

const styles = require('./Workspace.module')

// interface TypeDeclPatch {}

type Props = {
  // typeDecls: Array<AST.TypeDecl>,
  draggedData: { type: string, payload?: any, callbacks?: Dictionary<Function> },
  // insertTypeDecl(newTypeDecl: AST.TypeDecl): void,
  // updateTypeDecl(typeDeclID: string, updates: TypeDeclPath): void,
  // removeTypeDecl(typeDeclID: string): void,
}

class TypesEditor extends React.PureComponent<Props> {

  render() {
    return (
      <div className={ styles.rulesEditor }>
        <div
          className={ styles.objectPlaceholder }
          onDragOver={ this.didDragOver.bind(this) }
          onDrop={ this.didDrop.bind(this) }
        >
          <FontAwesomeIcon icon="arrow-down" />
          <span className={ styles.label }>Drop a type here</span>
        </div>
      </div>
    )
  }

  didDragOver(e: React.DragEvent<HTMLDivElement>) {
    // Ignore this event if the data attached to the drag event is not a type declarations.
    if (this.props.draggedData.type !== 'TypeDecl') { return }

    // Allow data to be dropped onto this block.
    e.preventDefault()
  }

  didDrop(e: React.DragEvent<HTMLDivElement>) {
    // Make sure the dragged object is a type declaration.
    const draggedData = this.props.draggedData
    if (draggedData.type !== 'TypeDecl') {
      console.warn(`ignored dragged payload of type '${this.props.draggedData.type}'`)
      return
    }

    // Insert the new type declaration.
    console.assert(this.props.draggedData.payload instanceof AST.TypeDecl)
    // this.props.insertTypeDecl(this.props.draggedData.payload)
  }

}

const mapStateToProps = (state: RootState) => ({
  // typeDecls: state.program.typeDecls,
  draggedData: state.draggedData,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // insertTypeDecl: (newTypeDecl: AST.TypeDecl) => dispatch(insertTypeDecl(newTypeDecl)),
  // unpdateTypeDecl: (typeDeclID: string, patch: TypeDeclPatch) =>
  //   dispatch(updateTypeDecl(typeDeclID, patch)),
  // removeTypeDecl: (typeDeclID: string) => dispatch(removeTypeDecl(typeDeclID)),
})

export default connect(mapStateToProps, mapDispatchToProps)(TypesEditor)
