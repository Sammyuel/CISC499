/**
 * Homepage selectors
 */

import { createSelector } from 'reselect';
import { initialState } from './reducer';

const selectHome = state => state.home || initialState;

const makeSelectUsername = () =>
  createSelector(
    selectHome,
    homeState => homeState.username,
  );

const makeSelectData = () =>
  createSelector(
    selectHome,
    homeState => homeState.graphData,
  );

const makeSelectAnswer = () =>
  createSelector(
    selectHome,
    homeState => homeState.answer,
  );

const makeSelectAnswerShown = () =>
createSelector(
  selectHome,
  homeState => homeState.anserShown);

const makeSelectTableT = () => 
createSelector(
  selectHome, 
  homeState => homeState.T);

const makeSelectTableU = () => 
createSelector(
  selectHome,
  homeState => homeState.U);

const makeSelectTableC = () => 
createSelector(
  selectHome,
  homeState => homeState.C);

export { selectHome, makeSelectUsername, makeSelectData, makeSelectAnswer, makeSelectAnswerShown, makeSelectTableT,makeSelectTableU, makeSelectTableC };
