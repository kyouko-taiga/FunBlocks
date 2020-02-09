import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

// This import configures fontawesome.
import './Icons'

// // This imports the styles for react-grid-layout.
// import 'react-grid-layout/css/styles.css'
// import 'react-resizable/css/styles.css'
// import GridLayout from 'react-grid-layout'

import { Expression, Variable, Rule } from './AST/Terms'
import { EnumType } from './AST/Types'
import Workspace from './Components/Workspace'
import Color from './Utils/Color'
import { store } from './Store'

import { pushState } from './Actions/Interpreter'
import { insertRule } from './Actions/Program'

const planetType = new EnumType({
  name: 'Planet',
  cases: [
    new Expression({ label: 'earth' }),
    new Expression({ label: 'mars' })
  ],
})

const planetListType = new EnumType({ name: 'List' })
planetListType.cases = [
  new Expression({ label: 'empty' }),
  new Expression({
    label: 'cons',
    subterms: [
      new Variable({ label: 'head', type: planetType }),
      new Variable({ label: 'tail', type: planetListType }),
    ]
  })
]

const expr = new Expression({
  label: 'cons',
  subterms: [
    new Expression({ label: 'earth', type: planetType }),
    new Expression({
      label: 'cons',
      subterms: [
        new Variable({ label: 'x', type: planetType }),
        new Expression({ label: 'empty', type: planetListType }),
      ],
      type: planetListType,
    }),
  ],
  type: planetListType,
})

store.dispatch(pushState(expr))
store.dispatch(insertRule(new Rule({
  left: expr.subterms[1],
  right: (expr.subterms[1] as Expression).subterms[1],
})))

class View extends React.PureComponent {

  render() {
    return (
      <React.StrictMode>
        <Provider store={ store }>
          <Workspace />
        </Provider>
      </React.StrictMode>
    )
  }

}

render(<View />, document.getElementById('app'))
