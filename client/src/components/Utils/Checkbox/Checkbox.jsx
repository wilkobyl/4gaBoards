import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CheckboxSize from './CheckboxSize';

import * as s from './Checkbox.module.scss';

const Checkbox = React.forwardRef(({ size, className, isError, ...props }, ref) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <input type="checkbox" ref={ref} className={classNames(s.checkbox, s[size], className, isError && s.checkboxError)} {...props} />
  );
});

Checkbox.propTypes = {
  size: PropTypes.oneOf(Object.values(CheckboxSize)),
  className: PropTypes.string,
  isError: PropTypes.bool,
};

Checkbox.defaultProps = {
  size: CheckboxSize.Size20,
  className: undefined,
  isError: false,
};

export default React.memo(Checkbox);
