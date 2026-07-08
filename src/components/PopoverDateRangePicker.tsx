import React, { ReactNode, useState } from "react";
import { Popover, DatePicker, Button, Input, InputNumber } from "antd";
import dayjs from "dayjs";

const { TimePicker } = DatePicker;

type ContentType = {
  onConfirm: (a: [number, number], description: string | null) => void;
  confirmText?: string;
  defaultValue: [number, number];
  defaultDescription?: string | null;
};

const minute = 60 * 1000;
export const PopoverDateRangePicker = ({
  children,
  onConfirm,
  confirmText,
  defaultValue,
  defaultDescription,
}: { children: ReactNode } & ContentType) => {
  const [visible, setVisible] = useState(false);

  const content = (
    <Content
      onConfirm={onConfirm}
      confirmText={confirmText}
      defaultValue={defaultValue}
      defaultDescription={defaultDescription}
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
      placement="bottom"
    >
      {children}
    </Popover>
  );
};

export const Content = ({
  onConfirm,
  confirmText,
  defaultValue,
  defaultDescription,
  setVisible,
}: { setVisible: (visible: boolean) => void } & ContentType) => {
  const [startingDate, setStartingDate] = useState(dayjs(defaultValue[0]));
  const [startingTime, setStartingTime] = useState(dayjs(defaultValue[0]));
  const [interval, setInterval] = useState(
    Math.round((defaultValue[1] - defaultValue[0]) / minute)
  );
  const [description, setDescription] = useState(defaultDescription ?? "");

  const handleSubmit = () => {
    const startTime = startingTime
      .set("date", startingDate.date())
      .set("month", startingDate.month())
      .set("year", startingDate.year());
    const normalizedDescription = description.trim() || null;
    onConfirm(
      [
        startTime.toDate().getTime(),
        startTime.add(interval, "minute").toDate().getTime(),
      ],
      normalizedDescription
    );
    setVisible(false);
  };
  return (
    <div
      className="no-drag"
      style={{ display: "flex", flexDirection: "column", gap: 6 }}
    >
      <div style={{ display: "flex" }}>
        <DatePicker
          needConfirm={false}
          value={startingDate}
          size="small"
          format={{
            format: "MM/DD/YYYY",
            type: "mask",
          }}
          showNow={false}
          onChange={(date) => date && setStartingDate(date)}
          style={{ width: 110 }}
        />
        <TimePicker
          needConfirm={false}
          value={startingTime}
          size="middle"
          format={{
            format: "HH:mm",
            type: "mask",
          }}
          showNow={false}
          onChange={(time) => time && setStartingTime(time)}
          style={{ width: 80 }}
        />
        <InputNumber
          suffix="min"
          value={interval}
          controls={false}
          style={{ width: 75 }}
          onChange={(interval) => setInterval(interval ?? 0)}
        />
        <Button onClick={handleSubmit} type="primary">
          {confirmText ?? "Save"}
        </Button>
      </div>
      <Input
        value={description}
        placeholder="Description"
        onChange={(event) => setDescription(event.target.value)}
        onPressEnter={handleSubmit}
      />
    </div>
  );
};
