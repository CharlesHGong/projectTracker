import React from "react";
import { usePageStore } from "../store";
import { PopoverInput } from "./PopoverInput";
import { Button } from "antd";
import {
  PlusOutlined,
  CaretDownOutlined,
  ShrinkOutlined,
  ArrowsAltOutlined,
  PauseCircleFilled,
  CaretRightOutlined,
} from "@ant-design/icons";
import { request } from "../api";
import { HomeMenuDropdown } from "./HomeMenuDropdown";
import { formatTime } from "../utils/dateUtils";

export const Header = () => {
  const minimize = usePageStore((state) => state.minimize);
  const workingProjectName = usePageStore((state) => state.workingProjectName);
  const lastStartedProjectName = usePageStore(
    (state) => state.lastStartedProjectName
  );
  const isRunning = Boolean(workingProjectName);
  const compactProjectName = workingProjectName || lastStartedProjectName;
  const now = usePageStore((state) => state.now);
  const startTime = usePageStore((state) => state.startTime);
  const projects = usePageStore((state) => state.projects);
  const compactProjectTotalTime =
    (projects
      .find((project) => project.name === compactProjectName)
      ?.logs.reduce((acc, log) => log.endTime - log.startTime + acc, 0) ??
    0) +
    (isRunning && startTime ? (now ?? Date.now()) - startTime : 0);

  const toggleMinimize = () => {
    const nextMinimize = !minimize;
    usePageStore.setState({ minimize: nextMinimize });
    request({ method: "minimize", payload: nextMinimize });
  };

  const handleCompactToggle = () => {
    if (!compactProjectName) {
      return;
    }
    usePageStore.getState().handleStartOrStop(
      compactProjectName,
      !isRunning
    );
  };

  return (
    <div
      className="header"
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: minimize ? "1fr auto auto" : "75px 1fr 75px",
        marginBottom: 10,
        alignItems: "center",
      }}
    >
      {minimize ? (
        <div
          style={{
            textAlign: "left",
            paddingLeft: "4px",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <span>{compactProjectName}</span>
          <span>{formatTime(compactProjectTotalTime)}</span>
        </div>
      ) : (
        <div />
      )}
      <div style={{ textAlign: minimize ? "left" : "center" }}>
        {minimize ? "" : "Project Tracker"}
      </div>
      <div
        className="no-drag"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "6px",
          textAlign: "right",
        }}
      >
        {minimize && (
          <Button
            size="small"
            icon={isRunning ? <PauseCircleFilled /> : <CaretRightOutlined />}
            onClick={handleCompactToggle}
            color={isRunning ? "danger" : "primary"}
            variant="solid"
            disabled={!compactProjectName}
          >
            {isRunning ? "Pause" : "Start"}
          </Button>
        )}
        <Button
          icon={minimize ? <ArrowsAltOutlined /> : <ShrinkOutlined />}
          size="small"
          onClick={toggleMinimize}
        />
        {!minimize && (
          <>
            <PopoverInput
              onConfirm={async (inputValue) => {
                await request({ method: "createProject", payload: inputValue });
                usePageStore.setState({
                  projectNames: [
                    ...usePageStore.getState().projectNames,
                    inputValue,
                  ],
                  selectedProjectNames: [
                    ...usePageStore.getState().selectedProjectNames,
                    inputValue,
                  ],
                });
                usePageStore.getState().loadProjects();
              }}
            >
              <Button icon={<PlusOutlined />} size="small" />
            </PopoverInput>
            <HomeMenuDropdown>
              <Button icon={<CaretDownOutlined />} size="small" />
            </HomeMenuDropdown>
          </>
        )}
      </div>
    </div>
  );
};
