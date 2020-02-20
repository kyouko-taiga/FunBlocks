import classNames from 'classnames'
import React from 'react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import UITheme from './UITheme'

const styles = require('./UILibrary.module')

type ButtonProps = {
  classes?: string,
  pressed?: boolean,
  theme?: UITheme,
  icon?: IconProp,
  onClick?(e: React.TouchEvent | React.MouseEvent): void,
}

class Button extends React.PureComponent<ButtonProps> {

  public static defaultProps = {
    pressed: false,
    theme: UITheme.Light,
    onClick: () => {},
  }

  public render() {
    const icon = this.props.icon && (
      <span className={ styles.btnIcon }>
        <FontAwesomeIcon icon={ this.props.icon } size="sm" />
      </span>
    )

    const label = this.props.children && (
      <span>
        { this.props.children }
      </span>
    )

    const className = classNames(styles.btn, this.props.classes, {
      [styles.pressed]: this.props.pressed,
      [styles.dark]: this.props.theme == UITheme.Dark,
    })

    return (
      <button className={ className } onClick={ this.props.onClick }>
        { icon }
        { label }
      </button>
    )
  }

}

export default Button
