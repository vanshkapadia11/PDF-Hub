import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="text-white bg-[#fff8f0] py-12 flex justify-center items-center backdrop-blur-3xl">
        <div className="text-center">
          {/* "PDF Hub" text styled to match the subtle, ghosted effect */}
          <h2 className="md:text-9xl text-6xl uppercase cursor-pointer font-extrabold tracking-tighter text-zinc-500 blur-sm hover:blur-none transition-blur duration-500">
            PDF Hub
          </h2>
        </div>
      </footer>
    </>
  );
};

export default Footer;
