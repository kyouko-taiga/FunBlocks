import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { setData, clearData } from 'FunBlocks/UI/Actions/DraggedData'
import { DraggedData } from 'FunBlocks/UI/Reducers/DraggedData'

const styles = require('./Workspace.module')

type Props = {
  label: string,
  colspan?: number,
  children?: React.ReactNode,
  draggedData: DraggedData | (() => DraggedData),
  setDraggedData(type: string, payload?: Dictionary): void,
  clearDraggedData(): void,
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

    return (
      <div className={ className }>
        <div
          draggable
          className={ styles.btnIcon }
          onDragStart={ this.didDragStart.bind(this) }
          onDragEnd={ this.props.clearDraggedData }
        >
          { this.props.children }
        </div>
        <span>{ this.props.label }</span>
      </div>
    )
  }

  didDragStart(e: React.DragEvent<HTMLDivElement>) {
    const data = this.props.draggedData instanceof Function
      ? this.props.draggedData()
      : this.props.draggedData
    this.props.setDraggedData(data.type, data.payload)
  }

}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setDraggedData: (type: string, payload?: Dictionary) => dispatch(setData(type, payload)),
  clearDraggedData: () => dispatch(clearData()),
})

export default connect(null, mapDispatchToProps)(ToolButton)
