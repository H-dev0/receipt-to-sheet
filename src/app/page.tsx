export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">مِن الإيصال إلى جدول مرتب</p>
          <h1 id="page-title">Receipt to Sheet</h1>
          <p className="intro">
            Upload a receipt, review the extracted details, then export a clean CSV.
          </p>
        </div>
        <span className="status">Coming soon</span>
      </section>

      <section className="workspace" aria-label="Receipt workspace">
        <div className="upload-card">
          <div className="upload-icon" aria-hidden="true">⌁</div>
          <h2>Upload receipt</h2>
          <p>ارفع صورة إيصالك لبدء استخراج البيانات لاحقًا.</p>
          <label className="upload-button" htmlFor="receipt-upload">
            Choose image <span>أو اسحبها هنا</span>
          </label>
          <input id="receipt-upload" type="file" accept="image/*" hidden />
          <small>JPG, PNG, or HEIC · Processing will be added next</small>
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
                  <th>Currency</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <span aria-hidden="true">▦</span>
                      <p>No receipt data yet</p>
                      <small>ستظهر تفاصيل الإيصال هنا بعد الرفع.</small>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
