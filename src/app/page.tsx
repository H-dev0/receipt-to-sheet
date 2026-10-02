"use client";

import { useState, type ChangeEvent } from "react";

type Receipt = {
  merchant: string | null;
  date: string | null;
  total: number | null;
  vat: number | null;
  category: string | null;
};

type ReceiptRow = { id: string } & Record<keyof Receipt, string>;

const COLUMNS: { key: keyof Receipt; label: string }[] = [
  { key: "merchant", label: "Merchant" },
  { key: "date", label: "Date" },
  { key: "total", label: "Total" },
  { key: "vat", label: "VAT" },
  { key: "category", label: "Category" },
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export default function Home() {
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isLoading = progress !== null;

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0 || isLoading) return;

    setError(null);
    setProgress({ current: 1, total: files.length });
    const failures: string[] = [];
    try {
      for (const [index, file] of files.entries()) {
        setProgress({ current: index + 1, total: files.length });
        try {
          if (!IMAGE_TYPES.has(file.type)) {
            throw new Error("Choose a JPG, PNG, WebP, or HEIC image.");
          }
          if (file.size > MAX_IMAGE_SIZE) {
            throw new Error("The image must be smaller than 10 MB.");
          }

          const formData = new FormData();
          formData.append("image", file);
          const response = await fetch("/api/extract-receipt", { method: "POST", body: formData });
          const data: Receipt | { error: string } = await response.json();
          if (!response.ok || "error" in data) {
            throw new Error("error" in data ? data.error : "Could not extract this receipt.");
          }
          const row: ReceiptRow = {
            id: crypto.randomUUID(),
            merchant: data.merchant ?? "",
            date: data.date ?? "",
            total: data.total === null ? "" : String(data.total),
            vat: data.vat === null ? "" : String(data.vat),
            category: data.category ?? "",
          };
          setReceipts((current) => [...current, row]);
        } catch (cause) {
          failures.push(`${file.name}: ${cause instanceof Error ? cause.message : "Could not extract this receipt."}`);
          setError(failures.join("\n"));
        }
      }
    } finally {
      setProgress(null);
    }
  }

  function updateReceipt(id: string, field: keyof Receipt, value: string) {
    setReceipts((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
  }

  function exportCsv() {
    if (receipts.length === 0 || isLoading) return;

    function escapeCell(value: string) {
      // Treat formula-like receipt text as text when opened in a spreadsheet.
      const safeValue = /^\s*[=+@-]/.test(value) ? `'${value}` : value;
      return `"${safeValue.replaceAll('"', '""')}"`;
    }

    const lines = [
      "merchant,date,total,VAT,category",
      ...receipts.map((receipt) => COLUMNS.map((column) => escapeCell(receipt[column.key])).join(",")),
    ];
    // A UTF-8 BOM lets Excel recognize Arabic text on opening the CSV.
    const blob = new Blob([`\uFEFF${lines.join("\r\n")}\r\n`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "receipts.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">مِن الإيصال إلى جدول مرتب</p>
          <h1 id="page-title">Receipt to Sheet</h1>
          <p className="intro">
            Upload receipts and review their extracted details in the table.
          </p>
        </div>
        <span className="status">AI extraction</span>
      </section>

      <section className="workspace" aria-label="Receipt workspace">
        <div className="upload-card">
          <div className="upload-icon" aria-hidden="true">⌁</div>
          <h2>Upload receipts</h2>
          <p>ارفع صور الإيصالات لاستخراج بيانات كل إيصال على حدة.</p>
          <label
            className={`upload-button${isLoading ? " upload-button-disabled" : ""}`}
            htmlFor="receipt-upload"
            aria-disabled={isLoading}
          >
            Choose images <span>اختر صورًا</span>
          </label>
          <input
            id="receipt-upload"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={handleImageChange}
            disabled={isLoading}
            hidden
          />
          <small>JPG, PNG, WebP, or HEIC · One receipt per image · Up to 10 MB each</small>
          {progress && <p className="feedback" role="status">Extracting receipt {progress.current} of {progress.total}… جارٍ استخراج البيانات</p>}
          {error && <p className="feedback error" role="alert">{error}</p>}
        </div>

        <div className="table-card">
          <div className="table-heading">
            <div>
              <p className="eyebrow">Review</p>
              <h2>Receipt details</h2>
            </div>
            <button
              type="button"
              className="export-button"
              onClick={exportCsv}
              disabled={receipts.length === 0 || isLoading}
            >Export CSV</button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {COLUMNS.map((column) => <th key={column.key} scope="col">{column.label}</th>)}
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.length > 0 ? receipts.map((receipt, index) => (
                  <tr className="result-row" key={receipt.id}>
                    {COLUMNS.map((column) => (
                      <td key={column.key}>
                        <input
                          className="receipt-value"
                          aria-label={`${column.label}, receipt ${index + 1}`}
                          dir="auto"
                          inputMode={column.key === "total" || column.key === "vat" ? "decimal" : "text"}
                          value={receipt[column.key]}
                          placeholder="—"
                          onChange={(event) => updateReceipt(receipt.id, column.key, event.target.value)}
                        />
                      </td>
                    ))}
                    <td>
                      <button
                        type="button"
                        className="delete-button"
                        aria-label={`Delete receipt ${index + 1}`}
                        onClick={() => setReceipts((current) => current.filter((row) => row.id !== receipt.id))}
                      >Delete</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <span aria-hidden="true">▦</span>
                        <p>No receipt data yet</p>
                        <small>ستظهر تفاصيل الإيصال هنا بعد الرفع.</small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
