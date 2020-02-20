import React from 'react'

import Workspace from 'FunBlocks/UI/Components/Workspace'
import MenuBar from './MenuBar'

const styles = require('./IDE.module')

class IDE extends React.PureComponent {

  render() {
    return (
      <div className={ styles.ide }>
        <MenuBar />
        <Workspace />
      </div>
    )
  }

}

export default IDE
