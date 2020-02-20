import React from 'react'
import { connect } from 'react-redux'

import { RootState } from 'FunBlocks/UI/Store'
import ProgramEditor from './ProgramEditor'
import Toolbox from './Toolbox'

const styles = require('./Workspace.module')

class EditWorkspace extends React.PureComponent {

  render() {
    return (
      <div className={ `${styles.workspace} ${styles.edit}` }>
        <Toolbox />
        <ProgramEditor />
      </div>
    )
  }

}

export default EditWorkspace
