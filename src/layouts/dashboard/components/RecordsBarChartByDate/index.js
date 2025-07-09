import React, { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import axios from "axios";

const RecordsBarChartByDate = () => {
    const [data, setData] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [chartOptions, setChartOptions] = useState({});
    const [chartSeries, setChartSeries] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/jobs/table-size`);
            console.log("Fetched data:", res.data);
            setData(res.data || []);
        }
        fetchData();
    }, []);

    // Lấy danh sách ngày duy nhất
    const uniqueDates = useMemo(() => {
        const dates = [...new Set(data.map(d => d.data_date))];
        return dates.sort(); // sắp xếp tăng dần
    }, [data]);
    
    

    useEffect(() => {
        if (!selectedDate || data.length === 0) {
            setChartSeries([]);
            console.warn("Chưa chọn ngày hoặc không có dữ liệu.");
            return;
          }

        const filtered = data
            .filter(d => d.data_date === selectedDate && d.records !== null)
            .map(d => ({
                ...d,
                records: parseInt(d.records, 10) || 0, // đảm bảo records là số
            }));
        
        if (!filtered ||filtered.length === 0) {
            setChartSeries([]);
            return;
          }

        const sorted = filtered.sort((a, b) => b.records - a.records).slice(0, 15); // top 15 bảng
      
        const tableNames = sorted.map(d => d.table_name);
      
        const records = sorted.map(d => d.records);
       

        setChartSeries([
            {
                name: "Số bản ghi",
                data: records,
            },
        ]);

        setChartOptions({
            chart: {
                type: "bar",
                height: 400,
                toolbar: { show: true },
            },
      
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 4,
                    barHeight: "70%",
                },
            },
            dataLabels: {
                enabled: true,
            },
            xaxis: {
                categories: tableNames,
                title: {
                    text: "Số bản ghi",
                    style: { color: "#ffffff", fontSize: "16px" },
                    
                },
                
                labels: {
                    style: {
                        colors: "#ffffff",
                        fontSize: "14px",
                    },
                },
            },
            yaxis: {
                labels: {
                    style: {
                        colors: "#ffffff",
                        fontSize: "14px",
                    },
                },
            },
            title: {
                text: `Top bảng theo số records - ${selectedDate}`,
                align: "left",
                style: {
                    color: "#ffffff",
                    fontSize: "16px",
                    fontWeight: 600,
                },
            },
            tooltip: {
                theme: "dark",
            },
        });
    }, [selectedDate, data]);

    return (
        <div>
            {/* Select ngày */}
            <select
                style={{ marginBottom: 10, padding: "6px 12px" }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
            >
                <option value="">-- Chọn ngày --</option>
                {uniqueDates.map((date) => (
                    <option key={date} value={date}>
                        {date}
                    </option>
                ))}
            </select>

            {/* Biểu đồ */}
            <div style={{ height: 400 }}>
                {chartSeries.length > 0 ? (
                    <Chart
                        options={chartOptions}
                        series={chartSeries}
                        type="bar"
                        height="100%"
                    />
                ) : (
                    <div style={{ color: "white", marginTop: 10 }}>
                        Không có dữ liệu cho ngày đã chọn.
                    </div>
                )}

            </div>
        </div>
    );
};

export default RecordsBarChartByDate;
