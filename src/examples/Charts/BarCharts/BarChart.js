import React from "react";
import Chart from "react-apexcharts";

const BarChart = ({ barChartData, barChartOptions }) => {
  if (!barChartData || !Array.isArray(barChartData) || barChartData.length === 0) {
    return <p>Đang tải biểu đồ hoặc không có dữ liệu</p>;
  }
  
  return (
    <Chart
      options={barChartOptions}
      series={barChartData}
      type="bar"
      width="100%"
      height="100%"
    />
  );
};

export default BarChart;
