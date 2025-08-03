import React, { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import _ from "lodash";
import colors from "assets/theme/base/colors";

const LineChartTableSize = () => {
    const [data, setData] = useState([]);
    const [selectedTable, setSelectedTable] = useState("");
    const [selectedOption, setSelectedOption] = useState("");
    const [chartSeries, setChartSeries] = useState([]);
    const [chartOptions, setChartOptions] = useState({});
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);

    useEffect(() => {
        async function fetchData() {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/jobs/table-size`,
                {
                    headers: {
                        "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY,
                    },
                }
            );
            setData(res.data || []);
        }
        fetchData();
    }, []);

    const tableNames = useMemo(
        () => [...new Set(data.map((d) => d.table_name))],
        [data]
    );

    const monthList = useMemo(() => {
        if (!selectedTable) return [];
        const filtered = data.filter((d) => d.table_name === selectedTable);
        const months = [...new Set(filtered.map((d) => d.data_date.slice(0, 7)))];
        return months.sort();
    }, [data, selectedTable]);

    useEffect(() => {
        if (!selectedTable || !selectedOption) return;

        const filtered = data
            .filter((d) => d.table_name === selectedTable)
            .sort((a, b) => new Date(a.data_date) - new Date(b.data_date));

        const byMonth = _.groupBy(filtered, (d) => d.data_date.slice(0, 7));

        let start = null;
        let end = null;
        let label = "";
        

        if (selectedOption.startsWith("month:")) {
            const month = selectedOption.replace("month:", "");
            const records = byMonth[month];
           
            if (!records || records.length < 2) return;
            start = records[0];
            end = records.length > 1 ? records[records.length - 1] : start;
            label = `Thời gian ${month}`;
        }

        if (selectedOption === "latest:start") {
            const today = new Date().toISOString().slice(0, 10);
           
            const latestMonth = monthList[monthList.length - 1];
            const records = byMonth[latestMonth];
            if (!records || records.length < 1) return;
            start = records[0];
           
            const sorted = records
                .filter((r) => r.data_date <= today)
                .sort((a, b) => b.data_date.localeCompare(a.data_date)); // sort giảm dần
            end = sorted.length > 1 ? sorted[0] : null;
            label = `Thời gian gần nhất: ${latestMonth}`;
        }

        setStartPoint(start);
        setEndPoint(end);

        const chartData = [
            {
                color: "black",
                x: start?.data_date ,
                y: start?.size_mb,
            },
        ];

        if (end) {
            chartData.push({
                x: end?.data_date ,
                y: end?.size_mb,
            });
        }

        setChartSeries([
            {
                name: "Size (MB)",
                data: chartData,
            },
        ]);

        setChartOptions({
            chart: {
                id: "compare-chart",
                type: "line",
                toolbar: { show: true },
            },
            xaxis: {
                type: "category",
                title: {
                    text: "Thời điểm", style: {
                        color: "black",
                        fontSize: "14px", // tuỳ chỉnh thêm nếu cần
                        fontWeight: 600,  // tuỳ chỉnh thêm
                    },
                },
                labels: {
                    style: {
                      
                        fontSize: "14px",
                        fontWeight: 600,  
                    },
                  },
            },
            yaxis: {
                title: {
                    text: "Dung lượng (MB)", style: {
                        
                        fontSize: "14px", 
                        fontWeight: 600,  
                    },
                },
                labels: {
                    style: {
                       
                        fontSize: "14px",
                        fontWeight: 600,  
                    },
                  },
            },
            title: {
                text: `${label} - ${selectedTable}`,
                align: "left",
                style: {
                    color: "black",
                    fontSize: "16px", // tuỳ chỉnh thêm nếu cần
                    fontWeight: 600,  // tuỳ chỉnh thêm
                },
            },
            markers: { size: 5 },
            annotations: {
                points: [
                    ...(start
                        ? [
                            {
                                x: start.data_date + " (Đầu tháng)",
                                y: start.size_mb,
                                marker: {
                                    size: 6,
                                    fillColor: "#00e396",
                                },
                                label: {
                                    borderColor: "#00e396",
                                    style: {
                                        
                                        background: "#00e396",
                                    },
                                    text: "Đầu tháng",
                                },
                            },
                        ]
                        : []),
                    ...(end
                        ? [
                            {
                                x: end.data_date + " (Cuối tháng)",
                                y: end.size_mb,
                                marker: {
                                    size: 6,
                                    fillColor: "#FF4560",
                                },
                                label: {
                                    
                                    borderColor: "#FF4560",
                                    style: {
                                       
                                        background: "#FF4560",
                                    },
                                    text: "Cuối tháng",
                                },
                            },
                        ]
                        : []),
                ],
            },
        });
    }, [selectedTable, selectedOption, data, monthList]);

    return (
        <div>
            {/* Select 1: Chọn bảng */}
            <select
                style={{ margin: "0 10px 10px 0", padding: "5px 10px" }}
                value={selectedTable}
                onChange={(e) => {
                    setSelectedTable(e.target.value);
                    setSelectedOption("");
                    setChartSeries([]);
                    setStartPoint(null);
                    setEndPoint(null);
                }}
            >
                <option value="">-- Chọn bảng --</option>
                {tableNames.map((name) => (
                    <option key={name} value={name}>
                        {name}
                    </option>
                ))}
            </select>

            {/* Select 2: Chọn tháng */}
            {selectedTable && (
                <select
                    style={{ marginBottom: 20, padding: "5px 10px" }}
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                >
                    <option value="">-- Chọn kiểu so sánh --</option>
                    {monthList.map((month) => (
                        <option key={month} value={`month:${month}`}>
                            {month} - cuối tháng vs đầu tháng
                        </option>
                    ))}
                    <option value="latest:start">
                        {monthList[monthList.length - 1]} gần nhất - đầu tháng
                    </option>
                </select>
            )}

            {/* Chart */}
            <div style={{ height: "300px" }}>
                <Chart
                    type="line"
                    series={chartSeries}
                    options={chartOptions}
                    width="100%"
                    height="100%"
                />
            </div>

            {/* Chênh lệch */}
            {startPoint && endPoint && (
                <div style={{  marginTop: 10 }}>
                    <strong>Chênh lệch:</strong>{" "}
                    {(endPoint.size_mb - startPoint.size_mb).toFixed(2)} MB
                </div>
            )}
            {startPoint && !endPoint && (
                <div style={{ marginTop: 10 }}>
                    <strong>Dung lượng đầu tháng:</strong> {startPoint.size_mb} MB
                </div>
            )}
        </div>
    );
};

export default LineChartTableSize;
