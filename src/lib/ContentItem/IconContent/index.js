import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@collab-ui/react';

const IconContent = props => {
  const {
    actionNode,
    className,
    icon,
    isProtected,
    loading,
    onClick,
    subtitle,
    title,
    ...otherProps
  } = props;

  return (
    <div>
      <div
        className={
          'cui-content-file' + `${(className && ` ${className}`) || ''}` +
          `${(onClick && ' cui-content-file--clickable') || ''}`
        }
        onClick={onClick}
        onKeyDown={onClick}
        role='presentation'
        {...otherProps}
      >
        {
          !isProtected && actionNode &&
          <div className="cui-content-file__icon">
            {actionNode}
          </div>
        }
        <span>
          <Icon name={icon} />
        </span>
      </div>
      <div className="cui-content-file__info-container">
        <span className="cui-content-file__title">
          {loading ? 'Loading' : title}
        </span>
        <span className="cui-content-file__subtitle"> {subtitle} </span>
      </div>
    </div>
  );
};

IconContent.defaultProps = {
  actionNode: null,
  className: '',
  icon: '',
  isProtected: null,
  loading: false,
  onClick: null,
  subtitle: '',
  title: '',
};

IconContent.propTypes = {
  actionNode: PropTypes.node,
  className: PropTypes.string,
  icon: PropTypes.string,
  isProtected: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  subtitle: PropTypes.string,
  title: PropTypes.string,
};

IconContent.displayName = 'IconContent';

export default IconContent;
