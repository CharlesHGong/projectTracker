import React, { useCallback, useEffect, useState } from "react";
import { usePageStore } from "../store";
import { Button, Input, Popconfirm, Select } from "antd";
import { DeleteOutlined, LeftSquareOutlined } from "@ant-design/icons";
import { PopoverDateRangePicker } from "../components/PopoverDateRangePicker";
import { PlusOutlined } from "@ant-design/icons";
import {
  groupByNone,
  groupDatesByDay,
  groupDatesByMonth,
  groupDatesByWeek,
} from "../utils/dateUtils";
import { request } from "../api";
import { Log, Project } from "../types";

const getGroups = (
  logs: Log[],
  groupBy: string
): { start: string; time: string; startTime?: number; endTime?: number }[] => {
  switch (groupBy) {
    case "day":
      return groupDatesByDay(logs);
    case "week":
      return groupDatesByWeek(logs);
    case "month":
      return groupDatesByMonth(logs);
    default:
      return groupByNone(logs);
  }
};

export const ProjectPage = ({ name }: { name: string }) => {
  const [groupBy, setGroupBy] = useState("none");
  const [project, setProject] = useState<Project | null>(null);

  const loadProject = useCallback(async () => {
    const project = await request({ method: "getProject", payload: name });
    setProject(project);
  }, [name]);
  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const logsGrouped = project ? getGroups(project.logs, groupBy) : [];

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header name={name} loadProject={loadProject} />
      <div style={{ flex: "1 1 auto", overflowY: "auto" }}>
        <div className="no-drag" style={{ textAlign: "right" }}>
          <Select
            popupClassName="no-drag"
            size="small"
            value={groupBy}
            style={{ width: 80 }}
            onChange={(v) => setGroupBy(v)}
            options={[
              { value: "day", label: "day" },
              { value: "week", label: "week" },
              { value: "month", label: "month" },
              { value: "none", label: "none" },
            ]}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          {logsGrouped.map(({ start, time, startTime, endTime }) =>
            groupBy === "none" ? (
              <div
                key={start}
                style={{
                  margin: "4px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {start}: {time}s
                {startTime && endTime && (
                  <PopoverDateRangePicker
                    defaultValue={[startTime, endTime]}
                    onConfirm={async (range) => {
                      if (!project) return;
                      const newProject = await usePageStore
                        .getState()
                        .updateLog(
                          project,
                          { startTime, endTime },
                          { startTime: range[0], endTime: range[1] }
                        );
                      setProject(newProject);
                    }}
                  >
                    <Button size="small" className="no-drag" type="primary">
                      Edit
                    </Button>
                  </PopoverDateRangePicker>
                )}
              </div>
            ) : (
              <div key={start} style={{ margin: "4px 0" }}>
                {start}: {time}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

const Header = ({
  name,
  loadProject,
}: {
  name: string;
  loadProject: () => void;
}) => {
  const [edit, setEdit] = useState(false);
  const [newName, setNewName] = useState(name);
  return (
    <div
      className="header"
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        marginBottom: 10,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "left" }}>
        <Button
          className="no-drag"
          icon={<LeftSquareOutlined />}
          onClick={() => usePageStore.setState({ page: "home" })}
          size="small"
        />
      </div>
      <div style={{ textAlign: "center" }}>
        {edit ? (
          <Input
            className="no-drag"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ textAlign: "center", padding: 0 }}
          />
        ) : (
          name
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <PopoverDateRangePicker
          defaultValue={[Date.now() - 1000 * 60 * 60, Date.now()]}
          onConfirm={async (range) => {
            await usePageStore.getState().addLog(name, range[0], range[1]);
            loadProject();
          }}
          confirmText={"Add"}
        >
          <Button className="no-drag" icon={<PlusOutlined />} size="small" />
        </PopoverDateRangePicker>
        <Button
          className="no-drag"
          type="primary"
          size="small"
          onClick={() =>
            setEdit((edit) => {
              if (edit) {
                usePageStore.getState().updateName(name, newName);
              }
              return !edit;
            })
          }
        >
          {edit ? "Save" : "Edit"}
        </Button>
        <Popconfirm
          title="Delete the project"
          description="Are you sure to delete this project?"
          onConfirm={() => {
            usePageStore.getState().deleteProject(name);
            usePageStore.setState({ page: "home" });
          }}
        >
          <Button
            className="no-drag"
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      </div>
    </div>
  );
};
