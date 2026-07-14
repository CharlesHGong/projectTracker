import React, { useEffect, useState } from "react";
import { Input } from "antd";
import { usePageStore } from "../store";

type ActiveLogDescriptionInputProps = {
  style?: React.CSSProperties;
};

export const ActiveLogDescriptionInput = ({
  style,
}: ActiveLogDescriptionInputProps) => {
  const activeLogDescription = usePageStore(
    (state) => state.activeLogDescription
  );
  const setActiveLogDescription = usePageStore(
    (state) => state.setActiveLogDescription
  );
  const [description, setDescription] = useState(activeLogDescription);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDescription(activeLogDescription);
    }
  }, [activeLogDescription, isEditing]);

  const saveDescription = () => {
    setActiveLogDescription(description.trim());
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Input
        className="no-drag"
        autoFocus
        size="small"
        placeholder="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        onBlur={saveDescription}
        onPressEnter={(event) => event.currentTarget.blur()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setDescription(activeLogDescription);
            setIsEditing(false);
          }
        }}
        style={{ width: "100%", minWidth: 0, ...style }}
      />
    );
  }

  const displayedDescription = activeLogDescription.trim();

  return (
    <div
      className="active-log-description no-drag"
      onClick={() => setIsEditing(true)}
      style={style}
      title={displayedDescription}
    >
      {displayedDescription || (
        <span className="active-log-description-empty">-</span>
      )}
    </div>
  );
};
