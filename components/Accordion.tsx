import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export function Accordion({ children, header, initiallyOpen = false, containerClassName = "" }) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (<>
    <div>
      {/* Desktop */}
      <div
        className={`group px-8 pt-6 pb-5 bg-[#FAF9F4] rounded-3xl border border-[#F0EEE0] [&_summary::-webkit-details-marker]:hidden ${containerClassName} hidden md:block`}
      >
        <div className="flex flex-row items-center justify-between">
          {header}
          <ChevronDownIcon className={`hidden sm:block text-secondaryLight ml-10 h-5 w-5 cursor-pointer flex-shrink-0 transition duration-300 ${isOpen ? 'rotate-180 transform' : ''}`}
            onClick={handleToggle} />
        </div>
        {isOpen && children}
      </div>
      {/* Mobile */}
      <div className={`group px-8 pt-6 pb-5 bg-[#FAF9F4] border border-[#F0EEE0] [&_summary::-webkit-details-marker]:hidden ${containerClassName} md:hidden`}
        onClick={handleToggle}
      >
        <div className="flex flex-col items-center justify-between">
          {header}
        </div>
        {isOpen && children}
      </div>
    </div >
  </>
  );
}


export default Accordion;
