import React from 'react'
import { connect } from 'react-redux'

import { IDEMode } from 'FunBlocks/UI/Reducers'
import { RootState } from 'FunBlocks/UI/Store'
import DebugWorkspace from './DebugWorkspace'
import EditWorkspace from './EditWorkspace'

const styles = require('./Workspace.module')

/**
 * Component representing the workspace area of the IDE.
 *
 * The workspace area is the part of the IDE that can be used to edit and debug the program. It
 * will present a different view, depending on the IDE's mode.
 */
class Workspace extends React.PureComponent<{ mode: IDEMode }> {

  render() {
    switch (this.props.mode) {
    case IDEMode.Debug:
      return <DebugWorkspace />
    case IDEMode.Edit:
      return <EditWorkspace />
    default:
      return null
    }
  }

}

const mapStateToProps = (state: RootState) => ({
  mode: state.mode,
})

export default connect(mapStateToProps)(Workspace)
