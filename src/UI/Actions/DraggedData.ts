/// - Note:
/// From https://www.w3schools.com/jsref/event_ondragend.asp
///
///     There are many events that are used, and can occur, in the different stages of a drag and
///     drop operation:
///     - Events fired on the draggable target (the source element):
///       * ondragstart - occurs when the user starts to drag an element
///       * ondrag - occurs when an element is being dragged
///       * ondragend - occurs when the user has finished dragging the element
///     - Events fired on the drop target:
///       * ondragenter - occurs when the dragged element enters the drop target
///       * ondragover - occurs when the dragged element is over the drop target
///       * ondragleave - occurs when the dragged element leaves the drop target
///       * ondrop - occurs when the dragged element is dropped on the drop target

import { DraggedData } from 'FunBlocks/UI/Reducers/DraggedData'

export const ACTION_TYPES = {
  CLEAR_DATA: 'DraggedData.clear',
  SET_DATA: 'DraggedData.start',
}

/// Clears all data in the drag data store.
///
/// - Note:
/// According to the drag-n-drop specification model, `dragend` occurs **after** the `drop`. Thus,
/// it should be safe to clear the drag data on the `dragend` handler of the element from which
/// dragging originates.
export const clearData = (): Action => ({ type: ACTION_TYPES.CLEAR_DATA })

/// Writes new data to the drag data store.
export const setData = (
  type: string,
  payload?: any,
  callbacks?: Dictionary<Function>
): PayloadAction<DraggedData> => ({
  type: ACTION_TYPES.SET_DATA,
  payload: { type, payload, callbacks },
})
