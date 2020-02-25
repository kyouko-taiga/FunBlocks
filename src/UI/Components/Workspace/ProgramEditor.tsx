import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'

import { InputMode } from 'FunBlocks/UI/Reducers'
import { RootState } from 'FunBlocks/UI/Store'
import TextualProgramEditor from './TextualProgramEditor'
import VisualProgramEditor from './VisualProgramEditor'

const styles = require('./Workspace.module')

type ProgramEditorProps = {
  inputMode: InputMode,
}

class ProgramEditor extends React.PureComponent<ProgramEditorProps> {

  render() {
    switch (this.props.inputMode) {
    case InputMode.Visual:
      return <VisualProgramEditor />
    case InputMode.Textual:
      return <TextualProgramEditor />
    default:
      return null
    }
  }

}

const mapStateToProps = (state: RootState) => ({
  inputMode: state.inputMode,
})

export default connect(mapStateToProps)(ProgramEditor)
