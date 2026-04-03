import { Button, DatePicker, Modal, Segmented } from "antd";
import dayjs, { Dayjs } from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import { useEffect, useMemo, useState } from "react";
import { request } from "../api";

dayjs.extend(updateLocale);

const { RangePicker } = DatePicker;

const WEEK_START_STORAGE_KEY = "downloadLogsWeekStart";

type WeekStart = "sunday" | "monday";

const getStoredWeekStart = (): WeekStart =>
  localStorage.getItem(WEEK_START_STORAGE_KEY) === "monday"
    ? "monday"
    : "sunday";

const getWeekRange = (
  referenceDate: Dayjs,
  weekStart: WeekStart
): [Dayjs, Dayjs] => {
  const dayOffset =
    weekStart === "monday"
      ? (referenceDate.day() + 6) % 7
      : referenceDate.day();
  const start = referenceDate.subtract(dayOffset, "day").startOf("day");
  return [start, start.add(6, "day").endOf("day")];
};

const getDefaultRange = (weekStart: WeekStart) =>
  getWeekRange(dayjs().subtract(1, "week"), weekStart);

export const DownloadLogsModal = ({ onClose }: { onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [weekStart, setWeekStart] = useState<WeekStart>(getStoredWeekStart);
  const [range, setRange] = useState<[Dayjs, Dayjs]>(() =>
    getDefaultRange(getStoredWeekStart())
  );

  useEffect(() => {
    dayjs.updateLocale("en", { weekStart: weekStart === "monday" ? 1 : 0 });
    localStorage.setItem(WEEK_START_STORAGE_KEY, weekStart);
  }, [weekStart]);

  const presets: { key: string; label: string; value: () => [Dayjs, Dayjs] }[] =
    useMemo(
      () => [
        {
          key: "this-week",
          label: "This week",
          value: () => getWeekRange(dayjs(), weekStart),
        },
        {
          key: "last-week",
          label: "Last week",
          value: () => getWeekRange(dayjs().subtract(1, "week"), weekStart),
        },
        {
          key: "this-month",
          label: "This month",
          value: () => [dayjs().startOf("month"), dayjs().endOf("month")],
        },
        {
          key: "last-month",
          label: "Last month",
          value: () => [
            dayjs().subtract(1, "month").startOf("month"),
            dayjs().subtract(1, "month").endOf("month"),
          ],
        },
      ],
      [weekStart]
    );

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
      keyboard
      onClose={onClose}
      onCancel={onClose}
      destroyOnClose
      width={320}
      style={{ top: 24 }}
      className="no-padding-modal"
      footer={
        <div
          style={{
            width: "100%",
            display: "flex",
            gap: 8,
          }}
        >
          <Button
            size="middle"
            key="raw"
            onClick={() => handleExport("raw")}
            loading={loading}
            style={{ flex: 1 }}
          >
            Export Raw
          </Button>
          <Button
            size="middle"
            key="report"
            type="primary"
            onClick={() => handleExport("report")}
            loading={loading}
            style={{ flex: 1 }}
          >
            Export Report
          </Button>
        </div>
      }
    >
      <div
        className="no-drag"
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div>
          <div
            style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}
          >
            Date range
          </div>
          <div style={{ textAlign: "center" }}>
            <RangePicker
              key={weekStart}
              style={{ width: "100%" }}
              value={range}
              onChange={(dates) => {
                if (dates && dates.length === 2 && dates[0] && dates[1]) {
                  setRange([dates[0], dates[1]]);
                } else {
                  setRange(getDefaultRange(weekStart));
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
        </div>

        <div>
          <div
            style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}
          >
            Week starts on
          </div>
          <Segmented
            block
            size="middle"
            value={weekStart}
            onChange={(value) => setWeekStart(value as WeekStart)}
            options={[
              { label: "Sunday", value: "sunday" },
              { label: "Monday", value: "monday" },
            ]}
          />
        </div>

        <div>
          <div
            style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}
          >
            Quick ranges
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            {presets.map(({ key, label, value }) => (
              <Button
                key={key}
                className="no-drag"
                size="small"
                onClick={() => setRange(value())}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
