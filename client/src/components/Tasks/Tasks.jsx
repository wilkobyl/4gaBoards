import React, { useCallback, useRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import { useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, ProgressBar, ProgressBarSize, Icon, IconType, IconSize } from '../Utils';

import DroppableTypes from '../../constants/DroppableTypes';
import Item from './Item';
import TaskAdd from './TaskAdd';

import styles from './Tasks.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
};

const Tasks = React.forwardRef(
  ({ variant, isCardActive, cardId, items, canEdit, boardMemberships, onCreate, onUpdate, onMove, onDelete, onUserAdd, onUserRemove, onMouseEnterTasks, onMouseLeaveTasks }, ref) => {
    const [t] = useTranslation();
    const taskAddRef = useRef(null);
    const [isOpen, toggleOpen] = useToggle();

    const handleToggleClick = useCallback(
      (event) => {
        event.stopPropagation();
        toggleOpen();
      },
      [toggleOpen],
    );

    const openTaskAdd = useCallback(() => {
      if (taskAddRef.current) {
        taskAddRef.current.open();
      }
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        openTaskAdd,
      }),
      [openTaskAdd],
    );

    const handleDragEnd = useCallback(
      ({ draggableId, source, destination }) => {
        if (!destination || source.index === destination.index) {
          return;
        }
        onMove(draggableId, destination.index);
      },
      [onMove],
    );

    const handleUpdate = useCallback(
      (id, data) => {
        onUpdate(id, data);
      },
      [onUpdate],
    );

    const handleDelete = useCallback(
      (id) => {
        onDelete(id);
      },
      [onDelete],
    );

    const handleUserAdd = useCallback(
      (taskId, userId) => {
        onUserAdd(userId, taskId, cardId);
      },
      [cardId, onUserAdd],
    );

    const handleUserRemove = useCallback(
      (taskId, userId) => {
        onUserRemove(userId, taskId);
      },
      [onUserRemove],
    );

    const completedItems = items.filter((item) => item.isCompleted);

    const tasksNode = (
      <Droppable droppableId="tasks" type={DroppableTypes.TASK}>
        {({ innerRef, droppableProps, placeholder }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...droppableProps} ref={innerRef} onMouseEnter={onMouseEnterTasks} onMouseLeave={onMouseLeaveTasks} data-prevent-card-switch>
            {items.map((item, index) => (
              <Item
                variant={variant}
                key={item.id}
                id={item.id}
                index={index}
                name={item.name}
                dueDate={item.dueDate}
                boardMemberships={boardMemberships}
                users={item.users}
                isCompleted={item.isCompleted}
                isPersisted={item.isPersisted}
                canEdit={canEdit}
                onUpdate={(data) => handleUpdate(item.id, data)}
                onDelete={() => handleDelete(item.id)}
                onUserAdd={(userId) => handleUserAdd(item.id, userId)}
                onUserRemove={(userId) => handleUserRemove(item.id, userId)}
              />
            ))}
            {placeholder}
            {canEdit && (
              <TaskAdd ref={taskAddRef} onCreate={onCreate}>
                <Button
                  style={ButtonStyle.Default}
                  content={t('common.addTask')}
                  className={classNames(styles.taskButton, variant === VARIANTS.CARD && styles.taskButtonCard, isCardActive && variant === VARIANTS.CARD && styles.taskButtonCardActive)}
                />
              </TaskAdd>
            )}
          </div>
        )}
      </Droppable>
    );

    return (
      <div className={styles.wrapper}>
        {items.length > 0 && (
          <div className={classNames(styles.progressWrapper, isOpen && styles.progressWrapperOpen)}>
            <ProgressBar value={completedItems.length} total={items.length} size={ProgressBarSize.Tiny} className={classNames(variant === VARIANTS.CARD ? styles.progressCard : styles.progress)} />
            {variant === VARIANTS.CARD && (
              <Button style={ButtonStyle.Icon} title={isOpen ? t('common.hideTasks') : t('common.showTasks')} onClick={handleToggleClick} className={styles.toggleTasksButton}>
                {completedItems.length}/{items.length}
                <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={classNames(styles.countToggleIcon, isOpen && styles.countToggleIconOpened)} />
              </Button>
            )}
          </div>
        )}
        {variant === VARIANTS.CARDMODAL && <DragDropContext onDragEnd={handleDragEnd}>{tasksNode}</DragDropContext>}
        {variant === VARIANTS.CARD && isOpen && tasksNode}
      </div>
    );
  },
);

Tasks.propTypes = {
  variant: PropTypes.oneOf(Object.values(VARIANTS)).isRequired,
  isCardActive: PropTypes.bool,
  cardId: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onMouseEnterTasks: PropTypes.func,
  onMouseLeaveTasks: PropTypes.func,
};

Tasks.defaultProps = {
  isCardActive: false,
  onMouseEnterTasks: () => {},
  onMouseLeaveTasks: () => {},
};

export default Tasks;
