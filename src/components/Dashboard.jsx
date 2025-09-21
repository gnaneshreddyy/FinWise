import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState('1M');

  // Data adapted to match the image's style (cyan line for trend, teal bars for values)
  const data = {
    '1M': {
      labels: ['Aug 21', 'Aug 26', 'Aug 31', 'Sep 05', 'Sep 10', 'Sep 15', 'Sep 20'],
      datasets: [
        {
          type: 'line',
          label: 'Trend',
          data: [1.0, 1.2, 1.5, 1.8, 2.0, 2.2, 2.5],
          borderColor: '#00BCD4',
          backgroundColor: 'rgba(0, 188, 212, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          type: 'bar',
          label: 'Value',
          data: [1.0, 1.3, 1.6, 1.9, 2.1, 2.3, 2.6],
          backgroundColor: '#26A69A',
          borderColor: '#26A69A',
          borderWidth: 1,
        },
      ],
    },
    '3M': {
      labels: ['Jul 21', 'Aug 01', 'Aug 21', 'Sep 01', 'Sep 21'],
      datasets: [
        {
          type: 'line',
          label: 'Trend',
          data: [1.0, 1.5, 2.0, 2.3, 2.7],
          borderColor: '#00BCD4',
          backgroundColor: 'rgba(0, 188, 212, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          type: 'bar',
          label: 'Value',
          data: [1.0, 1.6, 2.1, 2.4, 2.8],
          backgroundColor: '#26A69A',
          borderColor: '#26A69A',
          borderWidth: 1,
        },
      ],
    },
    '6M': {
      labels: ['Apr 21', 'May 21', 'Jun 21', 'Jul 21', 'Aug 21', 'Sep 21'],
      datasets: [
        {
          type: 'line',
          label: 'Trend',
          data: [1.0, 1.4, 1.8, 2.1, 2.4, 2.7],
          borderColor: '#00BCD4',
          backgroundColor: 'rgba(0, 188, 212, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          type: 'bar',
          label: 'Value',
          data: [1.0, 1.5, 1.9, 2.2, 2.5, 2.8],
          backgroundColor: '#26A69A',
          borderColor: '#26A69A',
          borderWidth: 1,
        },
      ],
    },
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 3.0,
        title: { display: true, text: '' },
      },
      x: { title: { display: true, text: '' } },
    },
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Good Morning, Nishant</h2>
      <p>Sunday, September 21, 2025</p>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', color: '#757575' }}>TOTAL BALANCE</div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>₹3,49,904</div>
        <div style={{ marginTop: '10px' }}>
          <button onClick={() => setTimePeriod('1M')} style={{ marginRight: '10px', padding: '5px 10px', background: timePeriod === '1M' ? '#2196F3' : '#ddd', color: timePeriod === '1M' ? '#fff' : '#000', border: 'none', borderRadius: '5px' }}>1M</button>
          <button onClick={() => setTimePeriod('3M')} style={{ marginRight: '10px', padding: '5px 10px', background: timePeriod === '3M' ? '#2196F3' : '#ddd', color: timePeriod === '3M' ? '#fff' : '#000', border: 'none', borderRadius: '5px' }}>3M</button>
          <button onClick={() => setTimePeriod('6M')} style={{ padding: '5px 10px', background: timePeriod === '6M' ? '#2196F3' : '#ddd', color: timePeriod === '6M' ? '#fff' : '#000', border: 'none', borderRadius: '5px' }}>6M</button>
        </div>
        <div style={{ height: '250px', marginTop: '20px' }}>
          <Chart type="bar" data={data[timePeriod]} options={options} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', width: '45%' }}>
          <div style={{ fontSize: '14px', color: '#757575' }}>Latest Inflow</div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ background: '#4CAF50', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-block', marginRight: '10px' }}></span>
              <span>Bank Transfer</span>
              <span style={{ marginLeft: 'auto', color: '#4CAF50' }}>₹10,000</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ background: '#9C27B0', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-block', marginRight: '10px' }}></span>
              <span>Gift from Mom</span>
              <span style={{ marginLeft: 'auto', color: '#9C27B0' }}>₹5,000</span>
            </div>
          </div>
          <a href="#" style={{ color: '#2196F3', textDecoration: 'none', marginTop: '10px', display: 'block' }}>View More</a>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', width: '45%' }}>
          <div style={{ fontSize: '14px', color: '#757575' }}>Latest Outflow</div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ background: '#F44336', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-block', marginRight: '10px' }}></span>
              <span>Online Shopping</span>
              <span style={{ marginLeft: 'auto', color: '#F44336' }}>₹2,500</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ background: '#FF9800', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-block', marginRight: '10px' }}></span>
              <span>Restaurant</span>
              <span style={{ marginLeft: 'auto', color: '#FF9800' }}>₹1,200</span>
            </div>
          </div>
          <a href="#" style={{ color: '#2196F3', textDecoration: 'none', marginTop: '10px', display: 'block' }}>View More</a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;