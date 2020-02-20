import React from 'react'

import RulesEditor from './RulesEditor'
import StateEditor from './StateEditor'

const styles = require('./Workspace.module')

class ProgramEditor extends React.PureComponent {

  render() {
    return (
      <div className={ styles.programEditor }>
        <div className={ styles.sectionHeading }>Initial State</div>
        <StateEditor />
        <div className={ styles.sectionHeading }>Rules</div>
        <RulesEditor />
      </div>
    )
  }

}

export default ProgramEditor
