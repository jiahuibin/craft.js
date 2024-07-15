import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useMemo } from 'react';

import { SimpleElement } from './SimpleElement';

import { NodeId } from '../interfaces';
import { NodeElement } from '../nodes/NodeElement';
import { useInternalNode } from '../nodes/useInternalNode';

export const DefaultRender = () => {
  const { type, props, nodes, hydrationTimestamp } = useInternalNode(
    (node) => ({
      type: node.data.type,
      props: node.data.props,
      nodes: node.data.nodes,
      hydrationTimestamp: node._hydrationTimestamp,
    })
  );
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useDroppable({
    id: 'canvas_droppable',
    data: {
      parent: null,
      isContainer: true,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return useMemo(() => {
    let children = props.children;
    if (nodes && nodes.length > 0) {
      console.info(
        'jhb ~  2024/7/15  nodes.map((id: NodeId) => id) line:43 -----',
        nodes.map((id: NodeId) => id)
      );

      children = (
        <React.Fragment>
          <SortableContext items={nodes.map((id: NodeId) => id)}>
            {/*这里是容器*/}
            <div
              ref={setNodeRef}
              className="canvas"
              style={style}
              {...attributes}
              {...listeners}
            >
              <div className="canvas-fields">
                {nodes.map((id: NodeId, i) => (
                  <NodeElement id={id} key={id} index={i} />
                ))}
              </div>
            </div>
          </SortableContext>
        </React.Fragment>
      );
    }

    const render = React.createElement(type, props, children);

    if (typeof type == 'string') {
      return <SimpleElement render={render} />;
    }

    return render;
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [type, props, hydrationTimestamp, nodes]);
};
