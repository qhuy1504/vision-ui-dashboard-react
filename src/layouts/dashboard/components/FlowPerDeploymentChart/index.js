import React, { useEffect, useState } from "react";
import BarChart from "../../../../examples/Charts/BarCharts/BarChart";
import axios from "axios";
import { barChartDataDeployment } from "../../data/barChartDataDeployment";
import { barChartOptionsDeployment } from "../../data/barChartOptionsDeployment";

const FlowPerDeploymentChart = ({ jobId }) => {
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
            const flowPerDeployment = data.flowPerDeployment || {}; // Object như bạn đã log
            console.log("FlowPerDeploymentChart data:", flowPerDeployment);
            
            setChartData(barChartDataDeployment(flowPerDeployment));
            setChartOptions(barChartOptionsDeployment(flowPerDeployment));
        }

        fetchData();
    }, [jobId]);
    

    return (
        <div style={{ height: "300px" }}>
            <BarChart
                barChartData={chartData.length ? chartData : []}
                barChartOptions={Object.keys(chartOptions).length ? chartOptions : {}}
            />

        </div>
    );
};

export default FlowPerDeploymentChart;
