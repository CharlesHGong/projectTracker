import React, { createRef, useState } from "react";
import { usePageStore } from "../store";
import { Button } from "antd";

const formatTime = (totalTime) => {
  const hours = Math.floor(totalTime / 3600000);
  const minutes = Math.floor((totalTime % 3600000) / 60000);
  const seconds = Math.floor((totalTime % 60000) / 1000);
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const ProjectTracker = ({ name }) => {
  const [startTime, setStartTime] = useState(undefined);
  const [now, setNow] = useState(Date.now());
  const removeIntervalRef = createRef();
  const previousTime = usePageStore((state) => {
    const projectLogs =
      state.projects.find((project) => project.name === name)?.logs || [];
    return projectLogs.reduce(
      (acc, log) => log.endTime - log.startTime + acc,
      0
    );
  });
  const totalTime = previousTime + (startTime ? now - startTime : 0);

  const handleClick = () => {
    if (startTime) {
      clearInterval(removeIntervalRef.current);
      usePageStore.getState().addLog(name, startTime, Date.now());
      setStartTime(undefined);
    } else {
      setStartTime(Date.now());
      removeIntervalRef.current = setInterval(() => {
        setNow(Date.now());
      }, 1000);
    }
  };

  return (
    <div>
      <span>{name}</span>
      <span>{formatTime(totalTime)}</span>
      <Button size="small" onClick={handleClick}>
        {startTime ? "End" : "Start"}
      </Button>
    </div>
  );
};
