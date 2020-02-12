import React from 'react'

import { Term } from 'FunBlocks/AST/Terms'
import Block from 'FunBlocks/Components/Block'

const styles = require('./Workspace.module')

type Props = {
  term: Term,
}

class BlockEditor extends React.PureComponent<Props> {

  render() {
    return (
      <div className={ styles.blockEditor }>
        <Block term={ this.props.term } onDropSubterm={ this.didDropSubterm.bind(this) } />
      </div>
    )
  }

  didDropSubterm() {

  }

}

export default BlockEditor
