'use client'

import { useMemo, useState } from 'react'
import {
  calculateProductPricing,
  formatCurrency,
  formatPercent,
} from '@/lib/product-pricing'

type PricingForm = {
  supplierPrice: string
  shippingInsurance: string
  sellingPrice: string
  customsDutyPct: string
  vatPct: string
  clearanceAgentPct: string
  currencyTransferPct: string
}

const initialForm: PricingForm = {
  supplierPrice: '',
  shippingInsurance: '',
  sellingPrice: '',
  customsDutyPct: '5',
  vatPct: '14',
  clearanceAgentPct: '1.5',
  currencyTransferPct: '2',
}

function parseInput(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function ProductPricingPage() {
  const [form, setForm] = useState<PricingForm>(initialForm)

  function updateField(field: keyof PricingForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const results = useMemo(
    () =>
      calculateProductPricing({
        supplierPrice: parseInput(form.supplierPrice),
        shippingInsurance: parseInput(form.shippingInsurance),
        sellingPrice: parseInput(form.sellingPrice),
        customsDutyPct: parseInput(form.customsDutyPct),
        vatPct: parseInput(form.vatPct),
        clearanceAgentPct: parseInput(form.clearanceAgentPct),
        currencyTransferPct: parseInput(form.currencyTransferPct),
      }),
    [form]
  )

  return (
    <div className="p-6">
      

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-lg font-semibold text-purple-400">Inputs</h2>

          <label className="block space-y-2">
            <span className="text-sm text-zinc-300">Supplier Price (Invoice)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.supplierPrice}
              onChange={(event) => updateField('supplierPrice', event.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              placeholder="0.00"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-zinc-300">Shipping + Insurance</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.shippingInsurance}
              onChange={(event) =>
                updateField('shippingInsurance', event.target.value)
              }
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              placeholder="0.00"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-zinc-300">Selling Price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.sellingPrice}
              onChange={(event) => updateField('sellingPrice', event.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              placeholder="0.00"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm text-zinc-300">Customs Duty (%)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.customsDutyPct}
                onChange={(event) =>
                  updateField('customsDutyPct', event.target.value)
                }
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-zinc-300">VAT (%)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.vatPct}
                onChange={(event) => updateField('vatPct', event.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-zinc-300">Clearance Agent Cost (%)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.clearanceAgentPct}
                onChange={(event) =>
                  updateField('clearanceAgentPct', event.target.value)
                }
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-zinc-300">Currency Transfer Rate (%)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.currencyTransferPct}
                onChange={(event) =>
                  updateField('currencyTransferPct', event.target.value)
                }
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              />
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-lg font-semibold text-purple-400">Calculated Results</h2>

          <ResultRow label="CIF Value" value={formatCurrency(results.cifValue)} />
          <ResultRow label="Duties" value={formatCurrency(results.duties)} />
          <ResultRow label="VAT" value={formatCurrency(results.vatAmount)} />
          <ResultRow
            label="Clearance Agent Cost"
            value={formatCurrency(results.clearanceAgentCost)}
          />
          <ResultRow
            label="Currency Transfer Cost"
            value={formatCurrency(results.currencyTransferCost)}
          />
          <ResultRow label="Final Cost" value={formatCurrency(results.finalCost)} highlight />
          <ResultRow
            label="Importer Cost"
            value={formatCurrency(results.importerCost)}
            highlight
          />
          <ResultRow
            label="Total Tax Burden"
            value={formatPercent(results.totalTaxBurdenPct)}
          />
          <ResultRow
            label="Revenue %"
            value={formatPercent(results.revenuePercent)}
            highlight
          />
          <ResultRow
            label="Markup on Cost"
            value={formatPercent(results.markupOnCost * 100)}
            highlight
          />
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
        <h2 className="mb-3 text-base font-semibold text-white">Formulas</h2>
        <ul className="space-y-1">
          <li>CIF = (Supplier Price + Shipping + Insurance) × (1 + Currency Transfer Rate)</li>
          <li>Duties = CIF × Customs Duty % × (1 + Currency Transfer Rate)</li>
          <li>VAT = (CIF × (1 + Customs Duty %)) × VAT %</li>
          <li>Importer Cost = CIF × (1 + Customs Duty %) × (1 + VAT %)</li>
          <li>Final Cost = CIF + Duties + VAT</li>
          <li>Revenue % = (Selling Price − Importer Cost) ÷ Selling Price × 100</li>
          <li>Markup on Cost = (Selling Price ÷ Importer Cost) − 1</li>
        </ul>
      </section>
    </div>
  )
}

function ResultRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-md border px-4 py-3 ${
        highlight
          ? 'border-purple-700 bg-purple-950/30'
          : 'border-zinc-800 bg-zinc-900/50'
      }`}
    >
      <span className="text-sm text-zinc-300">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-purple-300' : 'text-white'}`}>
        {value}
      </span>
    </div>
  )
}
