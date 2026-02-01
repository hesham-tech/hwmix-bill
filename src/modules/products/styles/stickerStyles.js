export const stickerStyles = `
.sticker-page {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  margin: 0;
  padding: 0;
  direction: rtl;
}

.product-sticker {
  width: 40mm;
  height: 25mm;
  padding: 1mm;
  border: 1px dashed #ccc; /* Visible in UI, hidden in print */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow: hidden;
  position: relative;
  background: white;
  page-break-inside: avoid;
}

@media print {
  .product-sticker {
    border: none;
  }
}

.sticker-product-name {
  font-size: 8px;
  font-weight: bold;
  margin-bottom: 1px;
  line-height: 1;
  max-height: 16px;
  overflow: hidden;
}

.sticker-barcode-container {
  margin: 1px 0;
}

.sticker-serial {
  font-size: 7px;
  margin-bottom: 2px;
}

.sticker-price {
  font-size: 10px;
  font-weight: 900;
  border-top: 1px solid #000;
  padding-top: 1px;
  width: 100%;
}

.sticker-company {
  font-size: 6px;
  position: absolute;
  top: 1px;
  right: 2px;
  opacity: 0.7;
}
`;
