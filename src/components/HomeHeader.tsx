import React from "react";
import { usePageStore } from "../store";
import { PopoverInput } from "./PopoverInput";
import { Button, Dropdown } from "antd";
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
import { MinimizeVariant } from "../types";

export const Header = () => {
  const minimize = usePageStore((state) => state.minimize);
  const minimizeVariant = usePageStore((state) => state.minimizeVariant);
  const isCompactMode = minimize && minimizeVariant === "compact";
  const useExpandedHeaderLayout = !minimize || isCompactMode;
  const workingProjectName = usePageStore((state) => state.workingProjectName);
  const lastStartedProjectName = usePageStore(
    (state) => state.lastStartedProjectName
  );
  const isRunning = Boolean(workingProjectName);
  const now = usePageStore((state) => state.now);
  const startTime = usePageStore((state) => state.startTime);
  const projects = usePageStore((state) => state.projects);
  const compactProjectName =
    workingProjectName || lastStartedProjectName || projects[0]?.name || "";
  const compactProjectTotalTime =
    (projects
      .find((project) => project.name === compactProjectName)
      ?.logs.reduce((acc, log) => log.endTime - log.startTime + acc, 0) ??
    0) +
    (isRunning && startTime ? (now ?? Date.now()) - startTime : 0);

  const setMinimizeMode = (variant: MinimizeVariant) => {
    usePageStore.setState({ minimize: true, minimizeVariant: variant });
    request({
      method: "minimize",
      payload: { minimized: true, variant },
    });
  };

  const restoreWindow = () => {
    usePageStore.setState({ minimize: false });
    request({
      method: "minimize",
      payload: { minimized: false, variant: minimizeVariant },
    });
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
        gridTemplateColumns: useExpandedHeaderLayout
          ? "75px 1fr 75px"
          : "1fr auto auto",
        marginBottom: 10,
        alignItems: "center",
      }}
    >
      {!useExpandedHeaderLayout ? (
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
      <div style={{ textAlign: useExpandedHeaderLayout ? "center" : "left" }}>
        {useExpandedHeaderLayout ? "Project Tracker" : ""}
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
        {!useExpandedHeaderLayout && (
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
        {minimize ? (
          <Button
            icon={<ArrowsAltOutlined />}
            size="small"
            onClick={restoreWindow}
          />
        ) : (
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{
              items: [
                { key: "minimize", label: "Minimize" },
                { key: "compact", label: "Compact" },
              ],
              onClick: ({ key }) => setMinimizeMode(key as MinimizeVariant),
            }}
          >
            <Button icon={<ShrinkOutlined />} size="small" />
          </Dropdown>
        )}
        {useExpandedHeaderLayout && (
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
