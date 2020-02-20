import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { deserialize } from 'FunBlocks/AST/Serializer'
import { updateProgram } from 'FunBlocks/UI/Actions/IDE'
import { RootState } from 'FunBlocks/UI/Store'
import MenuBarItem from './MenuBarItem'

const styles = require('./IDE.module')

type Props = {
  updateProgram(program: Program): void,
}

class UploadButton extends React.PureComponent<Props> {

  private inputRef = React.createRef<HTMLInputElement>()

  render() {
    return (
      <div className={ styles.menuBarItemWrapper }>
        <input
          ref={ this.inputRef }
          type="file"
          accept=".json"
          style={ { display: 'none' } }
          onChange={ this.didUpload.bind(this) }
        />
        <MenuBarItem
          icon="upload"
          label="Upload"
          onClick={ () => this.inputRef.current.click() }
        />
      </div>
    )
  }

  didUpload(e: React.ChangeEvent<HTMLInputElement>) {
    // Ignore the event if no file was selected.
    const files = e.target.files
    if (files.length == 0) { return }
    e.persist()

    // Ignore files after the first one.
    for (let i = 1; i < files.length; ++i) {
      console.warn(`ignoring file ${files[i].name}`)
    }

    // Read the file's content.
    const reader = new FileReader()
    reader.onload = (event) => {
      const program = deserialize(event.target.result as string)
      this.props.updateProgram(program)
      e.target.value = ''
    }

    reader.readAsText(files[0])
  }

}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateProgram: (program: Program) => dispatch(updateProgram(program))
})

export default connect(null, mapDispatchToProps)(UploadButton)
