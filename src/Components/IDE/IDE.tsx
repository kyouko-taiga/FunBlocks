import React from 'react'

import Workspace from 'FunBlocks/Components/Workspace'
import MenuBar from './MenuBar'

const styles = require('./IDE.module')

type State = {

}

class IDE extends React.Component<{}, State> {

  render() {
    return (
      <div>
        <MenuBar />
        <Workspace />
      </div>
    )
  }

}

export default IDE
