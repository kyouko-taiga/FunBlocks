import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { setData, clearData } from 'FunBlocks/Actions/DragData'

const styles = require('./Workspace.module')

type Props = {
  label: string,
  kind: string,
  colspan?: number,
  children?: React.ReactNode,
  setDragData(type: string, payload?: StringDictionary): void,
  clearDragData(): void,
}

class ToolButton extends React.PureComponent<Props> {

  static defaultProps = {
    colspan: 1,
  }

  render() {
    const className = classNames(
      styles.btn,
      styles['colspan' + this.props.colspan],
      'no-text-select')

    // Note that according to the drag-n-drop specification model, `dragend` event occurs **after**
    // the drop event. Hence it should be safe to clear the drag data on `dragend` here.
    return (
      <div className={ className }>
        <div
          draggable
          className={ styles.btnIcon }
          onDragStart={ this.didDragStart.bind(this) }
          onDragEnd={ this.props.clearDragData }
        >
          { this.props.children }
        </div>
        <span>{ this.props.label }</span>
      </div>
    )
  }

  didDragStart(e: React.DragEvent<HTMLDivElement>) {
    this.props.setDragData('toolButton', { kind: this.props.kind })
  }

}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setDragData: (type: string, payload?: StringDictionary) => dispatch(setData(type, payload)),
  clearDragData: () => dispatch(clearData()),
})

export default connect(null, mapDispatchToProps)(ToolButton)
