import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import User from '../User';
import Label from '../Label';
import BoardMembershipsPopup from '../BoardMembershipsPopup';
import LabelsPopup from '../LabelsPopup';
import { Button } from '../Utils/Button';

import styles from './Filters.module.scss';

const Filters = React.memo(
  ({ users, labels, allBoardMemberships, allLabels, canEdit, onUserAdd, onUserRemove, onLabelAdd, onLabelRemove, onLabelCreate, onLabelUpdate, onLabelMove, onLabelDelete }) => {
    const [t] = useTranslation();

    const handleRemoveUserClick = useCallback(
      (id) => {
        onUserRemove(id);
      },
      [onUserRemove],
    );

    const handleRemoveLabelClick = useCallback(
      (id) => {
        onLabelRemove(id);
      },
      [onLabelRemove],
    );

    return (
      <>
        <span className={styles.filter}>
          <BoardMembershipsPopup
            items={allBoardMemberships}
            currentUserIds={users.map((user) => user.id)}
            title={t('common.filterByMembers', { context: 'title' })}
            onUserSelect={onUserAdd}
            onUserDeselect={onUserRemove}
            offset={16}
          >
            <Button title={t('common.filterByMembers', { context: 'title' })} className={styles.filterButton}>
              <span className={styles.filterTitle}>{`${t('common.members')}:`}</span>
              {users.length === 0 && <span className={styles.filterLabel}>{t('common.all')}</span>}
            </Button>
          </BoardMembershipsPopup>
          {users.map((user) => (
            <span key={user.id} className={styles.filterItem}>
              <User name={user.name} avatarUrl={user.avatarUrl} size="tiny" onClick={() => handleRemoveUserClick(user.id)} />
            </span>
          ))}
        </span>
        <span className={styles.filter}>
          <LabelsPopup
            items={allLabels}
            currentIds={labels.map((label) => label.id)}
            title={t('common.filterByLabels', { context: 'title' })}
            canEdit={canEdit}
            onSelect={onLabelAdd}
            onDeselect={onLabelRemove}
            onCreate={onLabelCreate}
            onUpdate={onLabelUpdate}
            onMove={onLabelMove}
            onDelete={onLabelDelete}
            offset={16}
          >
            <Button title={t('common.filterByLabels', { context: 'title' })} className={styles.filterButton}>
              <span className={styles.filterTitle}>{`${t('common.labels')}:`}</span>
              {labels.length === 0 && <span className={styles.filterLabel}>{t('common.all')}</span>}
            </Button>
          </LabelsPopup>
          {labels.map((label) => (
            <span key={label.id} className={styles.filterItem}>
              <Label name={label.name} color={label.color} variant="labels" onClick={() => handleRemoveLabelClick(label.id)} />
            </span>
          ))}
        </span>
      </>
    );
  },
);

Filters.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  allBoardMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelMove: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
};

export default Filters;
