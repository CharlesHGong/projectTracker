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
): {
  start: string;
  time: string;
  startTime?: number;
  endTime?: number;
  description?: string | null;
}[] => {
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

const normalizeDescription = (description: string) => {
  const trimmedDescription = description.trim();
  return trimmedDescription ? trimmedDescription : null;
};

const EditableLogDescription = ({
  project,
  log,
  setProject,
}: {
  project: Project;
  log: Log;
  setProject: React.Dispatch<React.SetStateAction<Project | null>>;
}) => {
  const [description, setDescription] = useState(log.description ?? "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDescription(log.description ?? "");
    }
  }, [isEditing, log.description, log.endTime, log.startTime]);

  const saveDescription = async () => {
    const nextDescription = normalizeDescription(description);
    if ((log.description ?? null) === nextDescription) {
      setIsEditing(false);
      return;
    }

    const newProject = await usePageStore
      .getState()
      .updateLog(project, log, {
        ...log,
        description: nextDescription,
      });
    setProject(newProject);
    setIsEditing(false);
  };

  return isEditing ? (
    <Input
      className="no-drag"
      autoFocus
      size="small"
      value={description}
      placeholder="Description"
      onChange={(event) => setDescription(event.target.value)}
      onBlur={saveDescription}
      onPressEnter={(event) => event.currentTarget.blur()}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setDescription(log.description ?? "");
          setIsEditing(false);
        }
      }}
      style={{ flex: "1 1 120px", minWidth: 0 }}
    />
  ) : (
    <div
      className="no-drag"
      onClick={() => setIsEditing(true)}
      style={{
        flex: "1 1 120px",
        minWidth: 0,
        minHeight: 24,
        lineHeight: "24px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        textAlign: "left",
        color: "rgba(255, 255, 255, 0.72)",
        cursor: "text",
      }}
      title={description}
    >
      {description || (
        <span style={{ color: "rgba(255, 255, 255, 0.35)" }}>-</span>
      )}
    </div>
  );
};

export const ProjectPage = ({ name }: { name: string }) => {
  const [groupBy, setGroupBy] = useState("none");
  const [project, setProject] = useState<Project | null>(null);

  const loadProject = useCallback(async () => {
    const project = await request({ method: "getProject", payload: name });
    setProject(project ?? null);
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
      <Header name={name} project={project} loadProject={loadProject} />
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
          {logsGrouped.map(({ start, time, startTime, endTime, description }) =>
            groupBy === "none" ? (
              <div
                key={`${startTime}-${endTime}`}
                style={{
                  margin: "4px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    textAlign: "left",
                    minWidth: 0,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {start}: {time}
                </span>
                {project &&
                  startTime !== undefined &&
                  endTime !== undefined && (
                    <EditableLogDescription
                      project={project}
                      log={{ startTime, endTime, description }}
                      setProject={setProject}
                    />
                  )}
                {startTime !== undefined && endTime !== undefined && (
                  <PopoverDateRangePicker
                    defaultValue={[startTime, endTime]}
                    defaultDescription={description}
                    onConfirm={async (range, nextDescription) => {
                      if (!project) return;
                      const newProject = await usePageStore
                        .getState()
                        .updateLog(
                          project,
                          { startTime, endTime, description },
                          {
                            startTime: range[0],
                            endTime: range[1],
                            description: nextDescription,
                          }
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
  project,
  loadProject,
}: {
  name: string;
  project: Project | null;
  loadProject: () => void;
}) => {
  const [edit, setEdit] = useState(false);
  const [newName, setNewName] = useState(name);
  const [newCode, setNewCode] = useState(project?.code ?? "");

  useEffect(() => {
    setNewName(name);
  }, [name]);

  useEffect(() => {
    setNewCode(project?.code ?? "");
  }, [project?.code]);

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
          <div
            className="no-drag"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              alignItems: "stretch",
            }}
          >
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Project name"
              style={{ textAlign: "center", padding: 0 }}
            />
            <Input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Project code"
              style={{ textAlign: "center", padding: 0 }}
            />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div>{name}</div>
            <div style={{ fontSize: 12, color: "#fff" }}>
              {project?.code || "No code"}
            </div>
          </div>
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
          onConfirm={async (range, description) => {
            await usePageStore
              .getState()
              .addLog(name, range[0], range[1], description);
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
          onClick={async () => {
            if (edit) {
              await usePageStore.getState().updateProjectDetails(name, {
                name: newName,
                code: newCode,
              });
              if (newName === name) {
                loadProject();
              }
            }
            setEdit(!edit);
          }}
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
