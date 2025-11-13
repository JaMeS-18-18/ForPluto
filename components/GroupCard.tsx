import React, { useState } from "react";

interface Report {
  id: number;
  title: string;
}

interface GroupCardProps {
  groupName: string;
  reports: Report[];
}

export const GroupCard: React.FC<GroupCardProps> = ({ groupName, reports }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center min-h-[120px] transition-transform hover:scale-105 hover:shadow-xl cursor-pointer">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-4 tracking-wide text-center">
        {groupName}
      </h2>
      <div className="flex flex-col items-center gap-4 w-full">
        
        {open && (
          <div className="mt-2 w-full flex flex-col items-center gap-2">
            {reports.length === 0 ? (
              <p className="text-gray-400 italic">Xisobotlar yo‘q</p>
            ) : (
              <ul className="list-none p-0 m-0 w-full flex flex-col gap-2">
                {reports.map((report) => (
                  <li key={report.id} className="py-2 px-4 rounded-xl bg-gray-100 text-gray-800 font-semibold w-full text-center border border-gray-200">
                    {report.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
