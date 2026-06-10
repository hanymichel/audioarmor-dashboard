export type ProductPricingInputs = {
  supplierPrice: number
  shippingInsurance: number
  sellingPrice: number
  customsDutyPct: number
  vatPct: number
  clearanceAgentPct: number
  currencyTransferPct: number
}

export type ProductPricingResults = {
  cifValue: number
  duties: number
  vatAmount: number
  clearanceAgentCost: number
  currencyTransferCost: number
  importerCost: number
  finalCost: number
  revenuePercent: number
  markupOnCost: number
  totalTaxBurdenPct: number
}

function toNumber(value: number) {
  return Number.isFinite(value) ? value : 0
}

export function calculateProductPricing(
  inputs: ProductPricingInputs
): ProductPricingResults {
  const supplierPrice = toNumber(inputs.supplierPrice)
  const shippingInsurance = toNumber(inputs.shippingInsurance)
  const sellingPrice = toNumber(inputs.sellingPrice)
  const customsDutyRate = toNumber(inputs.customsDutyPct) / 100
  const vatRate = toNumber(inputs.vatPct) / 100
  const clearanceAgentRate = toNumber(inputs.clearanceAgentPct) / 100
  const currencyTransferRate = toNumber(inputs.currencyTransferPct) / 100

  const invoiceBase = supplierPrice + shippingInsurance
  const currencyMultiplier = 1 + currencyTransferRate
  const currencyTransferCost = invoiceBase * currencyTransferRate

  const cifValue = invoiceBase * currencyMultiplier
  const duties = cifValue * customsDutyRate * currencyMultiplier
  const cifWithDuty = cifValue * (1 + customsDutyRate)
  const vatAmount = cifWithDuty * vatRate
  const importerCost = cifWithDuty * (1 + vatRate)
  const clearanceAgentCost = cifValue * clearanceAgentRate
  const finalCost = cifValue + duties + vatAmount

  const revenuePercent =
    sellingPrice > 0 ? ((sellingPrice - importerCost) / sellingPrice) * 100 : 0
  const markupOnCost = importerCost > 0 ? sellingPrice / importerCost - 1 : 0

  const totalTaxBurdenPct =
    invoiceBase > 0
      ? ((duties + vatAmount + clearanceAgentCost + currencyTransferCost) /
          invoiceBase) *
        100
      : 0

  return {
    cifValue,
    duties,
    vatAmount,
    clearanceAgentCost,
    currencyTransferCost,
    importerCost,
    finalCost,
    revenuePercent,
    markupOnCost,
    totalTaxBurdenPct,
  }
}

export function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatPercent(value: number) {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`
}
