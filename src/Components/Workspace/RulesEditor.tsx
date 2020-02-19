import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { insertRule, removeRule, updateRule } from 'FunBlocks/Actions/IDE'
import { Rule } from 'FunBlocks/AST/Terms'
import { RootState } from 'FunBlocks/Store'
import Block from 'FunBlocks/Components/Block'
import RuleBlock from 'FunBlocks/Components/RuleBlock'

const styles = require('./Workspace.module')

type Props = {
  rules: Array<Rule>,
  draggedData: { type: string, payload?: any, callbacks?: Dictionary<Function> },
  insertRule(newRule: Rule): void,
  updateRule(ruleID: string, updates: { left?: Term, right?: Term }): void,
  removeRule(ruleID: string): void,
}

type RulePatch = { left?: Term, right?: Term }

class RulesEditor extends React.PureComponent<Props> {

  render() {
    const rules = this.props.rules.map((rule, i) => (
      <RuleBlock
        key={ i }
        rule={ rule }
        editable
        onUpdate={ (patch: RulePatch) => this.props.updateRule(rule.id, patch) }
        onRemove={ () => this.props.removeRule(rule.id) }
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
    if (this.props.draggedData.type !== 'Rule') { return }

    // Allow data to be dropped onto this block.
    e.preventDefault()
  }

  didDrop(e: React.DragEvent<HTMLDivElement>) {
    // Make sure the dragged object is a rule.
    const draggedData = this.props.draggedData
    if (draggedData.type !== 'Rule') {
      console.warn(`ignored dragged payload of type '${this.props.draggedData.type}'`)
      return
    }

    // Insert the new rule.
    console.assert(this.props.draggedData.payload instanceof Rule)
    this.props.insertRule(this.props.draggedData.payload)
  }

}

const mapStateToProps = (state: RootState) => ({
  rules: state.program.rules,
  draggedData: state.draggedData,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  insertRule: (newRule: Rule) => dispatch(insertRule(newRule)),
  updateRule: (ruleID: string, patch: RulePatch) => dispatch(updateRule(ruleID, patch)),
  removeRule: (ruleID: string) => dispatch(removeRule(ruleID)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RulesEditor)
