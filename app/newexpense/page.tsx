"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ExpenseForm = {
  expense_date: string;
  category: string;
  description: string;
  amount: string;
  payment_method: string;
  supplier_id: string;
};

type Supplier = {
  [x: string]: ReactNode;
  id: number;
  supplier_name: string;
};

const initialForm: ExpenseForm = {
  expense_date: new Date().toISOString().split("T")[0],
  category: "",
  description: "",
  amount: "",
  payment_method: "",
  supplier_id: "",
};

export default function NewExpensePage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const res = await fetch("/api/suppliers", { credentials: 'same-origin' });

        if (!res.ok) {
          throw new Error("Failed to load suppliers");
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setSuppliers(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadSuppliers();
  }, []);

  function updateField(field: keyof ExpenseForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function submitExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage(null);
    setError(null);

    if (!form.category.trim()) {
      setError("Category is required.");
      setSaving(false);
      return;
    }

    if (!form.amount.trim()) {
      setError("Amount is required.");
      setSaving(false);
      return;
    }

    const response = await fetch("/api/expenses", {
      method: "POST",
      credentials: 'same-origin',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    let result: any = {};

try {
  result = await response.json();
} catch {
  result = {};
}

    setSaving(false);

    if (!response.ok) {
      setError(result.error ?? "Unable to save expense.");
      return;
    }

    setMessage("Expense saved successfully.");

    setForm({
      ...initialForm,
      expense_date: new Date().toISOString().split("T")[0],
    });

    router.refresh();
  }

  return (
    <div className="max-w-3xl p-6">

      <div className="flex items-center justify-between mb-6">

        <h1 className="text-3xl font-bold">
          New Expense
        </h1>

        <a
          href="/expenses"
          className="rounded bg-zinc-700 px-4 py-2 text-white hover:bg-zinc-600"
        >
          Back
        </a>

      </div>

      {message && (
        <div className="mb-4 rounded bg-green-700 p-3 text-white">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded bg-red-700 p-3 text-white">
          {error}
        </div>
      )}

      <form
        onSubmit={submitExpense}
        className="space-y-5"
      >

        <div>

          <label className="mb-2 block text-sm">
            Expense Date
          </label>

          <input
            type="date"
            className="w-full rounded border p-3 bg-black text-white"
            value={form.expense_date}
            onChange={(e) =>
              updateField("expense_date", e.target.value)
            }
          />

        </div>

        <div>

          <label className="mb-2 block text-sm">
            Category
          </label>

          <select
            className="w-full rounded border p-3 bg-black text-white"
            value={form.category}
            onChange={(e) =>
              updateField("category", e.target.value)
            }
          >
            <option value="">Select Category</option>
            <option value="Logistics">Logistics</option>
            <option value="Shipping">Shipping</option>
            <option value="Freight Forwarder">Freight Forwarder</option>
            <option value="Customs">Customs</option>
            <option value="Headphones">Headphones</option>
            <option value="Earplugs">Earplugs</option>
            <option value="Government">Government</option>
            <option value="License">License</option>
            <option value="Rent">Rent</option>
            <option value="Utilities">Utilities</option>
            <option value="Salary">Salary</option>
            <option value="Transportation">Transportation</option>
            <option value="Marketing">Marketing</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Tax">Tax</option>
            <option value="Inventory">Inventory</option>
            <option value="Other">Other</option>
          </select>

        </div>

        <div>

          <label className="mb-2 block text-sm">
            Description
          </label>

          <textarea
            className="w-full rounded border p-3 bg-black text-white"
            rows={4}
            value={form.description}
            onChange={(e) =>
              updateField("description", e.target.value)
            }
          />

        </div>

        <div>

          <label className="mb-2 block text-sm">
            Amount
          </label>

          <input
            type="number"
            step="0.01"
            className="w-full rounded border p-3"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) =>
              updateField("amount", e.target.value)
            }
          />

        </div>

        <div>

          <label className="mb-2 block text-sm">
            Payment Method
          </label>

          <select
            className="w-full rounded border p-3 bg-black text-white"
            value={form.payment_method}
            onChange={(e) =>
              updateField("payment_method", e.target.value)
            }
          >
            <option value="">Select Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Cheque">Cheque</option>
            <option value="Mobile Wallet">Mobile Wallet</option>
          </select>

        </div>

        <div>

          <label className="mb-2 block text-sm">
            Supplier
          </label>

          <select
            className="w-full rounded border p-3 bg-black text-white"
            value={form.supplier_id}
            onChange={(e) =>
              updateField("supplier_id", e.target.value)
            }
          >
            <option value="">
              No Supplier
            </option>

            {suppliers.map((supplier) => (
              <option
                key={supplier.id}
                value={supplier.id}
              >
                {supplier.name}
              </option>
            ))}
          </select>

        </div>

        <button
          type="submit"
          disabled={saving || loading}
          className="rounded bg-purple-600 px-6 py-3 text-white hover:bg-purple-500 disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : loading
            ? "Loading..."
            : "Save Expense"}
        </button>

      </form>
    </div>
  );
}