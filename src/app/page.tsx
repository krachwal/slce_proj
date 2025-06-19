"use client";

import { useEffect, useState } from "react";

interface Advocate {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string; 
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
}

export default function Home() {
  const [advocates, setAdvocates] = useState([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Advocate; direction: "asc" | "desc" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.debug("fetching advocates...");
    fetch("/api/advocates").then((response) => {
      response.json().then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      });
    });
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase(); // Convert search term to lowercase
    setSearchTerm(searchTerm);

    console.debug("filtering advocates...");
    const filteredAdvocates = advocates.filter((advocate: Advocate) => {
      return (
        advocate.firstName.toLowerCase().includes(searchTerm) ||
        advocate.lastName.toLowerCase().includes(searchTerm) ||
        advocate.city.toLowerCase().includes(searchTerm) ||
        advocate.degree.toLowerCase().includes(searchTerm) ||
        advocate.specialties.some((specialty) => specialty.toLowerCase().includes(searchTerm)) ||
        (isNaN(Number(searchTerm))
          ? false
          : advocate.yearsOfExperience >= Number(searchTerm))
      );
    });

    setFilteredAdvocates(filteredAdvocates);
  };

  const onClick = () => {
    setSearchTerm("");
    setFilteredAdvocates(advocates);
  };

  const sort = (key: keyof Advocate) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredAdvocates].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredAdvocates(sortedData);
  };

  const formatPhoneNumber = (phoneNumber: number): string => {
    let phoneString = phoneNumber.toString();
    if (phoneString.length === 10) {
      return `${phoneString.slice(0, 3)}-${phoneString.slice(3, 6)}-${phoneString.slice(6)}`;
    }
    return phoneString;
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag); 
    const filteredByTag = advocates.filter((advocate: Advocate) => 
      advocate.specialties.includes(tag)
    );
    setFilteredAdvocates(filteredByTag);
  };

  return (
    <main className="text-stone-800" style={{ margin: "24px" }}>
      <h1 className="text-3xl font-bold text-left p-4 mb-0">
        Solace Advocates
      </h1>
      <div className="mb-2">
        <div className="flex items-center space-x-4 max-w-1/3">
          <input
  placeholder="search..."
  className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  value={searchTerm} 
  onChange={onChange}
/>
          <button className="bg-stone-500 hover:bg-stone-300 text-white font-bold py-1 px-2 rounded" onClick={onClick}>Reset Search</button>
        </div>
      </div>
      <table className="table-auto w-full border-collapse border-t border-b border-stone-200 font-sans">
        <thead>
          <tr className="bg-stone-100">
        <th className="text-left px-4 py-2 border-b border-stone-200 whitespace-nowrap cursor-pointer" onClick={() => sort("firstName")}>First Name</th>
        <th className="text-left px-4 py-2 border-b border-stone-200 whitespace-nowrap cursor-pointer" onClick={() => sort("lastName")}>Last Name</th>
        <th className="text-left px-4 py-2 border-b border-stone-200 whitespace-nowrap cursor-pointer" onClick={() => sort("city")}>City</th>
        <th className="text-left px-4 py-2 border-b border-stone-200 whitespace-nowrap">Degree</th>
        <th className="text-left px-4 py-2 border-b border-stone-200 whitespace-nowrap">Specialties</th>
        <th className="text-center px-4 py-2 border-b border-stone-200 whitespace-nowrap cursor-pointer" onClick={() => sort("yearsOfExperience")}>Years of Experience</th>
        <th className="text-left px-4 py-2 border-b border-stone-200 whitespace-nowrap cursor-pointer" onClick={() => sort("phoneNumber")}>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate: Advocate) => {
        return (
          <tr key={`${advocate.id}`} className="hover:bg-stone-50">
            <td className="text-left px-4 py-2 border-b border-stone-200">{advocate.firstName}</td>
            <td className="text-left px-4 py-2 border-b border-stone-200">{advocate.lastName}</td>
            <td className="text-left px-4 py-2 border-b border-stone-200">{advocate.city}</td>
            <td className="text-left px-4 py-2 border-b border-stone-200">{advocate.degree}</td>
            <td className="px-4 py-2 border-b border-stone-200">
          {advocate.specialties.map((s) => (
            <span
              key={`${s}`}
              className="inline-block bg-stone-100 text-stone-600 text-xs mr-2 px-2.5 py-0.5 rounded cursor-pointer hover:bg-stone-200"
              onClick={() => handleTagClick(s)}
            >
              {s}
            </span>
          ))}
            </td>
            <td className="text-center px-4 py-2 border-b border-stone-200">{advocate.yearsOfExperience}</td>
            <td className="text-left px-4 py-2 border-b border-stone-200">  {formatPhoneNumber(advocate.phoneNumber)}
            </td>
          </tr>
        );
          })}
        </tbody>
      </table>
    </main>
  );
}
