export const lineChartOptionsTaskRun = (taskRunStats) => {
    const entries = Object.entries(taskRunStats)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]));

    return {
        chart: {
            type: "line",
            toolbar: { show: false },
        },
        title: {
            text: "Tổng số Task run theo ngày",
            align: "center",

            style: {
                fontSize: "16px",
                color: "black",
                fontFamily: "Noto Sans, sans-serif",
            },
        },
        xaxis: {
            categories: entries.map(([date]) => date),
            labels: {
                style: {
                    colors: "black",
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: "black",
                },
            },
        },
        tooltip: {
            theme: "dark",
        },
        stroke: {
            curve: "smooth",
        },
        grid: {
            borderColor: "#444",
        },
    };
};
  