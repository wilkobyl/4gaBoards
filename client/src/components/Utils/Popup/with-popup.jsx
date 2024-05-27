import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useFloating, shift, flip, offset as posOffset, useClick, useInteractions, autoUpdate, useDismiss, useRole, FloatingFocusManager } from '@floating-ui/react';
import classNames from 'classnames';
import { Button, ButtonStyle } from '../Button';
import { Icon, IconType, IconSize } from '../Icon';

import styles from './Popup.module.css';

export default (WrappedComponent, defaultProps) => {
  const Popup = React.memo(({ children, className, showCloseButton, offset, position, onClose, ...props }) => {
    const [t] = useTranslation();
    const [isOpened, setIsOpened] = useState(false);

    const { refs, floatingStyles, context } = useFloating({
      open: isOpened,
      onOpenChange: setIsOpened,
      whileElementsMounted: autoUpdate,
      placement: position,
      middleware: [
        posOffset(offset),
        flip({
          fallbackAxisSideDirection: 'start',
        }),
        shift({ padding: 20 }),
      ],
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: 'dialog' });

    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

    const handleClose = useCallback(() => {
      setIsOpened(false);

      if (onClose) {
        onClose();
      }
    }, [onClose]);

    return (
      <>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <div ref={refs.setReference} {...getReferenceProps()}>
          {children}
        </div>
        {isOpened && (
          <FloatingFocusManager context={context} modal={false}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <div className={classNames(styles.wrapper, className)} ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} {...defaultProps}>
              {showCloseButton && (
                <Button style={ButtonStyle.Icon} title={t('common.close')} onClick={handleClose} className={styles.closeButton}>
                  <Icon type={IconType.Close} size={IconSize.Size14} />
                </Button>
              )}
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <WrappedComponent {...props} onClose={handleClose} />
            </div>
          </FloatingFocusManager>
        )}
      </>
    );
  });

  Popup.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    showCloseButton: PropTypes.bool,
    offset: PropTypes.number,
    position: PropTypes.string,
    onClose: PropTypes.func,
  };

  Popup.defaultProps = {
    className: undefined,
    showCloseButton: false,
    offset: 10,
    position: 'bottom-start',
    onClose: undefined,
  };

  return Popup;
};