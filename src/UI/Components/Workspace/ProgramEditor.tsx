import classNames from 'classnames'
import React from 'react'
import AceEditor from "react-ace"
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import "ace-builds/webpack-resolver"
import "ace-builds/src-noconflict/theme-github"

import { updateProgramSource } from 'FunBlocks/UI/Actions/IDE'
import { InputMode } from 'FunBlocks/UI/Reducers'
import { RootState } from 'FunBlocks/UI/Store'
import RulesEditor from './RulesEditor'
import StateEditor from './StateEditor'

const styles = require('./Workspace.module')

type Props = {
  inputMode: InputMode,
  source: string,
  updateProgramSource(source: string): void,
}

class ProgramEditor extends React.PureComponent<Props> {

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
          onChange={ this.props.updateProgramSource }
        />
      </div>
    )
  }

}

const mapStateToProps = (state: RootState) => ({
  inputMode: state.inputMode,
  source: state.program.source,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateProgramSource: (source: string) => dispatch(updateProgramSource(source)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ProgramEditor)
