import React, { useEffect, useState } from "react";
import { Popover, Checkbox } from "antd";
import { usePageStore } from "../store";

export const ProjectSelect = ({ children }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    usePageStore.getState().getProjectNames();
  }, []);

  const projectNames = usePageStore((state) => state.projectNames);
  const selectedProjectNames = usePageStore(
    (state) => state.selectedProjectNames
  );

  const handleVisibleChange = (visible) => {
    setVisible(visible);
  };

  const handleCheckboxChange = (projectName, checked) => {
    const updatedSelectedProjectNames = checked
      ? [...selectedProjectNames, projectName]
      : selectedProjectNames.filter((project) => project !== projectName);
    usePageStore.setState({
      selectedProjectNames: updatedSelectedProjectNames,
    });
  };

  const content = (
    <div>
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
    </div>
  );

  return (
    <Popover
      content={content}
      title="Select Projects"
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibleChange}
    >
      {children}
    </Popover>
  );
};
