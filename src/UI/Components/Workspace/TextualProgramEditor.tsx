import classNames from 'classnames'
import React from 'react'
import AceEditor from "react-ace"
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import "ace-builds/webpack-resolver"
import "ace-builds/src-noconflict/theme-dracula"

import { ParseIssue } from 'FunBlocks/Parser/Parser'
import { rebuildAST, updateProgramSource } from 'FunBlocks/UI/Actions/IDE'
import { RootState } from 'FunBlocks/UI/Store'
import { FBMode } from './FBMode'
import RulesEditor from './RulesEditor'
import StateEditor from './StateEditor'

const styles = require('./Workspace.module')

type Props = {
  source: string,
  parseIssues: Array<ParseIssue>,
  rebuildAST(): void,
  updateProgramSource(source: string): void,
}

class TextualProgramEditor extends React.PureComponent<Props> {

  private aceRef = React.createRef<AceEditor>()
  private astConstructionRequestTimeout = 0

  render() {
    const annotations = this.props.parseIssues.map((issue) => ({
      row: issue.range.lowerBound.line - 1,
      column: issue.range.lowerBound.column - 1,
      text: issue.message,
      type: 'error',
    }))

    return (
      <div className={ classNames(styles.programEditor, styles.textual) }>
        <AceEditor
          ref={ this.aceRef }
          mode="text"
          theme="dracula"
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

  componentDidMount() {
    const fbMode = new FBMode()
    this.aceRef.current.editor.getSession().setMode(fbMode)
  }

  componentWillUnmount() {
    window.clearTimeout(this.astConstructionRequestTimeout)
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
  source: state.program.source,
  parseIssues: state.program.parseIssues,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  rebuildAST: () => dispatch(rebuildAST()),
  updateProgramSource: (source: string) => dispatch(updateProgramSource(source)),
})

export default connect(mapStateToProps, mapDispatchToProps)(TextualProgramEditor)
