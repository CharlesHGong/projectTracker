import React, { useCallback, useEffect, useState } from "react";
import { usePageStore } from "../store";
import { Button, Input, Select } from "antd";
import { LeftSquareOutlined } from "@ant-design/icons";
import { PopoverDateRangePicker } from "../components/PopoverDateRangePicker";
import { PlusOutlined } from "@ant-design/icons";
import {
  groupByNone,
  groupDatesByDay,
  groupDatesByMonth,
  groupDatesByWeek,
} from "../utils/dateUtils";
import { request } from "../api";

const getGroups = (logs, groupBy) => {
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

export const ProjectPage = ({ name }) => {
  const [groupBy, setGroupBy] = useState("day");
  const [project, setProject] = useState(null);

  const loadProject = useCallback(async () => {
    const project = await request({ method: "getProject", payload: name });
    setProject(project);
  }, [name]);
  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const logsGrouped = project ? getGroups(project.logs, groupBy) : [];

  return (
    <div className="widget">
      <Header name={name} loadProject={loadProject} />
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
        {logsGrouped.map(({ start, time }) => (
          <div key={start} style={{ margin: "4px 0" }}>
            {start}: {time}
          </div>
        ))}
      </div>
    </div>
  );
};

const Header = ({ name, loadProject }) => {
  const [edit, setEdit] = useState(false);
  const [newName, setNewName] = useState(name);
  return (
    <div
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
          onConfirm={async (range) => {
            await usePageStore.getState().addLog(name, range[0], range[1]);
            loadProject();
          }}
        >
          <Button className="no-drag" icon={<PlusOutlined />} size="small" />
        </PopoverDateRangePicker>
        <Button
          className="no-drag"
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
      </div>
    </div>
  );
};
