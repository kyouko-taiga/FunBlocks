import React from 'react'

import StateEditor from './StateEditor'

const styles = require('./Workspace.module')

class ProgramEditor extends React.PureComponent {

  render() {
    return (
      <div className={ styles.programEditor }>
        <div className={ styles.sectionHeading }>
          Initial State
        </div>
        <StateEditor />
      </div>
    )
  }

}

export default ProgramEditor
