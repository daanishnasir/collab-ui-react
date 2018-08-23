/**
* @category containers
* @component list-item
* @variations collab-ui-react
*/

import React from 'react';
import PropTypes from 'prop-types';

const ListItemSection = props => {
    const {
      children,
      className,
      position,
    } = props;

  return (
    <div
      className={
        ` cui-list-item__${position}` +
        `${(className && ` ${className}`) || ''}`
      }
    >
      {children}
    </div>
  );
};

ListItemSection.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  includeDate: PropTypes.bool,
  position: PropTypes.oneOf(['left', 'center', 'right', 'center-align']),
};

ListItemSection.defaultProps = {
  children: null,
  className: '',
  position: 'center',
};

ListItemSection.displayName = 'ListItemSection';

export default ListItemSection;