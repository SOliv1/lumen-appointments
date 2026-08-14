import React from "react";
import { useAuth } from "../context/AuthContext";

interface RoleAwareTileProps {
  roleKey: "clinician" | "patient" | "admin";
  title: string;
  description: string;
  targetPath: string;
}

const RoleAwareTile: React.FC<RoleAwareTileProps> = ({
  roleKey,
  title,
  description,
  targetPath,
}) => {
  const { user } = useAuth();
  const isEnabled = user.role === roleKey;

  const handleClick = () => {
    if (!isEnabled) return;
    window.location.href = targetPath;
  };

  return (
    <section
      className={`splash-tile ${
        isEnabled ? "splash-tile-active" : "splash-tile-disabled"
      }`}
    >
      <p className="splash-status">
        {isEnabled ? "Available for this login" : "Not available"}
      </p>
      <h2>{title}</h2>
      <p>{description}</p>
      <button
        className={`splash-button ${
          isEnabled ? "splash-button-primary" : "splash-button-disabled"
        }`}
        disabled={!isEnabled}
        onClick={handleClick}
      >
        {isEnabled ? "Enter" : "Not available for this login"}
      </button>
    </section>
  );
};

export default RoleAwareTile;
