import { createStore, applyMiddleware } from 'redux'
import { createLogger } from 'redux-logger'

import reducers from './Reducers'

const mware = applyMiddleware(
  createLogger({ collapsed: true, diff: false }))

export type RootState = ReturnType<typeof reducers>

export const store = createStore(reducers, mware)
