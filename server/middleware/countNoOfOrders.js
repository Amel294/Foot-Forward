const OrdersDB = require("../model/order");

exports.getOrders = async function getOrders(Admin_id, granularity, value) {
    try {
        let startDate, endDate;

        if (granularity === "day") {
            // Calculate start and end date for a specific day
            startDate = new Date(value);
            startDate.setHours(0, 0, 0, 0); // Set to the start of the day
            endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999); // Set to the end of the day
        } else if (granularity === "week") {
            // Calculate start and end date for a specific week
            startDate = calculateStartDateForWeek(value);
            endDate = calculateEndDate(startDate);
        } else if (granularity === "month") {
            // Calculate start and end date for a specific month
            startDate = calculateStartDateForMonth(value);
            endDate = calculateEndDateForMonth(value);
        } else {
            throw new Error("Invalid granularity parameter");
        }

        // Construct a query to count orders for the specified admin and date range
        const orderCount = await OrdersDB.countDocuments({
            orderDate: {
                $gte: startDate,
                $lte: endDate,
            },
        });

        return orderCount;
    } catch (error) {
        console.error("Error retrieving order count:", error);
        throw error;
    }
}

// Helper function to calculate the start date of a week based on the week number
function calculateStartDateForWeek(weekNumber) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setHours(0, 0, 0, 0); // Set to the start of the day
    startOfWeek.setDate(today.getDate() - today.getDay() + 7 * (weekNumber - 1));
    return startOfWeek;
}

// Helper function to calculate the start date of a month based on the month number (1-12)
function calculateStartDateForMonth(monthNumber) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), monthNumber - 1, 1);
    startOfMonth.setHours(0, 0, 0, 0); // Set to the start of the day
    return startOfMonth;
}

// Helper function to calculate the end date of a month based on the month number (1-12)
function calculateEndDateForMonth(monthNumber) {
    const startOfMonth = calculateStartDateForMonth(monthNumber);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(startOfMonth.getMonth() + 1);
    endOfMonth.setDate(0); // Set to the last day of the previous month
    endOfMonth.setHours(23, 59, 59, 999); // Set to the end of the day
    return endOfMonth;
}

// Helper function to calculate the end date based on the start date
function calculateEndDate(startDate) {
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999); // Set to the end of the day
    endDate.setDate(startDate.getDate() + 6); // Set to the end of the week (Saturday)
    return endDate;
}