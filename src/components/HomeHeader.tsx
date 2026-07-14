import React from "react";
import { usePageStore } from "../store";
import { PopoverInput } from "./PopoverInput";
import { Button, Dropdown, Input } from "antd";
import {
  PlusOutlined,
  CaretDownOutlined,
  ShrinkOutlined,
  ArrowsAltOutlined,
  CaretRightOutlined,
  SearchOutlined,
  CloseOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { request } from "../api";
import { HomeMenuDropdown } from "./HomeMenuDropdown";
import { ActiveLogDescriptionInput } from "./ActiveLogDescriptionInput";
import { formatTime } from "../utils/dateUtils";
import { MinimizeVariant } from "../types";

type HeaderProps = {
  projectSearch: string;
  isProjectSearchOpen: boolean;
  onProjectSearchChange: (value: string) => void;
  onProjectSearchOpenChange: (open: boolean) => void;
};

export const Header = ({
  projectSearch,
  isProjectSearchOpen,
  onProjectSearchChange,
  onProjectSearchOpenChange,
}: HeaderProps) => {
  const minimize = usePageStore((state) => state.minimize);
  const minimizeVariant = usePageStore((state) => state.minimizeVariant);
  const isCompactMode = minimize && minimizeVariant === "compact";
  const useExpandedHeaderLayout = !minimize || isCompactMode;
  const canSearchProjects = !minimize;
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

  const closeProjectSearch = () => {
    onProjectSearchChange("");
    onProjectSearchOpenChange(false);
  };

  return (
    <div
      className="header"
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: useExpandedHeaderLayout
          ? "75px 1fr 75px"
          : "minmax(0, 1fr) auto auto",
        columnGap: useExpandedHeaderLayout ? 0 : 8,
        height: 24,
        marginBottom: 10,
        alignItems: "center",
      }}
    >
      {!useExpandedHeaderLayout ? (
        <div
          style={{
            textAlign: "left",
            paddingLeft: "4px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 100px 80px",
            columnGap: 8,
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <span
            style={{
              gridColumn: isRunning ? "1" : "1 / 3",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {compactProjectName}
          </span>
          {isRunning && (
            <ActiveLogDescriptionInput style={{ gridColumn: "2" }} />
          )}
          <span
            style={{
              gridColumn: "3",
              textAlign: "left",
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            {formatTime(compactProjectTotalTime)}
          </span>
        </div>
      ) : (
        <div />
      )}
      <div
        style={{
          textAlign: useExpandedHeaderLayout ? "center" : "left",
          minWidth: 0,
        }}
      >
        {useExpandedHeaderLayout ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              minWidth: 0,
            }}
          >
            <span style={{ whiteSpace: "nowrap" }}>Project Tracker</span>
            {canSearchProjects &&
              (isProjectSearchOpen ? (
                <Input
                  autoFocus
                  className="no-drag"
                  size="small"
                  placeholder="Search projects"
                  value={projectSearch}
                  onChange={(event) =>
                    onProjectSearchChange(event.target.value)
                  }
                  prefix={<SearchOutlined />}
                  suffix={
                    <Button
                      aria-label="Clear project search"
                      icon={<CloseOutlined />}
                      size="small"
                      type="text"
                      onClick={closeProjectSearch}
                      style={{
                        width: 18,
                        minWidth: 18,
                        height: 18,
                        padding: 0,
                      }}
                    />
                  }
                  style={{
                    width: "clamp(88px, 32vw, 180px)",
                    height: 24,
                  }}
                />
              ) : (
                <Button
                  aria-label="Search projects"
                  className="no-drag"
                  icon={<SearchOutlined />}
                  size="small"
                  type="text"
                  onClick={() => onProjectSearchOpenChange(true)}
                  style={{ color: "white" }}
                />
              ))}
          </div>
        ) : (
          ""
        )}
      </div>
      <div
        className="no-drag"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          textAlign: "right",
        }}
      >
        {!useExpandedHeaderLayout && (
          <Button
            size="small"
            icon={isRunning ? <StopOutlined /> : <CaretRightOutlined />}
            onClick={handleCompactToggle}
            color={isRunning ? "danger" : "primary"}
            variant="solid"
            disabled={!compactProjectName}
          >
            {isRunning ? "End" : "Start"}
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
