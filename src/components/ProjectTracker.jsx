import React, { useState } from "react";
import { usePageStore } from "../store";
import { Button } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const formatTime = (totalTime) => {
  const hours = Math.floor(totalTime / 3600000);
  const minutes = Math.floor((totalTime % 3600000) / 60000);
  const seconds = Math.floor((totalTime % 60000) / 1000);
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const ProjectTracker = ({ name }) => {
  const [now, setNow] = useState(Date.now());
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
    previousTime + (startTime ? Math.max(0, now - startTime) : 0);

  const handleClick = () => {
    const { handleStartOrStop } = usePageStore.getState();
    if (startTime) {
      handleStartOrStop(name, undefined);
    } else {
      const timeInterValRef = setInterval(() => {
        setNow(Date.now());
      }, 1000);
      handleStartOrStop(name, timeInterValRef);
    }
  };

  return (
    <div
      style={{
        margin: "4px 0px",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "10px",
      }}
    >
      <span style={{ textAlign: "left" }}>
        <Button
          icon={<InfoCircleOutlined />}
          size="small"
          type="link"
          onClick={() => usePageStore.setState({ page: `project/${name}` })}
        />
        {name}
      </span>
      <span style={{ textAlign: "center" }}>{formatTime(totalTime)}</span>
      <Button
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
