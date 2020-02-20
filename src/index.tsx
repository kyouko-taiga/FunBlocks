import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import './UI/Styles/Foundation.css'

// This import configures fontawesome.
import './UI/Icons'

import IDE from './UI/Components/IDE'
import { store } from './UI/Store'

class View extends React.PureComponent {

  render() {
    return (
      <React.StrictMode>
        <Provider store={ store }>
          <IDE />
        </Provider>
      </React.StrictMode>
    )
  }

}

render(<View />, document.getElementById('app'))
