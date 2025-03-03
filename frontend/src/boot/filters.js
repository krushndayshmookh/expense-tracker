import { date } from "quasar";

const formatShortDate = (value) => {
  return date.formatDate(value, "MMM DD HH:mm");
};

const formatAmount = (value) => {
  const actualValue = value / 100;

  return actualValue.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
};

export default ({ app }) => {
  app.config.globalProperties.$filters = {
    shortDate: formatShortDate,
    amount: formatAmount,
  };
};

export { formatShortDate, formatAmount };
