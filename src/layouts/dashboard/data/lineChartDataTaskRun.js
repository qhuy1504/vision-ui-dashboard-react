export const lineChartDataTaskRun = (taskRunStats) => {
    const entries = Object.entries(taskRunStats) // [["2025-06-18", 15], ["2025-06-19", 27], ...]
        .sort((a, b) => new Date(a[0]) - new Date(b[0])); // đảm bảo theo thứ tự ngày

    return [
        {
            name: "Task Run",
            data: entries.map(([_, count]) => count),
        },
    ];
};
  