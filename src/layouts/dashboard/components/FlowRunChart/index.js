import React, { useEffect, useState } from "react";
import BarChart from "../../../../examples/Charts/BarCharts/BarChart";
import { barChartDataDashboardPre } from "../../data/barChartDataPre";
import { barChartOptionsDashboardPre } from "../../data/barChartOptionsPre";
import axios from "axios";

const FlowRunChart = ({ jobId }) => {
    const [chartData, setChartData] = useState([]);
    const [chartOptions, setChartOptions] = useState({});
    const defaultStates = ["SCHEDULED", "RUNNING", "COMPLETED", "FAILED", "CRASHED", "PENDING"];

   
    
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
            console.log("FlowRunChart data:", data);
            const stats = data.flowRunStateStats || {};
            

            // Bổ sung trạng thái còn thiếu = 0
            defaultStates.forEach((state) => {
                if (!stats[state]) stats[state] = 0;
            });
            setChartData(barChartDataDashboardPre(stats));
            setChartOptions(barChartOptionsDashboardPre(stats));
        }

        fetchData();
    }, [jobId]);

 

    return (
        <div style={{ height: "300px" }}>
            <BarChart barChartData={chartData} barChartOptions={chartOptions} />
        </div>
    );
};

export default FlowRunChart;
