import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import './Styles/Foundation.css'

// This import configures fontawesome.
import './Icons'

import IDE from './Components/IDE'
import { store } from './Store'

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
