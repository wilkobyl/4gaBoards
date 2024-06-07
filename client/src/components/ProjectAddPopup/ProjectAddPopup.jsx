import React, { useCallback, useEffect, useRef, useState, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Input, Form, Icon, IconType, IconSize } from '../Utils';
import { useForm2 } from '../../hooks';

import styles from './ProjectAddPopup.module.scss';
import gStyles from '../../globalStyles.module.scss';

const ProjectAddPopup = React.forwardRef(({ children, defaultData, isSubmitting, onCreate }, ref) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const nameField = useRef(null);

  const [data, handleFieldChange, setData] = useForm2(null);

  const open = useCallback(() => {
    setIsOpened(true);
    setData(defaultData);
  }, [defaultData, setData]);

  const close = useCallback(() => {
    setIsOpened(false);
    setData(null);
  }, [setData]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current.select();
      return;
    }

    onCreate(cleanData);
  }, [onCreate, data]);

  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          handleSubmit();
          break;
        case 'Escape':
          close();
          break;
        default:
      }
    },
    [close, handleSubmit],
  );

  useEffect(() => {
    if (isOpened) {
      nameField.current?.focus();
    }
  }, [isOpened]);

  if (!isOpened) {
    return children;
  }

  return (
    <div className={styles.card}>
      <div className={styles.titleWrapper}>
        <Button style={ButtonStyle.Icon} title={t('common.close')} onClick={close} className={styles.closeButton}>
          <Icon type={IconType.Close} size={IconSize.Size14} />
        </Button>
        <div className={styles.title}>{t('common.createProject', { context: 'title' })}</div>
      </div>
      <Form onSubmit={handleSubmit} className={styles.formWrapper} onKeyDown={handleKeyDown}>
        <Input ref={nameField} name="name" value={data.name} readOnly={isSubmitting} className={styles.field} onChange={handleFieldChange} />
        <div className={gStyles.controls}>
          <Button style={ButtonStyle.Submit} content={t('action.createProject')} disabled={isSubmitting} />
        </div>
      </Form>
    </div>
  );
});

ProjectAddPopup.propTypes = {
  children: PropTypes.node.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default React.memo(ProjectAddPopup);
