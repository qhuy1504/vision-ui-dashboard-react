import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import LineChart from "../../../../examples/Charts/LineCharts/LineChart";
import { lineChartDataTaskRun } from "../../data/lineChartDataTaskRun";
import { lineChartOptionsTaskRun } from "../../data/lineChartOptionsTaskRun";

const TaskRunLineChart = ({ jobId }) => {
    const [chartData, setChartData] = useState([]);
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        async function fetchData() {
            const { data } = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/jobs/${jobId}/tasks/detail`,
                {
                    headers: {
                        "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY,
                    },
                }
            );
            const stats = data.taskRunStats || [];

            setChartData(lineChartDataTaskRun(stats));
            setChartOptions(lineChartOptionsTaskRun(stats));
        }

        fetchData();
    }, [jobId]);

    return (
        <div style={{ height: "300px" }}>
            <Chart type="line" series={chartData} options={chartOptions} width="100%" height="100%" />
        </div>
    );
};

export default TaskRunLineChart;
