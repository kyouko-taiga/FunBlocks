import React from 'react'

// import Block from 'FunBlocks/Components/Block'
import { Panel } from 'FunBlocks/Components/UILibrary'

class ProgramEditor extends React.PureComponent {

  render() {
    return (
      <Panel mode="fill">
        <Panel.Frame center={ <Panel.Frame.TitleBar title="Program" /> } />
      </Panel>
    )
  }

}

export default ProgramEditor
