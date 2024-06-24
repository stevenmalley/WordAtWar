import { createSlice } from '@reduxjs/toolkit';

export const boardRenderedSlice = createSlice({
  name: 'boardRendered',
  initialState: false,
  reducers: {
    setBoardRendered:(board,action) => true
  },
});

export const selectBoardRendered = (state) => state.boardRendered;

export const setBoardRendered = () => {
  return (dispatch, getState) => {
    dispatch({type: 'boardRendered/setBoardRendered', payload: true});
  }
};