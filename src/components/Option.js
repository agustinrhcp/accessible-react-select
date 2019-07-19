import React, { forwardRef, useContext } from 'react';
import PropTypes from 'prop-types';

import SelectContext from './SelectContext';

const Option = forwardRef(({ value, label, ...rest }, ref) => {
  const { onSelect, focusNext, focusPrev, close } = useContext(SelectContext);

  const handleSelect = event => {
    event.preventDefault();
    onSelect(value);
  };

  const handleKeyDown = event => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        event.stopPropagation();
        ref.current.click();
        break;
      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        focusNext();
        break;
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        focusPrev();
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        close();
        break;
      default:
        break;
    }
  };

  return (
    <li
      tabIndex={-1}
      onClick={handleSelect}
      role="menuitem"
      onKeyDown={handleKeyDown}
      ref={ref}
      {...rest}
    >
      {label || value}
    </li>
  );
});

Option.propTypes = {
  value: PropTypes.string,
  label: PropTypes.string,
};

Option.defaultProps = {
  value: '__null__',
  label: null,
};

Option.displayName = 'Option';

export default Option;
