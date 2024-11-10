import React, { ReactNode, useEffect, useState } from "react";
import { Popover, Input } from "antd";

export const PopoverInput = ({
  children,
  onConfirm,
}: {
  children: ReactNode;
  onConfirm: (n: string) => void;
}) => {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = React.createRef<HTMLInputElement>();

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible]);

  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    onConfirm(inputValue);
    setVisible(false);
    setInputValue("");
  };

  const content = (
    <div className="no-drag" style={{ display: "flex" }}>
      <Input
        // @ts-expect-error
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
