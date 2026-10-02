"use client";

import { useState, type ChangeEvent } from "react";

type Receipt = {
  merchant: string | null;
  date: string | null;
  total: number | null;
  vat: number | null;
  category: string | null;
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export default function Home() {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setReceipt(null);
    setError(null);
    if (!IMAGE_TYPES.has(file.type)) {
      setError("Choose a JPG, PNG, WebP, or HEIC image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("The image must be smaller than 10 MB.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/extract-receipt", { method: "POST", body: formData });
      const data: Receipt | { error: string } = await response.json();
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Could not extract this receipt.");
      }
      setReceipt(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not extract this receipt.");
    } finally {
      setIsLoading(false);
    }
  }

  function display(value: string | number | null) {
    return value === null ? "—" : String(value);
  }

  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">مِن الإيصال إلى جدول مرتب</p>
          <h1 id="page-title">Receipt to Sheet</h1>
          <p className="intro">
            Upload a receipt and review its extracted details in the table.
          </p>
        </div>
        <span className="status">AI extraction</span>
      </section>

      <section className="workspace" aria-label="Receipt workspace">
        <div className="upload-card">
          <div className="upload-icon" aria-hidden="true">⌁</div>
          <h2>Upload receipt</h2>
          <p>ارفع صورة إيصال واحد لاستخراج بياناته.</p>
          <label
            className={`upload-button${isLoading ? " upload-button-disabled" : ""}`}
            htmlFor="receipt-upload"
            aria-disabled={isLoading}
          >
            Choose image <span>اختر صورة</span>
          </label>
          <input
            id="receipt-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={handleImageChange}
            disabled={isLoading}
            hidden
          />
          <small>JPG, PNG, WebP, or HEIC · One image · Up to 10 MB</small>
          {isLoading && <p className="feedback" role="status">Extracting receipt details… جارٍ استخراج البيانات</p>}
          {error && <p className="feedback error" role="alert">{error}</p>}
        </div>

        <div className="table-card">
          <div className="table-heading">
            <div>
              <p className="eyebrow">Review</p>
              <h2>Receipt details</h2>
            </div>
            <button type="button" disabled>Export CSV</button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Total</th>
                  <th>VAT</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {receipt ? (
                  <tr className="result-row">
                    <td>{display(receipt.date)}</td>
                    <td dir="auto">{display(receipt.merchant)}</td>
                    <td>{display(receipt.total)}</td>
                    <td>{display(receipt.vat)}</td>
                    <td dir="auto">{display(receipt.category)}</td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={5}>
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
