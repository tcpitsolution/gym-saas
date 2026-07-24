function toCSV(rows) {
  if (!rows || rows.length === 0) return "";

  const headers = Object.keys(rows[0]);
  const csvRows = [headers.join(",")];

  for (const row of rows) {
    const values = headers.map((h) => {
      let val = row[h] ?? "";
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

module.exports = { toCSV };
