import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { selectRule } from 'FunBlocks/Actions/Interpreter'
import { Term, Rule } from 'FunBlocks/AST/Terms'
import Block from 'FunBlocks/Components/Block'
import RuleBlock from 'FunBlocks/Components/RuleBlock'
import { DebuggingContext } from 'FunBlocks/Reducers/Interpreter'
import { RootState } from 'FunBlocks/Store'

const styles = require('./Workspace.module')

type DebuggingWorkspaceProps = DebuggingContext & {
  ruleSet: Array<Rule>,
  selectRule(ruleID: string): void,
}

class DebuggingWorkspace extends React.PureComponent<DebuggingWorkspaceProps> {

  render() {
    const rules = this.props.ruleSet.map((rule) => (
      <RuleBlock
        key={ rule.id }
        rule={ rule }
        selected={ rule.id == this.props.selectedRule }
        onClick={ () => this.props.selectRule(rule.id) }
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
                onClick={ this.didClickOnTerm.bind(this) }
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

  didClickOnTerm(term: Term) {
    console.log(term.id)
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
  selectRule: (ruleID: string) => dispatch(selectRule(ruleID)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DebuggingWorkspace)
