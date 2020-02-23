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

export { selectHome, makeSelectUsername, makeSelectData, makeSelectAnswer, makeSelectAnswerShown };
