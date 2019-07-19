import React, { useRef, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

import SelectContext from './SelectContext';
import { setNativeValue } from './utils';

const NULL_VALUE = '__null__';
const OPTION_DISPLAY_NAME = 'Option';

const Select = ({ placeholder, value: rawValue, onChange, children }) => {
  const value = rawValue || NULL_VALUE;

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(null);

  const inputElement = useRef(null);
  const buttonElement = useRef(null);

  const childrenProps = useMemo(() => {
    return React.Children.toArray(children).reduce((acc, child) => {
      if (child.type.displayName === OPTION_DISPLAY_NAME) {
        return [...acc, child.props];
      }

      return acc;
    }, []);
  }, [children]);

  const activeLabel = useMemo(() => {
    const activeChild = childrenProps.find(
      childProps => (childProps.value || NULL_VALUE) === value
    ) || {};

    return activeChild.label || activeChild.value;
  }, [value]);

  const optionRefs = useMemo(() => {
    let refs = [];
    React.Children.forEach(children, child => {
      if (child.type.displayName === OPTION_DISPLAY_NAME) {
        refs = [...refs, React.createRef()];
      }
    });
    return refs;
  }, [children]);

  useEffect(() => {
    if (focused !== null) {
      optionRefs[focused].current.focus();
    }
  }, [focused]);

  const close = () => {
    setOpen(false);
    setFocused(null);
    buttonElement.current.focus();
  };

  const handleSelect = newValue => {
    if (newValue === NULL_VALUE) {
      setNativeValue(inputElement.current, null);
    } else {
      setNativeValue(inputElement.current, newValue);
    }

    inputElement.current.dispatchEvent(new Event('input', { bubbles: true }));

    close();
  };

  const onBlur = ({ currentTarget, relatedTarget }) => {
    if (!currentTarget.contains(relatedTarget)) {
      if (open) {
        close();
      }
    }
  };

  const handleKeyDown = event => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        setFocused(0);
        setOpen(true);
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

  const handleClick = () => {
    if (open) {
      close();
    } else {
      setOpen(true);
    }
  };

  const optionProps = {
    onSelect: handleSelect,
    focusNext: () =>
      setFocused(focused < optionRefs.length - 1 ? focused + 1 : 0),
    focusPrev: () =>
      setFocused(focused > 0 ? focused - 1 : optionRefs.length - 1),
    close,
  };

  const childrenWithRef = useMemo(() => {
    let index = -1;
    return React.Children.map(children, child => {
      if (child.type.displayName !== 'Option') {
        return child;
      }

      index += 1;
      return React.cloneElement(child, { ref: optionRefs[index] });
    });
  }, [optionRefs]);

  return (
    <SelectContext.Provider value={optionProps}>
      <div className="select" onBlur={onBlur}>
        <div
          className="select__button"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          ref={buttonElement}
          role="menu"
          tabIndex={0}
        >
          {activeLabel || placeholder}
        </div>
        <input
          onChange={onChange}
          ref={inputElement}
          style={{ display: 'none' }}
        />
        {open && <ul className="dropdown select__list">{childrenWithRef}</ul>}
      </div>
    </SelectContext.Provider>
  );
};

Select.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  children: PropTypes.node,
};

Select.defaultProps = {
  placeholder: null,
  value: NULL_VALUE,
  onChange: () => {},
  children: null,
};

export default Select;
