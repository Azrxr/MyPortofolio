import React, { useState } from 'react';

const TechStackIcon = ({ TechStackIcon, Language }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const src = TechStackIcon || "";

  return (
    <div className="group p-6 rounded-2xl bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-3 hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-50 blur transition duration-300"></div>
        {!imgFailed && src ? (
          <img
            src={src}
            alt={`${Language} icon`}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="relative h-16 w-16 md:h-20 md:w-20 transform transition-transform duration-300 object-contain"
          />
        ) : (
          <div className="relative h-16 w-16 md:h-20 md:w-20 flex items-center justify-center rounded-full bg-white/5 text-sm text-white font-semibold">
            {Language ? Language.split(' ').map(s => s[0]).slice(0,2).join('') : '?'}
          </div>
        )}
      </div>
      <span className="text-slate-300 font-semibold text-sm md:text-base tracking-wide group-hover:text-white transition-colors duration-300">
        {Language}
      </span>
    </div>
  );
};

export default TechStackIcon;