import React, { useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ProjectTracker } from "./ProjectTracker";
import { usePageStore } from "../store";
import type { DropResult } from "@hello-pangea/dnd";
import type { Project } from "../types";

type ProjectListProps = {
  projects: Project[];
  isDragDisabled?: boolean;
};

const ProjectListComponent = ({
  projects,
  isDragDisabled = false,
}: ProjectListProps) => {
  const projectRows = useMemo(
    () =>
      projects.map((project) => ({
        name: project.name,
        previousTime: project.logs.reduce(
          (acc, log) => log.endTime - log.startTime + acc,
          0
        ),
      })),
    [projects]
  );

  const handleDragEnd = (result: DropResult) => {
    if (isDragDisabled) return;
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
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {projectRows.map(({ name, previousTime }, index) => (
              <Draggable
                key={name}
                draggableId={name}
                index={index}
                isDragDisabled={isDragDisabled}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      ...provided.draggableProps.style,
                    }}
                  >
                    <div
                      {...provided.dragHandleProps}
                      style={{
                        opacity: isDragDisabled ? 0.35 : 1,
                        cursor: isDragDisabled ? "not-allowed" : "grab",
                      }}
                    >
                      ☰
                    </div>
                    <ProjectTracker
                      name={name}
                      previousTime={previousTime}
                      key={name}
                    />
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

export const ProjectList = React.memo(ProjectListComponent);
