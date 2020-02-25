import classNames from 'classnames'
import React from 'react'

import RulesEditor from './RulesEditor'
import StateEditor from './StateEditor'

const styles = require('./Workspace.module')

class VisualProgramEditor extends React.PureComponent {

  render() {
    return (
      <div className={ classNames(styles.programEditor, styles.visual) }>
        <div className={ styles.sectionHeading }>Initial State</div>
        <StateEditor />
        <div className={ styles.sectionHeading }>Rules</div>
        <RulesEditor />
      </div>
    )
  }

}

export default VisualProgramEditor
