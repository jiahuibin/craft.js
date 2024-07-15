import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

import { NodeProvider } from './NodeContext';

import { NodeId } from '../interfaces';
import { RenderNodeToElement } from '../render/RenderNode';

export type NodeElementProps = {
  id: NodeId;
  index?: number;
  render?: React.ReactElement;
};

export const NodeElement = ({ id, render, index }: NodeElementProps) => {
  console.info('jhb ~  2024/7/15  id line:17 -----', id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    data: {
      index,
      id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <NodeProvider id={id}>
        <RenderNodeToElement render={render} />
      </NodeProvider>
    </div>
  );
};
