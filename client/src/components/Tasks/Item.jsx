import React, { useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Icon, IconType, IconSize, Checkbox, CheckboxSize } from '../Utils';
import DueDateEditPopup from '../DueDateEditPopup';
import DueDate from '../DueDate';
import User from '../User';
import MembershipsPopup from '../MembershipsPopup';

import TaskEdit from './TaskEdit';
import ActionsPopup from './ActionsPopup';

import styles from './Item.module.scss';
import gStyles from '../../globalStyles.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
};

const Item = React.memo(({ variant, id, index, name, dueDate, boardMemberships, users, isCompleted, isPersisted, canEdit, onUpdate, onDelete, onUserAdd, onUserRemove }) => {
  const [t] = useTranslation();
  const nameEdit = useRef(null);

  const handleClick = useCallback(() => {
    if (isPersisted && canEdit) {
      nameEdit.current.open();
    }
  }, [isPersisted, canEdit]);

  const handleNameUpdate = useCallback(
    (newName) => {
      onUpdate({
        name: newName,
      });
    },
    [onUpdate],
  );

  const handleToggleChange = useCallback(() => {
    setTimeout(() => {
      onUpdate({
        isCompleted: !isCompleted,
      });
    }, 0);
    // TODO this timeout fixes slow task checkbox updates, but not in development
  }, [isCompleted, onUpdate]);

  const handleNameEdit = useCallback(() => {
    nameEdit.current.open();
  }, []);

  const handleDueDateUpdate = useCallback(
    (newDueDate) => {
      onUpdate({
        dueDate: newDueDate,
      });
    },
    [onUpdate],
  );

  const visibleMembersCount = variant === VARIANTS.CARD ? 1 : 3;
  const dueDateVariant = variant === VARIANTS.CARD ? 'tasksCard' : 'cardModal';

  const membersNode = (
    <div className={classNames(styles.members, gStyles.cursorPointer, isCompleted && styles.itemCompleted)}>
      {users.slice(0, visibleMembersCount).map((user) => (
        <span key={user.id} className={styles.member}>
          <User name={user.name} avatarUrl={user.avatarUrl} size={variant === VARIANTS.CARD ? 'cardTasks' : 'card'} />
        </span>
      ))}
      {users.length > visibleMembersCount && (
        <span
          className={classNames(styles.moreMembers, variant === VARIANTS.CARD && styles.moreMembersCard)}
          title={users
            .slice(3)
            .map((user) => user.name)
            .join(',\n')}
        >
          +{users.length - visibleMembersCount}
        </span>
      )}
    </div>
  );

  return (
    <Draggable draggableId={id} index={index} isDragDisabled={!isPersisted || !canEdit}>
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
        const contentNode = (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...draggableProps} {...dragHandleProps} ref={innerRef} className={classNames(styles.wrapper, gStyles.scrollableX, canEdit && styles.contentHoverable)}>
            <Checkbox
              checked={isCompleted}
              size={variant === VARIANTS.CARD ? CheckboxSize.Size14 : CheckboxSize.Size20}
              disabled={!isPersisted || !canEdit}
              className={styles.checkbox}
              onChange={handleToggleChange}
            />
            <TaskEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <span className={classNames(styles.task, isCompleted && styles.taskCompleted, canEdit && styles.taskEditable)} onClick={handleClick} title={name}>
                {name}
              </span>
              {users &&
                (isPersisted && canEdit ? (
                  <MembershipsPopup items={boardMemberships} currentUserIds={users.map((user) => user.id)} onUserSelect={onUserAdd} onUserDeselect={onUserRemove} offset={0} position="left-start">
                    {membersNode}
                  </MembershipsPopup>
                ) : (
                  membersNode
                ))}
              {dueDate && (
                <div className={classNames(styles.dueDate, gStyles.cursorPointer, isCompleted && styles.itemCompleted, variant === VARIANTS.CARD && styles.dueDateCard)}>
                  {isPersisted && canEdit ? (
                    <DueDateEditPopup defaultValue={dueDate} onUpdate={handleDueDateUpdate}>
                      <DueDate variant={dueDateVariant} value={dueDate} />
                    </DueDateEditPopup>
                  ) : (
                    <DueDate variant={dueDateVariant} value={dueDate} />
                  )}
                </div>
              )}
              {isPersisted && canEdit && (
                <ActionsPopup
                  dueDate={dueDate}
                  boardMemberships={boardMemberships}
                  users={users}
                  onUpdate={handleDueDateUpdate}
                  onNameEdit={handleNameEdit}
                  onDelete={onDelete}
                  onUserAdd={onUserAdd}
                  onUserRemove={onUserRemove}
                  hideCloseButton
                  position="left-start"
                  offset={0}
                >
                  <Button style={ButtonStyle.Icon} title={t('common.editTask')} className={classNames(styles.button, styles.target, variant === VARIANTS.CARD && styles.buttonCard)}>
                    <Icon type={IconType.EllipsisVertical} size={IconSize.Size10} className={styles.icon} />
                  </Button>
                </ActionsPopup>
              )}
            </TaskEdit>
          </div>
        );

        return isDragging ? ReactDOM.createPortal(contentNode, document.body) : contentNode;
      }}
    </Draggable>
  );
});

Item.propTypes = {
  variant: PropTypes.oneOf(Object.values(VARIANTS)).isRequired,
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  dueDate: PropTypes.instanceOf(Date),
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isCompleted: PropTypes.bool.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
};

Item.defaultProps = {
  dueDate: undefined,
};

export default Item;
