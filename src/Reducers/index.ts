import { combineReducers } from 'redux'

import interpreter from './Interpreter'
import ruleSet from './RuleSet'

export default combineReducers({
  interpreter,
  ruleSet,
})
