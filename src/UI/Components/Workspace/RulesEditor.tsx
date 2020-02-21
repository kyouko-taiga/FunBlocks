import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as AST from 'FunBlocks/AST'
import { insertRuleCase, removeRuleCase, updateRuleCase } from 'FunBlocks/UI/Actions/IDE'
import { RootState } from 'FunBlocks/UI/Store'
import Block from 'FunBlocks/UI/Components/Block'
import RuleBlock from 'FunBlocks/UI/Components/RuleBlock'

const styles = require('./Workspace.module')

type Props = {
  ruleCases: Array<AST.RuleCaseDecl>,
  draggedData: { type: string, payload?: any, callbacks?: Dictionary<Function> },
  insertRuleCase(newRule: AST.RuleCaseDecl): void,
  updateRuleCase(ruleCaseID: string, updates: { left?: Term, right?: Term }): void,
  removeRuleCase(ruleCaseID: string): void,
}

type RuleCasePatch = { left?: Term, right?: Term }

class RulesEditor extends React.PureComponent<Props> {

  render() {
    const rules = this.props.ruleCases.map((rule, i) => (
      <RuleBlock
        key={ i }
        rule={ rule }
        editable
        onUpdate={ (patch: RuleCasePatch) => this.props.updateRuleCase(rule.id, patch) }
        onRemove={ () => this.props.removeRuleCase(rule.id) }
      />
    ))

    return (
      <div className={ styles.rulesEditor }>
        { rules }
        <div
          className={ styles.objectPlaceholder }
          onDragOver={ this.didDragOver.bind(this) }
          onDrop={ this.didDrop.bind(this) }
        >
          <FontAwesomeIcon icon="arrow-down" />
          <span className={ styles.label }>Drop a rule here</span>
        </div>
      </div>
    )
  }

  didDragOver(e: React.DragEvent<HTMLDivElement>) {
    // Ignore this event if the data attached to the drag event is not a rule.
    if (this.props.draggedData.type !== 'RuleCaseDecl') { return }

    // Allow data to be dropped onto this block.
    e.preventDefault()
  }

  didDrop(e: React.DragEvent<HTMLDivElement>) {
    // Make sure the dragged object is a rule.
    const draggedData = this.props.draggedData
    if (draggedData.type !== 'RuleCaseDecl') {
      console.warn(`ignored dragged payload of type '${this.props.draggedData.type}'`)
      return
    }

    // Insert the new rule.
    console.assert(this.props.draggedData.payload instanceof AST.RuleCaseDecl)
    this.props.insertRuleCase(this.props.draggedData.payload)
  }

}

const mapStateToProps = (state: RootState) => ({
  ruleCases: state.program.ruleCases,
  draggedData: state.draggedData,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  insertRuleCase: (newRule: AST.RuleCaseDecl) => dispatch(insertRuleCase(newRule)),
  updateRuleCase: (ruleCaseID: string, patch: RuleCasePatch) =>
    dispatch(updateRuleCase(ruleCaseID, patch)),
  removeRuleCase: (ruleCaseID: string) => dispatch(removeRuleCase(ruleCaseID)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RulesEditor)
