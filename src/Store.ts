import { applyMiddleware, createStore } from 'redux'
import { createLogger } from 'redux-logger'

import reducers from './Reducers'
import throttler from './Utils/ReduxThrottler'

const mware = applyMiddleware(
  throttler,
  createLogger({ collapsed: true, diff: false }))

export type RootState = ReturnType<typeof reducers>

export const store = createStore(reducers, mware)
