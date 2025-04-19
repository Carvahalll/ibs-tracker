import React from 'react';
import { NavItem } from '../types';
import { cn } from '../utils/cn';

interface BottomNavProps {
  items: NavItem[];
  activeItem: NavItem['id'];
  onItemClick: (id: NavItem['id']) => void;
  disabledItems?: NavItem['id'][]; // Optional array of disabled item IDs
}

const BottomNav: React.FC<BottomNavProps> = ({ items, activeItem, onItemClick, disabledItems = [] }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <ul className="flex justify-around items-center h-16">
        {items.map((item) => {
          const isDisabled = disabledItems.includes(item.id);
          return (
            <li key={item.id} className="flex-1 text-center">
              <button
                onClick={() => !isDisabled && onItemClick(item.id)}
                disabled={isDisabled}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full transition-colors duration-200",
                  isDisabled
                    ? "text-gray-300 cursor-not-allowed" // Style for disabled
                    : "text-gray-500 hover:text-indigo-600",
                  activeItem === item.id && !isDisabled && "text-indigo-600" // Active style only if not disabled
                )}
                aria-disabled={isDisabled}
                title={isDisabled ? `${item.label} (Logged Today)` : item.label} // Add title for disabled state
              >
                <item.icon className={cn(
                    "w-6 h-6 mb-1",
                    isDisabled ? "text-gray-300" : (activeItem === item.id ? "text-indigo-600" : "text-gray-500")
                 )} />
                <span className={cn(
                    "text-xs font-medium",
                     isDisabled ? "text-gray-300" : (activeItem === item.id ? "text-indigo-600" : "text-gray-500")
                )}>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
