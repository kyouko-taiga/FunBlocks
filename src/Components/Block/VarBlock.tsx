import classNames from 'classnames'
import React from 'react'

import { Variable } from 'FunBlocks/AST/Terms'

const styles = require('./Block.module')

type VarBlockProps = {
  term: Variable,
  data: { [key: string]: any },
  isShaking: boolean,
  colors: {
    backgroundColor: string,
    borderColor: string,
    color: string,
  },
  onClick?(e: React.MouseEvent): void,
  changeHoverState(value: boolean): void,
}

class VarBlock extends React.PureComponent<VarBlockProps> {

  render() {
    const term = this.props.term
    const outerSideStyle = { backgroundColor: this.props.colors.borderColor }
    const innerSideStyle = { backgroundColor: this.props.colors.backgroundColor }

    const className = classNames(styles.var, 'no-text-select', {
      [styles.clickable]: !!this.props.onClick,
      [styles.shaking]: this.props.isShaking,
    })

    return (
      <div
        data-term
        className={ className }
        onClick={ this.props.onClick }
        onMouseOver={ this.didMouseOver.bind(this) }
        onMouseLeave={ this.didMouseLeave.bind(this) }
      >
        <div className={ styles.varInner }>
          <div
            className={ `${styles.varSide} ${styles.left}` }
            style={ outerSideStyle }
          >
            <div style={ innerSideStyle } />
          </div>
          <div
            className={ `${styles.varSide} ${styles.right}` }
            style={ outerSideStyle }
          >
            <div style={ innerSideStyle } />
          </div>
          <div className={ styles.varBack } style={ innerSideStyle } />
          <div
            className={ styles.varLabel }
            style={ { borderColor: this.props.colors.borderColor, color: this.props.colors.color } }
          >
            { this.props.term.label }
          </div>
        </div>
      </div>
    )
  }

  didMouseOver(e: React.MouseEvent) {
    this.props.changeHoverState(true)
    e.stopPropagation()
  }

  didMouseLeave(e: React.MouseEvent) {
    this.props.changeHoverState(false)
    e.stopPropagation()
  }

}

export default VarBlock
