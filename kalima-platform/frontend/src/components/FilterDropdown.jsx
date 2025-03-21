import { ChevronDown } from "lucide-react";

export function FilterDropdown({ label, options, selectedValue, onSelect }) {
  const handleSelect = (value) => {
    onSelect(value); // Pass the selected value to the parent
    // Close the dropdown by removing focus from the button
    document.activeElement?.blur();
  };

  return (
    <div className="text-right">
      <p className="mb-1 text-sm">{label}</p>
      <div className="dropdown dropdown-bottom dropdown-end w-full">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-outline w-full justify-between"
        >
          {selectedValue || label}
          <ChevronDown className="h-4 w-4" />
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full"
        >
          {options.map((option) => (
            <li key={option.value}>
              <button onClick={() => handleSelect(option.value)}>
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}