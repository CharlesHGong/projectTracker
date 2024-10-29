import React, { useState } from "react";
import { Popover, Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";

export const PopoverInput = ({ children, onConfirm }) => {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleVisibleChange = (visible) => {
    setVisible(visible);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    onConfirm(inputValue);
    setVisible(false);
    setInputValue("");
  };

  const content = (
    <div style={{ display: "flex" }}>
      <Input
        placeholder="Project Name"
        value={inputValue}
        onChange={handleInputChange}
        onPressEnter={handleSubmit}
      />
      <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit} />
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibleChange}
    >
      {children}
    </Popover>
  );
};
