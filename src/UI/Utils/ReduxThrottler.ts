import { Dispatch, Middleware, MiddlewareAPI } from 'redux'

const throttled: Dictionary<boolean> = {}

const throttler: Middleware = ({ getState }: MiddlewareAPI) => (next: Dispatch) => (action) => {
  const delay = action.meta && action.meta.throttlingDelay
  if (typeof delay !== 'number' || delay <= 0) {
    return next(action)
  }

  if (throttled[action.type]) {
    return
  }

  throttled[action.type] = true
  setTimeout(() => {
    throttled[action.type] = false
  }, delay);

  return next(action)
}

export default throttler
