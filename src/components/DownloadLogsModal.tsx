import { Button, DatePicker, Modal, Tag } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { request } from "../api";

const { RangePicker } = DatePicker;
export const DownloadLogsModal = ({ onClose }: { onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(1, "week").startOf("week"),
    dayjs().subtract(1, "week").endOf("week"),
  ]);

  const presets: { label: string; value: () => [Dayjs, Dayjs] }[] = [
    {
      label: "This week",
      value: () => [dayjs().startOf("week"), dayjs().endOf("week")],
    },
    {
      label: "Last week",
      value: () => [
        dayjs().startOf("week").subtract(1, "week"),
        dayjs().endOf("week").subtract(1, "week"),
      ],
    },
    {
      label: "This month",
      value: () => [dayjs().startOf("month"), dayjs().endOf("month")],
    },
    {
      label: "Last month",
      value: () => [
        dayjs().startOf("month").subtract(1, "month"),
        dayjs().endOf("month").subtract(1, "month"),
      ],
    },
  ];

  const handleExport = async (type: string) => {
    setLoading(true);
    await request({
      method: "exportLogs",
      payload: {
        type,
        startTime: range[0].valueOf(),
        endTime: range[1].valueOf(),
      },
    });
    setLoading(false);
    window.alert("Logs exported successfully!");
    onClose();
  };

  return (
    <Modal
      title={<div style={{ textAlign: "center" }}>Download Logs</div>}
      open
      onClose={onClose}
      destroyOnClose
      width={250}
      style={{ top: 20 }}
      className="no-padding-modal"
      footer={
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button size="small" key="raw" onClick={() => handleExport("raw")}>
            Export Raw
          </Button>
          <Button
            size="small"
            key="report"
            type="primary"
            onClick={() => handleExport("report")}
          >
            Export Report
          </Button>
        </div>
      }
    >
      <div style={{ textAlign: "center" }}>
        <RangePicker
          style={{ width: "100%" }}
          value={range}
          onChange={(dates) => {
            if (dates && dates.length === 2 && dates[0] && dates[1]) {
              setRange([dates[0], dates[1]]);
            } else {
              setRange([
                dayjs(new Date()).startOf("week"),
                dayjs(new Date()).endOf("week"),
              ]);
            }
          }}
          panelRender={(panelNode) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {panelNode}
            </div>
          )}
          dropdownClassName="one-month-calendar"
        />
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 8,
          width: "100%",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {presets.map(({ label, value }) => (
          <Tag
            key={label}
            onClick={() => setRange(value())}
            style={{ cursor: "pointer" }}
          >
            {label}
          </Tag>
        ))}
      </div>
    </Modal>
  );
};
