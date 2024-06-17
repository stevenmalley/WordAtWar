import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { userSlice } from './features/store/userSlice';
import { gameSlice } from './features/store/gameSlice';
import { boardSlice } from './features/store/boardSlice';
import { tileSlice } from './features/store/tileSlice';
import { mouseSlice } from './features/store/mouseSlice';
import { boardRenderedSlice } from './features/store/boardRenderedSlice';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

const store = configureStore({
  reducer: combineReducers({
    user:userSlice.reducer,
    game:gameSlice.reducer,
    board:boardSlice.reducer,
    tiles:tileSlice.reducer,
    mouse:mouseSlice.reducer,
    boardRendered:boardRenderedSlice.reducer
  })
});

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
