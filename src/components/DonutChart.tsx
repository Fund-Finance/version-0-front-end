"use client";
import { PieChart, Pie, Cell } from "recharts";
import { useEffect, useState } from "react";

interface DonutChartProps
{
    data: {name:string, value:number, color:string}[] 
    customHover:boolean
    lines:string[]
}

const DonutChart = ({data, customHover, lines}: DonutChartProps) => {
  const [isClient, setIsClient] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsClient(true); // ensures this runs only in the browser
  }, []);

  if (!isClient) return null;
  return (
    <div
      className="relative w-[220px] h-[220px] rounded-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* The donut hole circle matching innerRadius */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 flex items-center justify-center"
        style={{
          width: 220, // innerRadius 80 * 2
          height: 220,
        }}
      >
        <div className="text-center">
          <p className="text-xl text-black fade-transition">{lines[0]}</p>
          <p className="text-xl text-black fade-transition">{lines[1]}</p>
        </div>
      </div>
      {!customHover && (
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            isHovered
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <PieChart width={220} height={220}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={100}
              outerRadius={110}
              startAngle={90} // start at 12 o'clock
              endAngle={-270.5}
              dataKey="value"
              isAnimationActive={false}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </div>
      )}
      {customHover && (
        <PieChart width={220} height={220}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={110}
            startAngle={90} // start at 12 o'clock
            endAngle={-270.5}
            dataKey="value"
            isAnimationActive={false}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      )}
    </div>
  );
};

export default DonutChart;
