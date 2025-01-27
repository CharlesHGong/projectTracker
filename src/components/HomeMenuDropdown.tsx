import React, { ReactNode, useMemo, useState } from "react";
import { Checkbox, Dropdown, Slider } from "antd";
import { usePageStore } from "../store";
import { TimeRangeOption, rangeLabelMap } from "../types";
import { DownloadLogsModal } from "./DownloadLogsModal";

const primaryColorStyle = {
  background: "#1989fa",
  color: "#fff",
};

const TransparencySlider = () => {
  const bgAlpha = usePageStore((s) => s.bgAlpha);
  return (
    <Slider
      value={bgAlpha}
      max={1}
      min={0.1}
      style={{ width: 100 }}
      step={0.1}
      onChange={(e) => usePageStore.getState().setBgAlpha(e)}
    />
  );
};

export const HomeMenuDropdown = ({ children }: { children: ReactNode }) => {
  const [downLoadModalOpen, setDownloadModalOpen] = useState(false);
  const handleDownloadModalClose = () => setDownloadModalOpen(false);

  const [open, setOpen] = useState(false);
  const projectNames = usePageStore((state) => state.projectNames);
  const range = usePageStore((state) => state.range);
  const selectedProjectNames = usePageStore(
    (state) => state.selectedProjectNames
  );

  const menuItems = useMemo(() => {
    const projectsMenu = {
      key: "projects",
      label: "Projects",
      popupClassName: "no-drag",
      children: [
        ...projectNames.map((name) => ({
          key: `projects-${name}`,
          label: name,
          extra: <Checkbox checked={selectedProjectNames.includes(name)} />,
        })),
      ],
    };

    const timeRangeMenu = {
      key: "timeRange",
      label: "Time Range",
      popupClassName: "no-drag",
      children: Object.entries(rangeLabelMap).map(([k, v]) => ({
        key: `range-${k}`,
        label: v,
        extra: k === range && <span style={{ color: "#1989fa" }}>✓</span>,
      })),
    };
    const downloadMenu = {
      key: "download",
      label: "Download",
      style: primaryColorStyle,
    };
    const bgAlpha = {
      key: "bgAlpha",
      label: "Transparency",
      popupClassName: "no-drag",
      children: [
        {
          key: "bgAlpha-slider",
          label: "",
          icon: <TransparencySlider />,
        },
      ],
    };
    return [projectsMenu, timeRangeMenu, bgAlpha, downloadMenu];
  }, [projectNames, selectedProjectNames, range]);

  const handleSelect = async ({ key }: { key: string }) => {
    if (key === "download") {
      setDownloadModalOpen(true);
    } else if (key.startsWith("projects")) {
      const projectName = key.split("-").slice(1).join('-');
      const isInsert = !selectedProjectNames.includes(projectName);
      const updatedSelectedProjectNames = isInsert
        ? [...selectedProjectNames, projectName]
        : selectedProjectNames.filter((project) => project !== projectName);
      usePageStore.setState({
        selectedProjectNames: updatedSelectedProjectNames,
      });
      usePageStore.getState().loadProjects();
    } else if (key.startsWith("range")) {
      usePageStore.setState({ range: key.split("-")[1] as TimeRangeOption });
      usePageStore.getState().loadProjects();
    }
  };

  return (
    <>
      {downLoadModalOpen && (
        <DownloadLogsModal onClose={handleDownloadModalClose} />
      )}
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        placement="bottomRight"
        trigger={["click"]}
        overlayClassName="no-drag"
        menu={{
          items: menuItems,
          onClick: (e) => handleSelect(e),
          triggerSubMenuAction: "click",
        }}
      >
        {children}
      </Dropdown>
    </>
  );
};
