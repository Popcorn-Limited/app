import { Dispatch, FC } from "react";

export interface TabsProps {
  available: string[];
  active: [string[], Dispatch<string[]>];
}

export const Tabs: FC<TabsProps> = ({ available, active }) => {
  const [activeTabs, setActiveTabs] = active;
  const allSelected = activeTabs.length === available.length;

  function handleSelect(tab: string) {
    let newTabs = allSelected ? [] : [...activeTabs];
    if (newTabs.includes(tab)) {
      newTabs = newTabs.filter((t) => t !== tab);
      if (newTabs.length === 0) {
        newTabs = available;
      }
    } else {
      newTabs.push(tab);
    }

    setActiveTabs(newTabs);
  }

  return (
    <div className="flex gap-4">
      <Tab isActive={allSelected} onClick={() => setActiveTabs(available)}>
        All
      </Tab>
      {available.map((tab) => (
        <Tab
          key={`tab-item-${tab}`}
          isActive={!allSelected && activeTabs.includes(tab)}
          onClick={() => handleSelect(tab)}
        >
          {tab}
        </Tab>
      ))}
    </div>
  );
};

const Tab = ({ isActive, onClick, children }) => (
  <button
    className={`flex items-center justify-center rounded-3xl py-2.5 px-5 text-base leading-6 font-normal border
    ${isActive ? "border-primaryLight bg-primaryLight text-white" : "bg-white border-[#d7d7d799]"}`}
    onClick={onClick}
  >
    {children}
  </button>
);
