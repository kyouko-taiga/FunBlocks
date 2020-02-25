import classNames from 'classnames'
import React from 'react'
import AceEditor from "react-ace"
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import "ace-builds/webpack-resolver"
import "ace-builds/src-noconflict/theme-github"

import { ParseIssue } from 'FunBlocks/Parser/Parser'
import { rebuildAST, updateProgramSource } from 'FunBlocks/UI/Actions/IDE'
import { InputMode } from 'FunBlocks/UI/Reducers'
import { RootState } from 'FunBlocks/UI/Store'
import RulesEditor from './RulesEditor'
import StateEditor from './StateEditor'

const styles = require('./Workspace.module')

type Props = {
  inputMode: InputMode,
  source: string,
  parseIssues: Array<ParseIssue>,
  rebuildAST(): void,
  updateProgramSource(source: string): void,
}

class ProgramEditor extends React.PureComponent<Props> {

  private astConstructionRequestTimeout = 0

  render() {
    switch (this.props.inputMode) {
    case InputMode.Visual:
      return this.renderVisual()
    case InputMode.Textual:
      return this.renderTextual()
    default:
      return null
    }
  }

  renderVisual() {
    return (
      <div className={ classNames(styles.programEditor, styles.visual) }>
        <div className={ styles.sectionHeading }>Initial State</div>
        <StateEditor />
        <div className={ styles.sectionHeading }>Rules</div>
        <RulesEditor />
      </div>
    )
  }

  renderTextual() {
    const annotations = this.props.parseIssues.map((issue) => ({
      row: issue.range.lowerBound.line - 1,
      column: issue.range.lowerBound.column - 1,
      text: issue.message,
      type: 'error',
    }))

    return (
      <div className={ classNames(styles.programEditor, styles.textual) }>
        <AceEditor
          mode="funblocks"
          theme="github"
          name="program-editor"
          width="100%"
          height="100%"
          fontSize={ 16 }
          value={ this.props.source }
          annotations={ annotations }
          onChange={ this.didSourceChange.bind(this) }
        />
      </div>
    )
  }

  didSourceChange(newSource: string) {
    this.props.updateProgramSource(newSource)

    // Impose a debounce timeout on the ast reconstruction so that we do not have to go through
    // parsing and semantic analysis every time the source changes.
    window.clearTimeout(this.astConstructionRequestTimeout)
    this.astConstructionRequestTimeout = setTimeout(() => {
      this.props.rebuildAST()
    }, 500)
  }

}

const mapStateToProps = (state: RootState) => ({
  inputMode: state.inputMode,
  source: state.program.source,
  parseIssues: state.program.parseIssues,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  rebuildAST: () => dispatch(rebuildAST()),
  updateProgramSource: (source: string) => dispatch(updateProgramSource(source)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ProgramEditor)
