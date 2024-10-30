import React, { useEffect, useState } from "react";
import { Popover, Checkbox, Button } from "antd";
import { usePageStore } from "../store";

export const ProjectSelect = ({ children }) => {
  const [visible, setVisible] = useState(false);

  const projectNames = usePageStore((state) => state.projectNames);
  const selectedProjectNames = usePageStore(
    (state) => state.selectedProjectNames
  );

  const handleVisibleChange = (visible) => {
    setVisible(visible);
  };

  const handleCheckboxChange = (projectName, checked) => {
    const { selectedProjectNames } = usePageStore.getState();
    const updatedSelectedProjectNames = checked
      ? [...selectedProjectNames, projectName]
      : selectedProjectNames.filter((project) => project !== projectName);
    usePageStore.setState({
      selectedProjectNames: updatedSelectedProjectNames,
    });
  };

  const content = (
    <div className="no-drag">
      <div>Selected Projects</div>
      {projectNames.map((project) => (
        <div key={project} style={{ marginBottom: "8px" }}>
          <Checkbox
            checked={selectedProjectNames.includes(project)}
            onChange={(e) => handleCheckboxChange(project, e.target.checked)}
          >
            {project}
          </Checkbox>
        </div>
      ))}
      <Button
        type="primary"
        size="small"
        onClick={() => {
          usePageStore.getState().loadProjects();
          setVisible(false);
        }}
      >
        Confirm
      </Button>
    </div>
  );

  return (
    <Popover
      placement="bottomRight"
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
