import React from "react";
import { usePageStore } from "../store";
import { PopoverInput } from "./PopoverInput";
import { Button } from "antd";
import { PlusOutlined, CaretDownOutlined } from "@ant-design/icons";
import { ProjectSelect } from "./ProjectSelect";
import { request } from "../api";

export const Header = () => {
  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        marginBottom: 10,
      }}
    >
      <div />
      <div>Project Tracker</div>
      <div className="no-drag" style={{ textAlign: "right" }}>
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
        <ProjectSelect
          onConfirm={(inputValue) => {
            console.log(inputValue);
          }}
        >
          <Button icon={<CaretDownOutlined />} size="small" />
        </ProjectSelect>
      </div>
    </div>
  );
};
