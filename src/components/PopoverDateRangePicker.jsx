import React, { useState } from "react";
import { Popover, DatePicker, Button, InputNumber } from "antd";
import dayjs from "dayjs";

const { TimePicker } = DatePicker;

const minute = 60 * 1000;
export const PopoverDateRangePicker = ({
  children,
  onConfirm,
  confirmText,
  defaultValue,
}) => {
  const [visible, setVisible] = useState(false);

  const content = (
    <Content
      onConfirm={onConfirm}
      confirmText={confirmText}
      defaultValue={defaultValue}
      setVisible={setVisible}
    />
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={visible}
      onOpenChange={setVisible}
      destroyTooltipOnHide
    >
      {children}
    </Popover>
  );
};

export const Content = ({
  onConfirm,
  confirmText,
  defaultValue,
  setVisible,
}) => {
  const [startingDate, setStartingDate] = useState(dayjs(defaultValue[0]));
  const [startingTime, setStartingTime] = useState(dayjs(defaultValue[0]));
  const [interval, setInterval] = useState(
    Math.round((defaultValue[1] - defaultValue[0]) / minute)
  );

  const handleSubmit = () => {
    const startTime = startingTime
      .set("date", startingDate.date())
      .set("month", startingDate.month())
      .set("year", startingDate.year());
    onConfirm([
      startTime.toDate().getTime(),
      startTime.add(interval, "minute").toDate().getTime(),
    ]);
    setVisible(false);
  };
  return (
    <div className="no-drag" style={{ display: "flex" }}>
      <DatePicker
        needConfirm={false}
        value={startingDate}
        size="small"
        format={{
          format: "MM/DD/YYYY",
          type: "mask",
        }}
        showNow={false}
        onChange={(date) => setStartingDate(date)}
        style={{ width: 110 }}
      />
      <TimePicker
        needConfirm={false}
        value={startingTime}
        size="medium"
        format={{
          format: "HH:mm",
          type: "mask",
        }}
        showNow={false}
        onChange={(time) => setStartingTime(time)}
        style={{ width: 80 }}
      />
      <InputNumber
        suffix="min"
        value={interval}
        controls={false}
        style={{ width: 75 }}
        onChange={(interval) => setInterval(interval)}
      />
      <Button onClick={handleSubmit} type="primary">
        {confirmText ?? "Save"}
      </Button>
    </div>
  );
};
