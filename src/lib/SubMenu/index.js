import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import {
  EventOverlay,
  Icon, 
  ListItem,
} from '@collab-ui/react/';

class SubMenu extends React.Component {
  static displayName = 'SubMenu';

  state = {
    anchorRef: null,
  };

  componentDidMount() {
    const { children } = this.props;
    if (!children) {
      throw new Error(`[@collab-ui/react] SubMenu: children are required for this component.`);
    } else if (!this.verifyChildrenElements(['MenuItem', 'SubMenu'])) {
      throw new Error(`[@collab-ui/react] SubMenu: children must be SubMenu or MenuItem`);
    }
  }

  verifyChildrenElements = nameArr => {
    const { children } = this.props;
    let elementCount = 0;
    let childrenLength = 0;

    React.Children.forEach(children, child => {
      childrenLength++;
      if (child.type && nameArr.includes(child.type.displayName)) {
        return elementCount++;
      }
    });

    return elementCount === childrenLength;
  };

  handleKeyDown = e => {
    const { onClick, index } = this.props;
    const { handleKeyDown, handleClick } = this.context;
    if (
      e.which === 32
      || e.which === 13
      || e.charCode === 32
      || e.charCode === 13
    ) {
      onClick && onClick(e);
      handleClick && handleClick(e, index, this);
      e.preventDefault();
    } else {
      handleKeyDown && handleKeyDown(e, index, this);
    }
  };

  handleClick = e => {
    const { handleClick } = this.context;
    const { index, onClick } = this.props;

    onClick && onClick(e);
    handleClick && handleClick(e, index, this);
  };

  render () {
    const {
      children,
      className,
      content,
      customNode,
      isHeader,
      isOpen,
      label,
      selectedValue,
      ...props
    } = this.props;

    const otherProps = omit({...props}, [
      'customNode',
      'index',
      'keepMenuOpen',
      'onClick',
    ]);

    return (
      <div
        className={
          'cui-menu-item' +
          `${(className && ` ${className}`) || ''}`
        }
        aria-expanded={isOpen}
        aria-haspopup={!!children}
      >
        <ListItem
          active={isOpen}
          focusOnLoad
          isReadOnly={isHeader}
          onClick={this.handleClick}
          onKeyDown={this.handleKeyDown}
          ref={ref => !this.state.anchorRef && this.setState({anchorRef: ref})}
          role='menuitem'
          {...otherProps}
        >
          {
            customNode 
              ? customNode
              : ([
                <div className='cui-menu-item__content' key='content-0'>
                  { content || label }
                </div>,
                <div className='cui-menu-item__selected-value' title={selectedValue} key='content-1'>
                  {children && selectedValue}
                </div>,
                <div className='cui-menu-item__arrow' key='content-2'>
                  {children && <Icon name='arrow-right_16'/>}
                </div>
              ])
          }
        </ListItem>
        {
          isOpen &&
          <EventOverlay
            anchorNode={this.state.anchorRef}
            isOpen={isOpen}
            direction='right-top'
            closeOnClick={false}
          >
            <div
              aria-label={label}
              role='menu'
              className='cui-menu-item-container'
            >
              {children}
            </div>
          </EventOverlay>
        }
      </div>
    );
  }
}

SubMenu.contextTypes = {
  handleClick: PropTypes.func,
  handleKeyDown: PropTypes.func,
};

SubMenu.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  content: PropTypes.element,
  customNode: PropTypes.node, 
  index: PropTypes.array,
  isHeader: PropTypes.bool,
  isOpen: PropTypes.bool,
  keepMenuOpen: PropTypes.bool,
  label: PropTypes.string,
  onClick: PropTypes.func,
  selectedValue: PropTypes.string,
};

SubMenu.defaultProps = {
  children: null,
  className: '',
  content: null,
  customNode: null,
  isHeader: false,
  isOpen: false,
  keepMenuOpen: false,
  label: '',
  onClick: null,
  selectedValue: '',
};

export default SubMenu;