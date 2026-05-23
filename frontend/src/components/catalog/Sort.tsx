"use client";

interface SortProps {
  onSortChange: (sort: string) => void;
  currentSort: string;
}

export default function Sort({ onSortChange, currentSort }: SortProps) {
  return (
    <select 
      className="bg-transparent border-none font-black text-gray-900 outline-none cursor-pointer text-sm"
      value={currentSort}
      onChange={(e) => onSortChange(e.target.value)}
    >
      <option value="recommended">Recommended</option>
      <option value="price_low">Price: Low to High</option>
      <option value="price_high">Price: High to Low</option>
    </select>
  );
}
