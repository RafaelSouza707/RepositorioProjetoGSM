import React from "react";
import PropTypes from "prop-types";

const IconeUsuario = ({
  name,
  size = 30,
  bgColor = "#b60808ff",
  color = "#fff",
}) => {
  const getFirstLetter = () => {
    if (!name || typeof name !== "string" || name.trim() === "") {
      return "?";
    }
    return name.trim().charAt(0).toUpperCase();
  };

  const avatarStyle = {
    backgroundColor: bgColor,
    color,
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: size * 0.55,
    fontWeight: 700,
    lineHeight: 1, 
    userSelect: "none",
    flexShrink: 0,
  };

  return <div style={avatarStyle}>{getFirstLetter()}</div>;
};

IconeUsuario.propTypes = {
  name: PropTypes.string,
  size: PropTypes.number,
  bgColor: PropTypes.string,
  color: PropTypes.string,
};

export default IconeUsuario;
