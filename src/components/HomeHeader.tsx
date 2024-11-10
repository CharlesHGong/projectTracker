import React from "react";
import { usePageStore } from "../store";
import { PopoverInput } from "./PopoverInput";
import { Button } from "antd";
import {
  PlusOutlined,
  CaretDownOutlined,
  ShrinkOutlined,
  ArrowsAltOutlined,
} from "@ant-design/icons";
import { request } from "../api";
import { HomeMenuDropdown } from "./HomeMenuDropdown";

export const Header = () => {
  const minimize = usePageStore((state) => state.minimize);
  return (
    <div
      className="header"
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "75px 1fr 75px",
        marginBottom: 10,
        alignItems: "center",
      }}
    >
      <div />
      <div style={{ textAlign: "center" }}>Project Tracker</div>
      <div className="no-drag" style={{ textAlign: "right" }}>
        <Button
          icon={minimize ? <ArrowsAltOutlined /> : <ShrinkOutlined />}
          size="small"
          onClick={() => {
            usePageStore.setState({
              minimize: !usePageStore.getState().minimize,
            }),
              request({ method: "minimize", payload: !minimize });
          }}
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
