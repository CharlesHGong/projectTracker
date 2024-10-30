import React, { useEffect, useState } from "react";
import { usePageStore } from "../store";
import { Button, Select } from "antd";
import { LeftSquareOutlined } from "@ant-design/icons";
import { PopoverDateRangePicker } from "../components/PopoverDateRangePicker";
import { PlusOutlined } from "@ant-design/icons";
import {
  groupByNone,
  groupDatesByDay,
  groupDatesByMonth,
  groupDatesByWeek,
} from "../utils/dateUtils";

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
  const project = usePageStore((state) =>
    state.projects.find((project) => project.name === name)
  );

  const logsGrouped = getGroups(project.logs, groupBy);

  return (
    <div className="widget">
      <Header name={name} />
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

const Header = ({ name }) => {
  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        marginBottom: 10,
        justifyContent: "center",
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
      <div style={{ textAlign: "center" }}>{name}</div>
      <div style={{ textAlign: "right" }}>
        <PopoverDateRangePicker
          onConfirm={async (range) => {
            usePageStore.getState().addLog(name, range[0], range[1]);
          }}
        >
          <Button className="no-drag" icon={<PlusOutlined />} size="small" />
        </PopoverDateRangePicker>
      </div>
    </div>
  );
};
