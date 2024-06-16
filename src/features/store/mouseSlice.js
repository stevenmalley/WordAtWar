import { createSlice } from '@reduxjs/toolkit';


/**
 * 
 * Mouse coordinates, used when dragging the selected tile
 * 
 */

export const mouseSlice = createSlice({
  name: 'mouse',
  initialState: {coords:null,boardSpace:null,displacement:7},
  reducers: {
    setMouseCoords:(mouse,action) => {mouse.coords = action.payload},
    setHoveredBoardSpace:(mouse,action) => {mouse.boardSpace = action.payload},
    setDisplacedPlayerTile:(mouse,action) => {mouse.displacement = action.payload}
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(incrementAsync.pending, (state) => {
  //       state.status = 'loading';
  //     })
  //     .addCase(incrementAsync.fulfilled, (state, action) => {
  //       state.status = 'idle';
  //       state.value += action.payload;
  //     });
  // },
});




export const selectMouse = (state) => state.mouse;



export const setMouseCoords = (x,y) => {
  return (dispatch, getState) => {
    dispatch({type: 'mouse/setMouseCoords', payload: {x,y}});
  }
}

export const setHoveredBoardSpace = (coord) => {
  return (dispatch, getState) => {
    dispatch({type: 'mouse/setHoveredBoardSpace', payload: coord});
  }
}

export const setDisplacedPlayerTile = (position) => {
  return (dispatch, getState) => {
    dispatch({type: 'mouse/setDisplacedPlayerTile', payload: position});
  }
}