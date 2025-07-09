export const barChartOptionsDashboardPre = () => ({
    chart: {
        type: "bar",
        toolbar: { show: false },
    },
    title: {
        text: "Tổng số Flow run theo trạng thái",
        align: "center",

        style: {
            fontSize: "16px",
            color: "black",
            fontFamily: "Arial, sans-serif",
        },
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: "45%",
            borderRadius: 5,
            distributed: true, // 💥 Đây là điểm mấu chốt
        },
    },
    legend: {
        show: true,
        position: "bottom",
        labels: {
            colors: Array(6).fill("black"),
        },
        fontSize: "14px",
        fontWeight: 400,
    },
      
    dataLabels: {
        enabled: false,
    },
    xaxis: {
        categories: [
            "SCHEDULED",
            "RUNNING",
            "COMPLETED",
            "FAILED",
            "CRASHED",
            "PENDING",
        ],
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
    colors: [
        "#775DD0", // SCHEDULED
        "#008FFB", // RUNNING
        "#00E396", // COMPLETED
        "#FEB019", // FAILED
        "#FF4560", // CRASHED
        "#3F51B5", // PENDING
    ],
    grid: {
        borderColor: "#444",
    },
    tooltip: {
        theme: "dark",
    },
});
  