import React from "react";
import { usePageStore } from "../store";
import { Button } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { formatTime } from "../utils/dateUtils";
import { ActiveLogDescriptionInput } from "./ActiveLogDescriptionInput";

type ProjectTrackerProps = {
  name: string;
  previousTime?: number;
};

export const ProjectTracker = React.memo(
  ({ name, previousTime: providedPreviousTime }: ProjectTrackerProps) => {
    const now = usePageStore((state) =>
      state.workingProjectName === name ? state.now : undefined
    );
    const startTime = usePageStore((state) =>
      state.workingProjectName === name ? state.startTime : undefined
    );
    const isActive = Boolean(startTime);
    const previousTime = usePageStore((state) => {
      if (providedPreviousTime !== undefined) {
        return providedPreviousTime;
      }
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
          width: "100%",
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1fr) clamp(96px, 22vw, 120px) 80px 64px",
          columnGap: 10,
          alignItems: "center",
          minHeight: 32,
        }}
      >
        <div
          style={{
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
            gridColumn: isActive ? "1" : "1 / 3",
          }}
        >
          <Button
            className="no-drag"
            icon={<InfoCircleOutlined />}
            size="small"
            type="link"
            onClick={() => usePageStore.setState({ page: `project/${name}` })}
          />
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: "1 1 auto",
              minWidth: 0,
            }}
          >
            {name}
          </span>
        </div>
        {isActive ? (
          <ActiveLogDescriptionInput style={{ gridColumn: "2" }} />
        ) : null}
        <span
          style={{
            gridColumn: "3",
            textAlign: "left",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          {formatTime(totalTime)}
        </span>
        <Button
          className="no-drag"
          size="small"
          onClick={handleClick}
          variant="solid"
          color={startTime ? "danger" : "primary"}
          style={{ gridColumn: "4", justifySelf: "end", width: 64 }}
        >
          {startTime ? "End" : "Start"}
        </Button>
      </div>
    );
  }
);
