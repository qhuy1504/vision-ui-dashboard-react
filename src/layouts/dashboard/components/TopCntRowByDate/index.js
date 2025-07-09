import React, { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import _ from "lodash";

const TopCntRowByDate = () => {
    const [data, setData] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [chartOptions, setChartOptions] = useState({});
    const [chartSeries, setChartSeries] = useState([]);

    useEffect(() => {
        (async () => {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/jobs/table-etl-log`);
            setData(res.data || []);
        })();
    }, []);

    const uniqueDates = useMemo(
        () => Array.from(new Set(data.map((d) => d.data_date))),
        [data]
    );

    useEffect(() => {
        if (!selectedDate) {
            setChartSeries([]);
            return;
        }

        // 1. Lọc theo ngày và cnt_row !== null
        const daily = data
            .filter((d) => d.data_date === selectedDate && d.cnt_row != null)
            .map((d) => ({ ...d, cnt_row: parseInt(d.cnt_row, 10) || 0 }));

        // 2. Gom nhóm theo table_name, chọn bản ghi có cnt_row lớn nhất
        const grouped = _.chain(daily)
            .groupBy("table_name")
            .map((arr, table) => ({
                table_name: table,
                cnt_row: Math.max(...arr.map((r) => r.cnt_row)),
            }))
            .value();

        if (grouped.length === 0) {
            setChartSeries([]);
            return;
        }

        // 3. Top 15
       
        const top15 = grouped.sort((a, b) => b.cnt_row - a.cnt_row).slice(0, 15);
        const names = top15.map((d) => d.table_name);
        const values = top15.map((d) => d.cnt_row);
      

        setChartSeries([{ name: "Count Rows", data: values }]);
        setChartOptions({
            chart: { type: "bar", toolbar: { show: true } },
            plotOptions: {
                bar: { vertical: true, borderRadius: 4, barHeight: "70%" },
            },
            dataLabels: { enabled: true, style: { colors: ["black"] } },
            xaxis: {
                categories: names,
                title: { text: "CNT_ROW", style: { color: "black" } },
                labels: { style: { colors: "black", fontSize: "14px" } },
            },
            yaxis: { labels: { style: { colors: "black", fontSize: "14px" } } },
            title: {
                text: `Top 15 CNT_ROW - ${selectedDate}`,
                style: { color: "black", fontSize: "16px" },
                align: "left",
            },
            tooltip: { theme: "dark" },
            grid: { borderColor: "#444" },
        });
    }, [selectedDate, data]);

    return (
        <div style={{ marginBottom: 24 }}>
            <label style={{ color: "black", marginRight: 8 }}>Chọn ngày:</label>
            <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: 4 }}
            >
                <option value="">-- Chọn ngày --</option>
                {uniqueDates.map((d) => (
                    <option key={d} value={d}>{d}</option>
                ))}
            </select>

            {chartSeries.length > 0 ? (
                <Chart
                    options={chartOptions}
                    series={chartSeries}
                    type="bar"
                    height={400}
                />
            ) : (
                    <div style={{ color: "black", marginTop: 10 }}>
                    {selectedDate ? "Không có dữ liệu." : "Hãy chọn ngày để xem biểu đồ."}
                </div>
            )}
        </div>
    );
};

export default TopCntRowByDate;
