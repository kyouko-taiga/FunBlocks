import React from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { RootState } from 'FunBlocks/Store'
import { Rule, Term } from 'FunBlocks/AST/Terms'
import Block from 'FunBlocks/Components/Block'
import RuleBlock from 'FunBlocks/Components/RuleBlock'

import { Panel, Button, ButtonGroup } from 'FunBlocks/Components/UILibrary'

const styles = require('./Workspace.module')

type WorkspaceProps = {
  history: Array<Term>,
  ruleSet: Array<Rule>,
}

type WorkspaceState = {
}

class Workspace extends React.Component<WorkspaceProps, WorkspaceState> {

  state = {
  }

  render() {
    const buttons = this.props.history.map((term) => (
      <button key={ term.id } />
    ))

    const rules = this.props.ruleSet.map((rule) => (
      <RuleBlock key={ rule.id } rule={ rule } />
    ))

    return (
      <Panel mode="fill">
        <Panel.Frame center={ <Panel.Frame.TitleBar title="State Viewer" /> } />
        <Panel.Body>
          <div className={ styles.workspace }>
            <div className={ styles.history }>
              { buttons }
            </div>
            <div className={ styles.stateViewer }>
              {
                (this.props.history.length > 0) && (
                  <Block
                    term={ this.props.history[this.props.history.length - 1] }
                    onClick={ this.didTermClick.bind(this) }
                  />
                )
              }
            </div>
            <div className={ styles.rulesViewer }>{ rules }</div>
          </div>
        </Panel.Body>
      </Panel>
    )
  }

  didTermClick(term: Term) {
  }

}

const mapStateToProps = (state: RootState) => ({
  history: state.interpreterHistory,
  ruleSet: state.ruleSet,
})

export default connect(mapStateToProps)(Workspace)
