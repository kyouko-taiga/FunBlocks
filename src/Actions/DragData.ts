import { Action, PayloadAction } from 'FunBlocks/Actions/Types'

import { DragData } from 'FunBlocks/Reducers/DragData'

export const ACTION_TYPES = {
  CLEAR_DATA: 'DragData.clear',
  SET_DATA: 'DragData.start',
}

export const clearData = (): Action => ({ type: ACTION_TYPES.CLEAR_DATA })

export const setData = (type: string, payload?: StringDictionary): PayloadAction<DragData> => ({
  type: ACTION_TYPES.SET_DATA,
  payload: { type, payload },
})
