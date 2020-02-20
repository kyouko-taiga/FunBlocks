import React from 'react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

import { Button, UITheme } from 'FunBlocks/UI/Components/UILibrary'

const styles = require('./IDE.module')

type Props = {
  icon: IconProp,
  label: string,
  pressed?: boolean,
  onClick(e: React.MouseEvent | React.TouchEvent): void
}

class MenuBarItem extends React.PureComponent<Props> {

  render() {
    const { label, ...rest } = this.props
    return (
      <div className={ styles.menuBarItem }>
        <Button theme={ UITheme.Dark } { ...rest } />
        <span>{ label }</span>
      </div>
    )
  }

}

export default MenuBarItem
