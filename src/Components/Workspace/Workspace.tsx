import React from 'react'
import { connect } from 'react-redux'

import { Panel } from 'FunBlocks/Components/UILibrary'
import { InterpreterMode } from 'FunBlocks/Reducers/Interpreter'
import { RootState } from 'FunBlocks/Store'
import DebuggingWorkspace from './DebuggingWorkspace'

const styles = require('./Workspace.module')

type WorkspaceProps = {
  mode: InterpreterMode,
}

class Workspace extends React.PureComponent<WorkspaceProps> {

  render() {
    return (
      <Panel mode="fill">
        <Panel.Frame center={ <Panel.Frame.TitleBar title="State Viewer" /> } />
        <Panel.Body>
          { (() => {
            switch (this.props.mode) {
            case InterpreterMode.Debugging:
              return <DebuggingWorkspace />
            default:
              return null
            }
          })() }
        </Panel.Body>
      </Panel>
    )
  }

}

const mapStateToProps = (state: RootState) => ({
  mode: state.interpreter.mode,
})

export default connect(mapStateToProps)(Workspace)
