import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="text-white bg-gray-50 py-12 flex justify-center items-center backdrop-blur-3xl">
        <div className="text-center">
          {/* "PDF Hub" text styled to match the subtle, ghosted effect */}
          <h2 className="text-6xl uppercase cursor-pointer font-extrabold tracking-tighter text-gray-300 opacity-20 hover:opacity-50 transition-opacity backdrop-blur-3xl duration-300">
            PDF Hub
          </h2>
        </div>
      </footer>
    </>
  );
};

export default Footer;
