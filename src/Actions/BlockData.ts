import { PayloadAction } from 'FunBlocks/Actions/Types'

export const ACTION_TYPES = {
  CLEAR_BLOCKDATA       : 'BlockData.clear',
  UPDATE_BLOCKDATA      : 'BlockData.update',
}

export const clearBlockData = (key: string): PayloadAction<string> => ({
  type: ACTION_TYPES.CLEAR_BLOCKDATA,
  payload: key,
})

export const updateBlockData = (
  key: string,
  data: { [key: string]: any }
): PayloadAction<{ key: string, data: { [key: string]: any } }> => ({
  type: ACTION_TYPES.UPDATE_BLOCKDATA,
  payload: { key, data },
})
