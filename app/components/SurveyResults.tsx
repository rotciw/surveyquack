import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function SurveyResults({ data }: { data: { labels: string[], values: number[] } }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Responses",
        data: data.values,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <div>
      <h2>Survey Results</h2>
      <Bar data={chartData} />
    </div>
  );
}
