/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage component.
 */
import { defineMessages } from 'react-intl';

export const scope = 'boilerplate.components.Header';

export default defineMessages({
  home: {
    id: `${scope}.run`,
    defaultMessage: 'Run Algorithm',
  },
  features: {
    id: `${scope}.ran`,
    defaultMessage: 'Randomize Points (15)',
  },
});
