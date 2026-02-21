export function SellerTimeline({ historial }: any) {
  return (
    <div className="border rounded-xl p-4 space-y-4">
      <h2 className="font-semibold">Historial</h2>

      {historial.map((item: any) => (
        <div key={item.id} className="border-b pb-2">
          <div className="font-medium">{item.action}</div>
          {item.comment && (
            <div className="text-sm text-gray-600">
              {item.comment}
            </div>
          )}
          <div className="text-xs text-gray-400">
            {new Date(item.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
