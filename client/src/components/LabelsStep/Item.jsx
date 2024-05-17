import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { Icon, IconType, IconSize } from '../Utils/Icon';
import { ButtonTmp, ButtonStyle } from '../Utils/Button';

import styles from './Item.module.scss';
import globalStyles from '../../styles.module.scss';

const Item = React.memo(({ id, index, name, color, isPersisted, isActive, canEdit, onSelect, onDeselect, onEdit }) => {
  const [t] = useTranslation();

  const handleToggleClick = useCallback(() => {
    if (isPersisted) {
      if (isActive) {
        onDeselect();
      } else {
        onSelect();
      }
    }
  }, [isPersisted, isActive, onSelect, onDeselect]);

  return (
    <Draggable draggableId={id} index={index} isDragDisabled={!isPersisted || !canEdit}>
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
        const contentNode = (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...draggableProps} ref={innerRef} className={styles.wrapper}>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <span
              {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
              className={classNames(styles.name, isActive && styles.nameActive, globalStyles[`background${upperFirst(camelCase(color))}`])}
              onClick={handleToggleClick}
            >
              {name}
            </span>
            {canEdit && (
              <ButtonTmp style={ButtonStyle.Icon} title={t('common.editLabel')} onClick={onEdit} disabled={!isPersisted} className={styles.editButton}>
                <Icon type={IconType.Pencil} size={IconSize.Size14} />
              </ButtonTmp>
            )}
          </div>
        );

        return isDragging ? ReactDOM.createPortal(contentNode, document.body) : contentNode;
      }}
    </Draggable>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string,
  color: PropTypes.string.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

Item.defaultProps = {
  name: undefined,
};

export default Item;
