export const barChartOptionsDeployment = (dataObject) => {
    return {
        chart: {
            type: "bar",
            toolbar: { show: false },
        },
        title: {
            text: "Tổng số Flow theo Deployment", 
            align: "center",
            
            style: {
                fontSize: "16px",
                color: "black",
            },
        },
        xaxis: {
            categories: Object.keys(dataObject), // ["Manual", "f6a...", "84d..."]
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
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "50%",
                borderRadius: 5,
            },
        },
        dataLabels: {
            enabled: false,
        },
        colors: ["#00E396"],
        tooltip: {
            theme: "dark",
        },
        grid: {
            borderColor: "#444",
        },
    };
};
