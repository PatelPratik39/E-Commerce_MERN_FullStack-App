import Order from "../models/order.model";
import Product from "../models/product.model";
import User from "../models/User.model";

export const getAnalyticsData = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null, //it groups all documents togather
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" }
      }
    }
  ]);

  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0
  };

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue
  };
};

export const getDailySalesData = async (startDate, endDate) => {
  const dailySalesData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: $createdAt } },
        sales: { $sum: 1 },
        revenue: { $sum: $totalAmount }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  //   example of daily sales data
  //   [
  //     {
  //       _id: "2025-01-19",
  //       sales: 12,
  //       revenue: 1450.75
  //     },
  //     {
  //       _id: "2025-01-19",
  //       sales: 2,
  //       revenue: 140.75
  //     },
  //     {
  //       _id: "2025-01-19",
  //       sales: 2,
  //       revenue: 50.75
  //     },
  //     {
  //       _id: "2025-01-19",
  //       sales: 2,
  //       revenue: 150.75
  //     },
  //     {
  //       _id: "2025-01-19",
  //       sales: 2,
  //       revenue: 1450.75
  //     }
  //   ];

  const dateArray = getDatesInRange(startDate, endDate);
  return dateArray.map((date) => {
    const foundData = dailySalesData.find((item) => item._id === date);
    return {
      date,
      sales: foundData?.sales || 0,
      revenue: foundData?.revenue || 0
    };
  });
};
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
