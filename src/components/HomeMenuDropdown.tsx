import React, { ReactNode, useMemo, useState } from "react";
import { Button, Checkbox, Popover, Slider } from "antd";
import { usePageStore } from "../store";
import { TimeRangeOption, rangeLabelMap } from "../types";
import { DownloadLogsModal } from "./DownloadLogsModal";

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: "#f0f0f0",
  margin: "4px 0",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#666",
  marginBottom: 6,
};

const TransparencySlider = () => {
  const bgAlpha = usePageStore((s) => s.bgAlpha);
  return (
    <Slider
      value={bgAlpha}
      max={1}
      min={0.1}
      style={{ width: "100%", margin: 0 }}
      step={0.1}
      onChange={(e) => usePageStore.getState().setBgAlpha(e)}
    />
  );
};

export const HomeMenuDropdown = ({ children }: { children: ReactNode }) => {
  const [downLoadModalOpen, setDownloadModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const projectNames = usePageStore((state) => state.projectNames);
  const range = usePageStore((state) => state.range);
  const selectedProjectNames = usePageStore(
    (state) => state.selectedProjectNames
  );

  const toggleProject = (projectName: string) => {
    const isInsert = !selectedProjectNames.includes(projectName);
    const updatedSelectedProjectNames = isInsert
      ? [...selectedProjectNames, projectName]
      : selectedProjectNames.filter((project) => project !== projectName);
    usePageStore.setState({
      selectedProjectNames: updatedSelectedProjectNames,
    });
    usePageStore.getState().loadProjects();
  };

  const handleRangeChange = (nextRange: TimeRangeOption) => {
    usePageStore.setState({ range: nextRange });
    usePageStore.getState().loadProjects();
    setOpen(false);
  };

  const handleDownloadClick = () => {
    setOpen(false);
    setDownloadModalOpen(true);
  };

  const popoverContent = useMemo(
    () => (
      <div
        className="no-drag"
        style={{
          width: 240,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div style={sectionTitleStyle}>Projects</div>
          <div
            style={{
              maxHeight: 180,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {projectNames.map((name) => (
              <label
                key={name}
                className="no-drag"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={selectedProjectNames.includes(name)}
                  onChange={() => toggleProject(name)}
                />
                <span>{name}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={dividerStyle} />

        <div>
          <div style={sectionTitleStyle}>Time Range</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Object.entries(rangeLabelMap).map(([key, label]) => (
              <Button
                key={key}
                className="no-drag"
                size="small"
                type={key === range ? "primary" : "default"}
                onClick={() => handleRangeChange(key as TimeRangeOption)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div style={dividerStyle} />

        <div>
          <div style={sectionTitleStyle}>Transparency</div>
          <TransparencySlider />
        </div>

        <div style={dividerStyle} />

        <Button
          className="no-drag"
          size="small"
          type="primary"
          onClick={handleDownloadClick}
        >
          Download
        </Button>
      </div>
    ),
    [projectNames, range, selectedProjectNames]
  );

  return (
    <>
      {downLoadModalOpen && (
        <DownloadLogsModal onClose={() => setDownloadModalOpen(false)} />
      )}
      <Popover
        open={open}
        onOpenChange={setOpen}
        placement="bottomRight"
        trigger="click"
        content={popoverContent}
        overlayClassName="no-drag"
      >
        {children}
      </Popover>
    </>
  );
};
