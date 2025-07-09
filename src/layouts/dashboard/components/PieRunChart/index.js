import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";

const PieRunChart = ({ jobId }) => {
    const [series, setSeries] = useState([]);
    const [options, setOptions] = useState({});
    const defaultStates = ["SCHEDULED", "RUNNING", "COMPLETED", "FAILED", "CRASHED", "PENDING"];

    useEffect(() => {
        async function fetchData() {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/jobs/${jobId}/tasks/detail`);
            const stats = data.flowRunStateStats || {};

            // Đảm bảo đủ trạng thái
            defaultStates.forEach((state) => {
                if (!stats[state]) stats[state] = 0;
            });

            const labels = defaultStates;
            const values = labels.map((key) => stats[key]);

            setSeries(values);
            setOptions({
                labels: labels,
                chart: {
                    type: "pie",
                },
                title: {
                    text: "Flow run theo trạng thái",
                    align: "center",

                    style: {
                        fontSize: "16px",
                        color: "#ffffff",
                    },
                },
                colors: ["#9b02c9", "#000dff", "#00c703", "#ff0000", "#8f7e00", "#ffd500"],
                legend: {
                    position: "bottom",
                    labels: {
                        colors: "#fff",
                    },
                },
                dataLabels: {
                    style: {
                        colors: ["#fff"],
                    },
                },
                tooltip: {
                    theme: "dark",
                },
            });
        }

        fetchData();
    }, [jobId]);

    return (
        <div style={{ height: "300px" }}>
            {series.length ? (
                <Chart options={options} series={series} type="donut" width="100%" height="100%" />
            ) : (
                <p>Đang tải biểu đồ...</p>
            )}
        </div>
    );
};

export default PieRunChart;
