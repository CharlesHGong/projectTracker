import React, { useEffect, useState } from "react";
import { Popover, Input } from "antd";

export const PopoverInput = ({ children, onConfirm }) => {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = React.createRef();

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [visible]);

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
        ref={inputRef}
        placeholder="Project Name"
        value={inputValue}
        onChange={handleInputChange}
        onPressEnter={handleSubmit}
      />
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={visible}
      onOpenChange={handleVisibleChange}
      destroyTooltipOnHide
    >
      {children}
    </Popover>
  );
};
