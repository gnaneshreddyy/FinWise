import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#82ca9d", "#FF6B6B", "#8884d8", "#ffc658", "#00C49F"];

const Insights = () => {
  const [data] = useState({
    incomeExpense: [
      { month: "Jan", income: 5000, expense: 3200 },
      { month: "Feb", income: 5200, expense: 4100 },
      { month: "Mar", income: 4800, expense: 3900 },
      { month: "Apr", income: 5500, expense: 4500 },
    ],
    categories: [
      { name: "Food", value: 1200 },
      { name: "Transport", value: 800 },
      { name: "Shopping", value: 1500 },
      { name: "Bills", value: 1000 },
      { name: "Other", value: 500 },
    ],
    comparison: [
      { name: "Jan", expense: 3200 },
      { name: "Feb", expense: 4100 },
      { name: "Mar", expense: 3900 },
      { name: "Apr", expense: 4500 },
    ],
    goal: [
      { name: "Target", value: 5000, fill: "#82ca9d" },
      { name: "Actual", value: 4500, fill: "#FF6B6B" },
    ],
  });

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#f5f7fb] min-h-screen">
      
      {/* Income vs Expenses */}
      <div className="bg-white shadow-md rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-2">Income vs Expenses</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.incomeExpense}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#82ca9d" />
            <Line type="monotone" dataKey="expense" stroke="#FF6B6B" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Spending Categories */}
      <div className="bg-white shadow-md rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-2">Spending Categories</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data.categories}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.categories.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Month-over-Month Comparison */}
      <div className="bg-white shadow-md rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-2">Month-over-Month Expenses</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.comparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="expense" fill="#8884d8" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Goal vs Actual */}
      <div className="bg-white shadow-md rounded-2xl p-4 flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-2">Goal vs Actual</h2>
        <ResponsiveContainer width="100%" height={250}>
          <RadialBarChart
            innerRadius="20%"
            outerRadius="100%"
            data={data.goal}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              minAngle={15}
              background
              clockWise
              dataKey="value"
            />
            <Legend
              iconSize={10}
              layout="vertical"
              verticalAlign="middle"
              align="right"
            />
            <Tooltip />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Insights;
