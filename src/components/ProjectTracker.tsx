import React from "react";
import { usePageStore } from "../store";
import { Button } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { formatTime } from "../utils/dateUtils";

export const ProjectTracker = ({ name }: { name: string }) => {
  const now = usePageStore((state) =>
    state.workingProjectName === name ? state.now : undefined
  );
  const startTime = usePageStore((state) =>
    state.workingProjectName === name ? state.startTime : undefined
  );
  const previousTime = usePageStore((state) => {
    const projectLogs =
      state.projects.find((project) => project.name === name)?.logs || [];
    return projectLogs.reduce(
      (acc, log) => log.endTime - log.startTime + acc,
      0
    );
  });
  const totalTime =
    previousTime +
    (startTime ? Math.max(0, (now ?? Date.now()) - startTime) : 0);

  const handleClick = () => {
    const { handleStartOrStop } = usePageStore.getState();
    handleStartOrStop(name, !Boolean(startTime));
  };

  return (
    <div
      style={{
        margin: "4px 0px",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        alignItems: "center",
      }}
    >
      <span
        style={{ textAlign: "left", display: "flex", alignItems: "center" }}
      >
        <Button
          className="no-drag"
          icon={<InfoCircleOutlined />}
          size="small"
          type="link"
          onClick={() => usePageStore.setState({ page: `project/${name}` })}
        />
        <span>{name}</span>
      </span>
      <span style={{ textAlign: "center" }}>{formatTime(totalTime)}</span>
      <Button
        className="no-drag"
        size="small"
        onClick={handleClick}
        variant="solid"
        color={startTime ? "danger" : "primary"}
      >
        {startTime ? "End" : "Start"}
      </Button>
    </div>
  );
};
