import React, { useState } from "react";
import { Popover, DatePicker, Button } from "antd";

const { RangePicker } = DatePicker;

export const PopoverDateRangePicker = ({
  children,
  onConfirm,
  confirmText,
  defaultValue,
}) => {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState(undefined);

  const handleVisibleChange = (visible) => {
    setVisible(visible);
  };

  const handleInputChange = (range) => {
    setInputValue([range[0].toDate().getTime(), range[1].toDate().getTime()]);
  };

  const handleSubmit = () => {
    onConfirm(inputValue);
    setVisible(false);
    setInputValue(undefined);
  };

  const content = (
    <div className="no-drag" style={{ display: "flex" }}>
      <RangePicker
        defaultValue={defaultValue}
        showTime
        onChange={handleInputChange}
      />
      <Button onClick={handleSubmit}>
        {confirmText ? confirmText : "Add"}
      </Button>
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
