import { ERROR_RESOLVER_NOT_AN_OBJECT, HISTORY_ACTIONS } from '@craftjs/utils';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import invariant from 'tiny-invariant';

import { EditorContext } from './EditorContext';
import { useEditorStore } from './store';

import { Events } from '../events';
import { Options } from '../interfaces';

type EditorProps = Partial<Options> & {
  children?: React.ReactNode;
};

/**
 * A React Component that provides the Editor context
 */
export const Editor = ({ children, ...options }: EditorProps) => {
  // we do not want to warn the user if no resolver was supplied
  if (options.resolver !== undefined) {
    invariant(
      typeof options.resolver === 'object' &&
        !Array.isArray(options.resolver) &&
        options.resolver !== null,
      ERROR_RESOLVER_NOT_AN_OBJECT
    );
  }

  const optionsRef = useRef(options);

  const context = useEditorStore(
    optionsRef.current,
    (state, previousState, actionPerformedWithPatches, query, normalizer) => {
      if (!actionPerformedWithPatches) {
        return;
      }

      const { patches, ...actionPerformed } = actionPerformedWithPatches;

      for (let i = 0; i < patches.length; i++) {
        const { path } = patches[i];
        const isModifyingNodeData =
          path.length > 2 && path[0] === 'nodes' && path[2] === 'data';

        let actionType = actionPerformed.type;

        if (
          [HISTORY_ACTIONS.IGNORE, HISTORY_ACTIONS.THROTTLE].includes(
            actionType
          ) &&
          actionPerformed.params
        ) {
          actionPerformed.type = actionPerformed.params[0];
        }

        if (
          ['setState', 'deserialize'].includes(actionPerformed.type) ||
          isModifyingNodeData
        ) {
          normalizer((draft) => {
            if (state.options.normalizeNodes) {
              state.options.normalizeNodes(
                draft,
                previousState,
                actionPerformed,
                query
              );
            }
          });
          break; // we exit the loop as soon as we find a change in node.data
        }
      }
    }
  );

  // sync enabled prop with editor store options
  useEffect(() => {
    if (!context) {
      return;
    }

    if (
      options.enabled === undefined ||
      context.query.getOptions().enabled === options.enabled
    ) {
      return;
    }

    context.actions.setOptions((editorOptions) => {
      editorOptions.enabled = options.enabled;
    });
  }, [context, options.enabled]);
  const [selected, setSelected] = useState();
  useEffect(() => {
    context.subscribe(
      (_) => ({
        json: context.query.serialize(),
      }),
      () => {
        context.query.getOptions().onNodesChange(context.query);
      }
    );

    const currentNodeId = context.query.getEvent('selected').last();
    console.info('jhb ~  2024/7/15  selected line:119 -----', currentNodeId);
    // setSelected(currentNodeId);
  }, [context]);

  if (!context) {
    return null;
  }
  const handleDragStart = (e) => {
    const {
      active: { id },
    } = e;
    setSelected(id);
    console.info('jhb ~  2024/7/15  active line:116 -----', id);
  };
  const handleDragEnd = (e) => {
    console.info('jhb ~  2024/7/15  e line:111 -----', e);
    console.info('jhb ~  2024/7/15  context line:118 -----', context);
    console.info(
      'jhb ~  2024/7/15  context line:118 -----',
      context.getState()
    );

    const {
      active: { id: currentId },
      over: { id: targetId },
    } = e;
    console.info(
      'jhb ~  2024/7/15  currentId line:122 -----',
      currentId,
      targetId
    );
    const { nodes = {} } = context.getState();
    const parentId = nodes?.[targetId]?.data?.parent || 'ROOT';
    const currentParentId = nodes?.[currentId]?.data?.parent || 'ROOT';
    // 父节点相同时
    if (currentParentId === parentId) {
      const currentIndex = nodes?.[parentId]?.data?.nodes?.findIndex((id) => {
        return id === currentId;
      });
      const targetIndex = nodes?.[parentId]?.data?.nodes?.findIndex((id) => {
        return id === targetId;
      });
      if (currentIndex < targetIndex) {
        context.actions.move(currentId, parentId, targetIndex + 1);
      } else {
        context.actions.move(currentId, parentId, targetIndex);
      }
    } else {
      // todo 父节点不一样的情况
    }
  };
  const renderDragOverlay = useMemo(() => {
    console.info('jhb ~  2024/7/15  selected line:153 -----', selected);
    return (
      <DragOverlay dropAnimation={null}>
        {/*{selected ? <NodeElement id={selected} key={selected} /> : null}*/}
      </DragOverlay>
    );
  }, [selected]);
  return (
    <EditorContext.Provider value={context}>
      <Events>
        <DndContext
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          autoScroll
        >
          {children}
          {renderDragOverlay}
        </DndContext>
      </Events>
    </EditorContext.Provider>
  );
};
