import React from 'react'

const styles = require('./UILibrary.module')

class ButtonGroup extends React.PureComponent {

  render() {
    return (
      <div className={ styles.btnGroup }>
        { this.props.children }
      </div>
    )
  }

}

export default ButtonGroup
