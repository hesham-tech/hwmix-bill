// Data Processor Worker
self.onmessage = function (e) {
  const { type, data, payload } = e.data;

  if (type === 'PROCESS_PROFIT_REPORT') {
    const processed = (data || []).map(item => ({
      ...item,
      month: item.date,
      costs: (parseFloat(item.cost_of_goods_sold) || 0) + (parseFloat(item.expenses) || 0),
      profit: parseFloat(item.net_profit) || 0,
      revenue: parseFloat(item.revenue) || 0,
      margin: item.revenue > 0 ? ((item.net_profit / item.revenue) * 100).toFixed(2) : 0,
    }));

    self.postMessage({ type: 'SUCCESS', data: processed });
  }

  if (type === 'PREPARE_EXPORT') {
    const processed = data.map(item => ({
      الشهر: item.month || item.date,
      الإيرادات: item.revenue,
      التكاليف: item.costs,
      الربح: item.profit,
      'الهامش %': item.margin,
    }));

    self.postMessage({ type: 'SUCCESS', data: processed });
  }
};
