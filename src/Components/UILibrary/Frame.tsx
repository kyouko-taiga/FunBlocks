import React from 'react'

const styles = require('./UILibrary.module')

type FrameProps = {
  left?: React.ReactNode,
  center?: React.ReactNode,
  right?: React.ReactNode,
}

class TitleBar extends React.PureComponent<{ title: string }> {

  render() {
    return <div className={ styles.titleBar }>{ this.props.title }</div>
  }

}

class Frame extends React.PureComponent<FrameProps> {

  public static readonly TitleBar = TitleBar

  render() {
    return (
      <div className={ styles.frame }>
        <div className={ styles.left }>{ this.props.left || null }</div>
        <div className={ styles.center }>{ this.props.center || null }</div>
        <div className={ styles.right }>{ this.props.right || null }</div>
      </div>
    )
  }

}

export default Frame
