import React from 'react'

import Frame from './Frame'

const styles = require('./UILibrary.module')

type PanelProps = {
  mode?: string,
}

class Body extends React.PureComponent {

  render() {
    return <div>{ this.props.children }</div>
  }

}

class Panel extends React.PureComponent<PanelProps> {

  public static readonly Frame = Frame
  public static readonly Body = Body

  render() {
    const className = this.props.mode == 'fill'
      ? `${styles.panel} ${styles.fullwidth}`
      : styles.panel

    return (
      <div className={ className }>
        { this.props.children }
      </div>
    )
  }

}

export default Panel
