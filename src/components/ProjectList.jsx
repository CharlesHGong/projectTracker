import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ProjectTracker } from "./ProjectTracker";
import { usePageStore } from "../store";

export const ProjectList = ({ projectNames }) => {
  const handleDragEnd = (result) => {
    const { source, destination } = result;
    // Do nothing if item is dropped outside the list
    if (!destination) return;
    // Reorder the list
    usePageStore.getState().reorderList(source.index, destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {projectNames.map((name, index) => (
              <Draggable key={name} draggableId={name} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      ...provided.draggableProps.style,
                    }}
                  >
                    <div {...provided.dragHandleProps}>☰</div>
                    <ProjectTracker name={name} key={name} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
