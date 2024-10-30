import React, { useEffect } from "react";
import { usePageStore } from "../store";
import { Button } from "antd";
import { LeftSquareOutlined } from "@ant-design/icons";
import { PopoverDateRangePicker } from "../components/PopoverDateRangePicker";
import { PlusOutlined } from "@ant-design/icons";

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US");
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US");
};

export const ProjectPage = ({ name }) => {
  const project = usePageStore((state) =>
    state.projects.find((project) => project.name === name)
  );

  useEffect(() => {
    usePageStore.getState().getProjectNames();
  }, []);

  return (
    <div className="widget">
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
      <div style={{ textAlign: "center" }}>
        {project?.logs.map(({ startTime, endTime }) => (
          <div key={startTime} style={{ margin: "4px 0" }}>
            {formatDate(startTime)}: {formatTime(startTime)} -{" "}
            {formatTime(endTime)}
          </div>
        ))}
      </div>
    </div>
  );
};
