import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { userSlice } from './features/components/userSlice';
import { gameSlice } from './features/components/gameSlice';
import { boardSlice } from './features/components/boardSlice';
import { tileSlice } from './features/components/tileSlice';
import { blanksSlice } from './features/components/blanksSlice';
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
    blanks:blanksSlice.reducer
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
