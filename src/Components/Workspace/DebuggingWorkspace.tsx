import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { pushState, selectRule } from 'FunBlocks/Actions/Interpreter'
import { Expression, Term, Rule } from 'FunBlocks/AST/Terms'
import Block from 'FunBlocks/Components/Block'
import RuleBlock from 'FunBlocks/Components/RuleBlock'
import { DebuggingContext } from 'FunBlocks/Reducers/Interpreter'
import { RootState } from 'FunBlocks/Store'

const styles = require('./Workspace.module')

type DebuggingWorkspaceProps = DebuggingContext & {
  ruleSet: Array<Rule>,
  pushState(state: Term): void,
  selectRule(ruleID: string): void,
}

class DebuggingWorkspace extends React.PureComponent<DebuggingWorkspaceProps> {

  render() {
    const rules = this.props.ruleSet.map((rule) => (
      <RuleBlock
        key={ rule.id }
        rule={ rule }
        selected={ rule.id == this.props.selectedRuleID }
        onClick={ this.didClickOnRule.bind(this) }
      />
    ))

    return (
      <div className={ styles.workspace }>
        <History states={ this.props.history } />
        <div className={ styles.stateViewer }>
          {
            (history.length > 0) && (
              <Block
                term={ this.props.history[this.props.history.length - 1] }
                onClick={ this.didClickOnExpr.bind(this) }
              />
            )
          }
        </div>
        <div className={ styles.rulesViewer }>
          { rules }
        </div>
      </div>
    )
  }

  componentDidMount() {
    // Add a listener that catches keydown events on the ESC key, to unselect a rule.
    document.addEventListener('keydown', this.didKeydown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.didKeydown)
  }

  private readonly didKeydown = (e: KeyboardEvent) => {
    if (e.keyCode == 27 /* ESC */) {
      this.props.selectRule(null)
    }
  }

  private didClickOnExpr(expr: Expression) {
    // If a rule has been selected, we shall try to apply it on the clicked term to rewrite it.
    const selectedRuleID = this.props.selectedRuleID
    if (selectedRuleID !== null) {
      // Load the rule to apply.
      const rule = this.props.ruleSet.find((r) => r.id == selectedRuleID)
      console.assert(rule !== undefined, `rule not found '${selectedRuleID}'`)

      // Check if the left part of the rule matches the selected term.
      const mapping = expr.match(rule.left)
      if (mapping === null) {
        console.error('TODO')
        return
      }

      // Compute the substitution.
      const result = rule.right.reifying(mapping)
      const successor = this.props.history[this.props.history.length - 1]
        .substituting(expr.id, result)
      this.props.pushState(successor)
      this.props.selectRule(null)
    }
  }

  private didClickOnRule(rule: Rule) {
    if (this.props.selectedRuleID !== rule.id) {
      this.props.selectRule(rule.id)
    } else {
      this.props.selectRule(null)
    }
  }

}

class History extends React.PureComponent<{ states: Array<Term> }> {

  render() {
    const buttons = this.props.states.map((term) => (<button key={ term.id } />))
    return (
      <div className={ styles.history }>
        { buttons }
      </div>
    )
  }

}

const mapStateToProps = (state: RootState) => ({
  ...state.interpreter.context,
  ruleSet: state.ruleSet,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  pushState: (state: Term) => dispatch(pushState(state)),
  selectRule: (ruleID: string) => dispatch(selectRule(ruleID)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DebuggingWorkspace)
