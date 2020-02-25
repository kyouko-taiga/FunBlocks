import React from 'react'
import { connect } from 'react-redux'

import { serialize } from 'FunBlocks/AST/Serializer'
import { RootState } from 'FunBlocks/UI/Store'
import MenuBarItem from './MenuBarItem'

const styles = require('./IDE.module')

type Props = {
  program: Program,
}

class DownloadButton extends React.PureComponent<Props> {

  private anchorRef = React.createRef<HTMLAnchorElement>()

  render() {
    return (
      <div className={ styles.menuBarItemWrapper }>
        <a ref={ this.anchorRef } style={ { display: 'none' } } />
        <MenuBarItem
          icon="download"
          label="Download"
          onClick={ this.didDownload.bind(this) }
        />
      </div>
    )
  }

  didDownload() {
    // Create a URL with the program's AST.
    const data = serialize(this.props.program)
    const blob = new Blob([data], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)

    // Simulate a click on the hidden anchor to initiate the download.
    const a = this.anchorRef.current
    a.href = url
    a.download = 'program.json'
    a.click()

    // Dispose of the created URL.
    window.URL.revokeObjectURL(url)
  }

}

const mapStateToProps = (state: RootState) => ({ program: state.program })
export default connect(mapStateToProps)(DownloadButton)
