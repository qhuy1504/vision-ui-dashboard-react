export const barChartDataDashboardPre = (flowRunStateStats) => [
    {
        name: "Flow Run State",
        data: [
            flowRunStateStats["SCHEDULED"],
            flowRunStateStats["RUNNING"],
            flowRunStateStats["COMPLETED"],
            flowRunStateStats["FAILED"],
            flowRunStateStats["CRASHED"],
            flowRunStateStats["PENDING"],
        ],
    },
];
  