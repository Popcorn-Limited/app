import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

function Accordion({ children, header, initiallyOpen = false, containerClassName = "" }) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`group px-8 pt-6 pb-5 md:pl-11 bg-[#FAF9F4] md:rounded-3xl border border-[#F0EEE0] [&_summary::-webkit-details-marker]:hidden ${containerClassName}`}>
      <div className="flex flex-row items-center justify-between">
        {header}
        <ChevronDownIcon className={`hidden sm:block text-secondaryLight ml-10 h-5 w-5 flex-shrink-0 transition duration-300 ${isOpen ? 'rotate-180 transform' : ''}`} onClick={handleToggle} />
      </div>
      {isOpen && children}
    </div>
  );
}

export default Accordion;
