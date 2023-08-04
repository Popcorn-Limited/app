import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

function Accordion({ children, header, initiallyOpen, containerClassName }: { children, header, initiallyOpen?: boolean, containerClassName?: string }) {
  return (
    <Popover
      className={`group px-8 pt-6 pb-5 md:pl-11 bg-[#FAF9F4] md:rounded-3xl border border-[#F0EEE0] [&_summary::-webkit-details-marker]:hidden ${containerClassName}`}
    >
      {({ open }) => (
        <>
          <Popover.Button
            className="block w-full cursor-pointer marker:hidden active:outline-none focus:outline-none">
            <div className="flex flex-row items-center justify-between">
              {header}
              <ChevronDownIcon className={`hidden md:block text-secondaryLight ml-10 h-5 w-5 flex-shrink-0 transition duration-300 ${open ? 'rotate-180 transform' : ''}`} />
            </div>
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Popover.Panel>
              {children}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover >
  );
}

export default Accordion;