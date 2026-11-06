export function calculateInvoiceFinancials(invoice, context, customer) {
  let gross_amount = 0;
  let total_discount = 0;
  let total_profit = 0;

  invoice.items.forEach(item => {
    gross_amount += (item.quantity || 0) * (item.unit_price || 0);
    total_discount += item.discount || 0;
    total_profit += (item.profit_margin || 0) * (item.quantity || 0);
  });

  const taxable_amount = gross_amount - total_discount - (invoice.header_discount || 0);
  let total_tax = 0;
  let net_amount = taxable_amount;

  // Treat tax_inclusive as "is_tax_enabled" based on the UI label
  if (invoice.tax_inclusive && invoice.tax_rate > 0) {
    total_tax = taxable_amount * (invoice.tax_rate / 100);
    net_amount = taxable_amount + total_tax;
  }

  const raw_previous_balance = parseFloat(
    context === 'purchase' ? (customer?.payable_balance ?? 0) : (customer?.receivable_balance ?? 0)
  );
  const effective_previous_balance = invoice.include_previous_balance ? raw_previous_balance : 0;

  const total_balance = net_amount - effective_previous_balance;
  const remaining_amount = total_balance - (invoice.paid_amount || 0);

  return {
    gross_amount,
    total_discount,
    taxable_amount,
    total_tax,
    net_amount,
    header_discount: invoice.header_discount || 0,
    paid_amount: invoice.paid_amount || 0,
    previous_balance: effective_previous_balance,
    total_balance,
    remaining_amount,
    total_profit,
  };
}
