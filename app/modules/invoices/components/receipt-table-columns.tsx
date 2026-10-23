interface ReceiptTableColumnsProps {
  hasDimensions: boolean;
  hasCubic: boolean;
  showPrices?: boolean;
}

export function ReceiptTableColumns({
  hasDimensions,
  hasCubic,
  showPrices = true,
}: ReceiptTableColumnsProps) {
  const numericWidths = [
    10,
    ...(hasDimensions ? [10, 10, 10] : []),
    ...(hasCubic ? [11] : []),
    ...(showPrices ? [11, 13] : []),
  ];
  const itemWidth = 100 - numericWidths.reduce((sum, width) => sum + width, 0);

  return (
    <colgroup>
      <col style={{ width: `${itemWidth}%` }} />
      {numericWidths.map((width, index) => (
        <col key={index} style={{ width: `${width}%` }} />
      ))}
    </colgroup>
  );
}
