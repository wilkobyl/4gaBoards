import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Board from '../components/Board';
import { BoardMembershipRoles } from '../constants/Enums';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { cardId } = selectors.selectPath(state);
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
  const listIds = selectors.selectListIdsForCurrentBoard(state);

  const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

  return {
    listIds,
    isCardModalOpened: !!cardId,
    canEdit: isCurrentUserEditor,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onListCreate: entryActions.createListInCurrentBoard,
      onListMove: entryActions.moveList,
      onCardMove: entryActions.moveCard,
      onTaskMove: entryActions.moveTask,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Board);
