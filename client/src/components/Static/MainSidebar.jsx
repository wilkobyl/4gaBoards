import React, { useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import pick from 'lodash/pick';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
import Paths from '../../constants/Paths';
import { useToggle } from '../../lib/hooks';
import Connections from '../BoardActions/Connections';
import BoardActionsPopup from '../BoardActions/BoardActionsPopup';
import ProjectAddPopup from '../ProjectAddPopup';
import BoardAddPopup from '../BoardAddPopup';
import DroppableTypes from '../../constants/DroppableTypes';
import Filter from '../Filter';
import ProjectActionsPopup from './ProjectActionsPopup';

import styles from './MainSidebar.module.scss';
import gStyles from '../../globalStyles.module.scss';

const MainSidebar = React.memo(
  ({
    children,
    settingsOnly,
    path,
    projects,
    filteredProjects,
    managedProjects,
    currProjectId,
    currBoardId,
    isAdmin,
    defaultData,
    isSubmitting,
    filterQuery,
    filterTarget,
    sidebarCompact,
    onProjectCreate,
    onProjectUpdate,
    onBoardCreate,
    onBoardUpdate,
    onBoardMove,
    onBoardDelete,
    onBoardExport,
    onChangeFilterQuery,
    onUserProjectUpdate,
  }) => {
    const [t] = useTranslation();
    const [sidebarShown, toggleSidebar] = useToggle(true);
    const projectRefs = useRef({});
    const boardRefs = useRef({});
    const isFilteringBoards = filterTarget === 'board' && !!filterQuery;

    const handleToggleProjectCollapse = useCallback(
      (project) => {
        onUserProjectUpdate(project.id, { isCollapsed: !project.isCollapsed });
      },
      [onUserProjectUpdate],
    );

    const handleDragEnd = useCallback(
      ({ draggableId, source, destination }) => {
        if (!destination || source.index === destination.index) {
          return;
        }

        onBoardMove(draggableId, destination.index);
      },
      [onBoardMove],
    );

    const scrollItemIntoView = useCallback((itemRef) => {
      if (itemRef) {
        const rect = itemRef.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (!isVisible) {
          itemRef.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }
    }, []);

    const handleFilterQueryClear = useCallback(() => {
      const timeout = setTimeout(() => {
        if (currBoardId) {
          scrollItemIntoView(boardRefs.current[currBoardId]);
        } else if (currProjectId) {
          scrollItemIntoView(projectRefs.current[currProjectId]);
        }
      }, 0);
      return () => clearTimeout(timeout);
    }, [currBoardId, currProjectId, scrollItemIntoView]);

    useEffect(() => {
      if (currBoardId) {
        scrollItemIntoView(boardRefs.current[currBoardId]);
      } else if (currProjectId) {
        scrollItemIntoView(projectRefs.current[currProjectId]);
      }
    }, [currProjectId, currBoardId, scrollItemIntoView]);

    const projectsNode = filteredProjects.map((project) => {
      const isProjectManager = managedProjects.some((p) => p.id === project.id);
      return (
        <div key={project.id}>
          {/* eslint-disable-next-line no-return-assign */}
          <div className={classNames(styles.sidebarItemProject, !currBoardId && currProjectId === project.id && styles.sidebarItemActive)} ref={(el) => (projectRefs.current[project.id] = el)}>
            <Button style={ButtonStyle.Icon} title={project.isCollapsed ? t('common.showBoards') : t('common.hideBoards')} className={styles.sidebarButton} onClick={() => handleToggleProjectCollapse(project)}>
              <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={classNames(styles.collapseIcon, project.isCollapsed && styles.collapseIconCollapsed)} />
            </Button>
            <Link to={Paths.PROJECTS.replace(':id', project.id)} className={styles.sidebarItemInner}>
              <Button style={ButtonStyle.NoBackground} content={project.name} className={classNames(styles.sidebarButton, styles.sidebarButtonPadding)} />
            </Link>
            {isProjectManager && (
              <ProjectActionsPopup
                projectId={project.id}
                managedProjects={managedProjects}
                defaultDataRename={pick(project, 'name')}
                isAdmin={isAdmin}
                onUpdate={(data) => onProjectUpdate(project.id, data)}
                onBoardCreate={onBoardCreate}
                position="right-start"
                offset={10}
                hideCloseButton
              >
                <Button style={ButtonStyle.Icon} title={t('common.editProject', { context: 'title' })} className={classNames(styles.sidebarButton, styles.hoverButton)}>
                  <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} />
                </Button>
              </ProjectActionsPopup>
            )}
          </div>
          {(!project.isCollapsed || isFilteringBoards || currProjectId === project.id) && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="boards" type={DroppableTypes.BOARD} direction="vertical">
                {({ innerRef, droppableProps, placeholder }) => (
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  <div {...droppableProps} ref={innerRef}>
                    {project.boards.map((board, index) => (
                      <Draggable key={board.id} draggableId={board.id} index={index} isDragDisabled={!board.isPersisted || !isProjectManager}>
                        {/* eslint-disable-next-line no-shadow */}
                        {({ innerRef, draggableProps, dragHandleProps }) => (
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          <div {...draggableProps} ref={innerRef} className={styles.boardDraggable}>
                            {board.isPersisted && (
                              <div
                                key={board.id}
                                className={classNames(styles.sidebarItemBoard, currBoardId === board.id && styles.sidebarItemActive)}
                                // eslint-disable-next-line no-return-assign
                                ref={(el) => (boardRefs.current[board.id] = el)}
                              >
                                {isProjectManager && (
                                  // eslint-disable-next-line react/jsx-props-no-spreading
                                  <div {...dragHandleProps}>
                                    <Button style={ButtonStyle.Icon} title={t('common.reorderBoards')} className={classNames(styles.reorderBoardsButton, styles.hoverButton)}>
                                      <Icon type={IconType.MoveUpDown} size={IconSize.Size13} />
                                    </Button>
                                  </div>
                                )}
                                <Link to={Paths.BOARDS.replace(':id', board.id)} className={classNames(styles.sidebarItemInner, !isProjectManager && styles.boardCannotManage)}>
                                  <Button style={ButtonStyle.NoBackground} content={board.name} className={classNames(styles.boardButton, styles.sidebarButton)} />
                                </Link>
                                {board.isGithubConnected &&
                                  (isProjectManager ? (
                                    <Connections defaultData={pick(board, ['isGithubConnected', 'githubRepo'])} onUpdate={(data) => onBoardUpdate(board.id, data)} offset={30} position="right-start">
                                      <Icon
                                        type={IconType.Github}
                                        size={IconSize.Size13}
                                        className={classNames(styles.githubIcon, board.isGithubConnected ? styles.githubGreen : styles.githubGrey)}
                                        title={board.isGithubConnected ? t('common.connectedToGithub') : t('common.notConnectedToGithub')}
                                      />
                                    </Connections>
                                  ) : (
                                    <div>
                                      <Icon
                                        type={IconType.Github}
                                        size={IconSize.Size13}
                                        className={classNames(styles.githubIcon, board.isGithubConnected ? styles.githubGreen : styles.githubGrey, styles.githubCannotManage)}
                                        title={board.isGithubConnected ? t('common.connectedToGithub') : t('common.notConnectedToGithub')}
                                      />
                                    </div>
                                  ))}
                                {isProjectManager && (
                                  <BoardActionsPopup
                                    defaultDataRename={pick(board, 'name')}
                                    defaultDataGithub={pick(board, ['isGithubConnected', 'githubRepo'])}
                                    onUpdate={(data) => onBoardUpdate(board.id, data)}
                                    onExport={() => onBoardExport(board.id)}
                                    onDelete={() => onBoardDelete(board.id)}
                                    position="right-start"
                                    offset={10}
                                    hideCloseButton
                                  >
                                    <Button style={ButtonStyle.Icon} title={t('common.editBoard', { context: 'title' })} className={styles.hoverButton}>
                                      <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} />
                                    </Button>
                                  </BoardActionsPopup>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      );
    });

    return (
      <div className={styles.wrapper}>
        <Button style={ButtonStyle.Icon} title={sidebarShown ? t('common.hideSidebar') : t('common.showSidebar')} onClick={toggleSidebar} className={styles.toggleSidebarButton}>
          <Icon type={sidebarShown ? IconType.Hide : IconType.Show} size={IconSize.Size18} />
        </Button>
        <div className={classNames(styles.sidebar, sidebarCompact && styles.sidebarCompact, !sidebarShown && styles.sidebarHidden)}>
          <div className={styles.sidebarHeader}>
            {!settingsOnly && (
              <Filter defaultValue="" projects={projects} filteredProjects={filteredProjects} path={path} onChangeFilterQuery={onChangeFilterQuery} onFilterQueryClear={handleFilterQueryClear} />
            )}
          </div>
          <div className={classNames(styles.scrollable, gStyles.scrollableY)}>
            {settingsOnly && (
              <div>
                <div className={styles.sidebarTitle}>
                  <Icon type={IconType.Settings} size={IconSize.Size16} className={styles.sidebarTitleIcon} />
                  {t('common.settings')}
                </div>
                <div className={classNames(styles.sidebarItem, path === Paths.SETTINGS_PROFILE && styles.sidebarActive)}>
                  <Link to={Paths.SETTINGS_PROFILE}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.profile')} className={classNames(styles.sidebarButton, styles.sidebarButtonPadding)}>
                      <Icon type={IconType.User} size={IconSize.Size14} className={styles.icon} />
                      {t('common.profile')}
                    </Button>
                  </Link>
                </div>
                <div className={classNames(styles.sidebarItem, path === Paths.SETTINGS_PREFERENCES && styles.sidebarActive)}>
                  <Link to={Paths.SETTINGS_PREFERENCES}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.preferences')} className={classNames(styles.sidebarButton, styles.sidebarButtonPadding)}>
                      <Icon type={IconType.Sliders} size={IconSize.Size14} className={styles.icon} />
                      {t('common.preferences')}
                    </Button>
                  </Link>
                </div>
                <div className={classNames(styles.sidebarItem, path === Paths.SETTINGS_ACCOUNT && styles.sidebarActive)}>
                  <Link to={Paths.SETTINGS_ACCOUNT}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.account')} className={classNames(styles.sidebarButton, styles.sidebarButtonPadding)}>
                      <Icon type={IconType.AddressCard} size={IconSize.Size14} className={styles.icon} />
                      {t('common.account')}
                    </Button>
                  </Link>
                </div>
                <div className={classNames(styles.sidebarItem, path === Paths.SETTINGS_AUTHENTICATION && styles.sidebarActive)}>
                  <Link to={Paths.SETTINGS_AUTHENTICATION}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.authentication')} className={classNames(styles.sidebarButton, styles.sidebarButtonPadding)}>
                      <Icon type={IconType.Key} size={IconSize.Size14} className={styles.icon} />
                      {t('common.authentication')}
                    </Button>
                  </Link>
                </div>
                <div className={classNames(styles.sidebarItem, path === Paths.SETTINGS_ABOUT && styles.sidebarActive)}>
                  <Link to={Paths.SETTINGS_ABOUT}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.aboutShort')} className={classNames(styles.sidebarButton, styles.sidebarButtonPadding)}>
                      <Icon type={IconType.Info} size={IconSize.Size14} className={styles.icon} />
                      {t('common.aboutShort')}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            {isAdmin && settingsOnly && (
              <div>
                <div className={styles.sidebarTitle}>
                  <Icon type={IconType.Server} size={IconSize.Size16} className={styles.sidebarTitleIcon} />
                  {t('common.instanceSettings')}
                </div>
                <div className={classNames(styles.sidebarItem, path === Paths.SETTINGS_USERS && styles.sidebarActive)}>
                  <Link to={Paths.SETTINGS_USERS}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.users')} className={classNames(styles.sidebarButton, styles.sidebarButtonPadding)}>
                      <Icon type={IconType.Users} size={IconSize.Size14} className={styles.icon} />
                      {t('common.users')}
                    </Button>
                  </Link>
                </div>
                <div className={classNames(styles.sidebarItem, path === Paths.SETTINGS_INSTANCE && styles.sidebarActive)}>
                  <Link to={Paths.SETTINGS_INSTANCE}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.settings')} className={classNames(styles.sidebarButton, styles.sidebarButtonPadding)}>
                      <Icon type={IconType.Settings} size={IconSize.Size14} className={styles.icon} />
                      {t('common.settings')}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            {!settingsOnly && <div>{projectsNode}</div>}
          </div>
          <div className={styles.sidebarFooter}>
            {!settingsOnly && (
              <ProjectAddPopup defaultData={defaultData} isSubmitting={isSubmitting} onCreate={onProjectCreate} offset={2} position="right-end">
                <Button style={ButtonStyle.NoBackground} title={t('common.addProject')} className={styles.footerButton}>
                  <Icon type={IconType.Plus} size={IconSize.Size13} className={styles.footerButtonIcon} />
                  {t('common.addProject')}
                </Button>
              </ProjectAddPopup>
            )}
            {managedProjects.length > 0 && !settingsOnly && (
              <BoardAddPopup projects={managedProjects} projectId={currProjectId} isAdmin={isAdmin} onCreate={onBoardCreate} offset={2} position="right-end">
                <Button style={ButtonStyle.NoBackground} title={t('common.addBoard')} className={styles.footerButton}>
                  <Icon type={IconType.Plus} size={IconSize.Size13} className={styles.footerButtonIcon} />
                  {t('common.addBoard')}
                </Button>
              </BoardAddPopup>
            )}
            {settingsOnly && (
              <Link to={Paths.ROOT}>
                <Button style={ButtonStyle.NoBackground} title={t('common.backToDashboard')} className={styles.footerButton}>
                  <Icon type={IconType.ArrowLeftBig} size={IconSize.Size13} className={styles.footerButtonIcon} />
                  {t('common.dashboard')}
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className={classNames(styles.content, sidebarCompact && styles.contentCompact)}>{children}</div>
      </div>
    );
  },
);

MainSidebar.propTypes = {
  children: PropTypes.node.isRequired,
  settingsOnly: PropTypes.bool,
  path: PropTypes.string.isRequired,
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  filteredProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  managedProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currProjectId: PropTypes.string,
  currBoardId: PropTypes.string,
  isAdmin: PropTypes.bool.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  filterQuery: PropTypes.string,
  filterTarget: PropTypes.string,
  sidebarCompact: PropTypes.bool.isRequired,
  onProjectCreate: PropTypes.func.isRequired,
  onProjectUpdate: PropTypes.func.isRequired,
  onBoardCreate: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
  onBoardMove: PropTypes.func.isRequired,
  onBoardDelete: PropTypes.func.isRequired,
  onBoardExport: PropTypes.func.isRequired,
  onChangeFilterQuery: PropTypes.func.isRequired,
  onUserProjectUpdate: PropTypes.func.isRequired,
};

MainSidebar.defaultProps = {
  settingsOnly: false,
  currProjectId: undefined,
  currBoardId: undefined,
  filterQuery: undefined,
  filterTarget: undefined,
};

export default MainSidebar;
