import { applyMiddleware, createStore } from 'redux'
import { createLogger } from 'redux-logger'

import reducers from './Reducers'
import { Program as _Program } from './Reducers/Program'
import throttler from './Utils/ReduxThrottler'

const mware = applyMiddleware(
  throttler,
  createLogger({ collapsed: true, diff: false }))

export type RootState = ReturnType<typeof reducers>
export type Program = _Program

export const store = createStore(reducers, mware)
