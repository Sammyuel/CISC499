/*
 * HomeReducer
 *
 * The reducer takes care of our data. Using actions, we can
 * update our application state. To add a new action,
 * add it to the switch statement in the reducer function
 *
 */

import produce from 'immer';
import { CHANGE_USERNAME, CHANGE_DATA } from './constants';

// The initial state of the App

// const nodes = [{fx:200,fy:203.5},
//                           {fx:201,fy:203.5},
//                           {fx:201,fy:203},
//                           {fx:202,fy:203},
//                           {fx:202,fy: 202.5},
//                           {fx:203,fy:202.5},
//                           {fx:203,fy:202},
//                           {fx:205,fy:202},
//                           {fx:205,fy:200},
//                           {fx:205.5,fy:201.5},
//                           {fx:205.5,fy:203},
//                           {fx:206,fy:203},
//                           {fx:206,fy:204},
//                           {fx:206.25,fy:204},
//                           {fx:207,fy:204},
//                           {fx:206.25,fy:205},
//                           {fx:205,fy:205},
//                           {fx:205,fy:205.5},
//                           {fx:203.5,fy:205.5},
//                           {fx:203.5,fy:206},
//                           {fx:200,fy:206}]
const nodes = [{ fx: 200, fy: 203.5 }];
export const initialState = {
  username: '',
  graphData: {
    data: {
      points: [
        { id: 'a', fx: 5, fy: 5 },
        { id: 'b', fx: 6, fy: 4 },
        { id: 'c', fx: 7, fy: 3 },
        { id: 'd', fx: 11, fy: 9 },
        { id: 'e', fx: 10, fy: 10 },
      ],
      nodes: [
        { id: 'a', fx: 5, fy: 5 },
        { id: 'b', fx: 6, fy: 4 },
        { id: 'c', fx: 7, fy: 3 },
        { id: 'd', fx: 11, fy: 9 },
        { id: 'e', fx: 10, fy: 10 },

      ],
      links: [],
      answer: [],
      count: 0,
      numberOfPoints: 20,
      text: "Run Algorithm",
      answerShown: 0
    },
  },

};

/* eslint-disable default-case, no-param-reassign */
const homeReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case CHANGE_USERNAME:
        // Delete prefixed '@' from the github username
        draft.username = action.username.replace(/@/gi, '');
        break;
      case CHANGE_DATA:
        draft.graphData = action.graphData;
        draft.answer = action.answer;
        draft.answerShown = action.answerShown;
        break;
    }
  });

export default homeReducer;
