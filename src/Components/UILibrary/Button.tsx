import classNames from 'classnames'
import React from 'react'

const styles = require('./UILibrary.module')

type ButtonProps = {
  active?: boolean,
  onClick?(e: React.TouchEvent | React.MouseEvent): void,
}

class Button extends React.PureComponent<ButtonProps> {

  static defaultProps = {
    active: false,
    onClick: () => {},
  }

  render() {
    const className = classNames(styles.btn, {
      [styles.active]: this.props.active,
    })

    return (
      <button className={ className } onClick={ this.props.onClick }>
        { this.props.children }
      </button>
    )
  }

}

export default Button
