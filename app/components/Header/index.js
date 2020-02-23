import React from 'react';
import { FormattedMessage } from 'react-intl';

import A from './A';
import Img from './Img';
import NavBar from './NavBar';
import HeaderLink from './HeaderLink';
import Banner from './Banner.png';
import messages from './messages';

function Header() {
  return (
    <div>
      <A href="http://www.eurocg2019.uu.nl/papers/17.pdf">
        <Img src={Banner} alt="react-boilerplate - Logo" />
      </A>

    </div>
  );
}

export default Header;
