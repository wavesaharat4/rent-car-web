export default function StepAddons({ 
  addonsData, 
  addonCounts, 
  updateAddonCount, 
  setStep 
}: any) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {addonsData.map((addon: any) => (
          <div key={addon.addonID} className="bg-white border border-slate-200 rounded-[28px] overflow-hidden hover:border-blue-400 hover:shadow-[0_8px_30px_rgb(37,99,235,0.12)] transition-all relative flex flex-col group p-6 md:p-8">
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-black text-slate-800 text-xl">{addon.addonName}</h3>
                <div className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">บริการเสริม</div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">{addon.addonDetail}</p>
              <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-100">
                <div>
                  <div className="font-black text-blue-600 text-2xl">
                    {addon.addonPrice} ฿ <span className="text-sm font-bold text-slate-500">/ วัน</span>
                  </div>
                </div>
                <div className="flex items-center bg-slate-50 rounded-2xl p-1.5 border border-slate-200 shadow-inner">
                  <button onClick={() => updateAddonCount(addon.addonID, -1, addon.addonQuantity)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all font-bold text-lg cursor-pointer">−</button>
                  <span className="font-black text-slate-800 text-lg w-12 text-center">{addonCounts[addon.addonID] || 0}</span>
                  <button onClick={() => updateAddonCount(addon.addonID, 1, addon.addonQuantity)} className="w-10 h-10 flex items-center justify-center text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all font-bold text-xl cursor-pointer">+</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {addonsData.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-10 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 font-bold">ไม่มีอุปกรณ์เสริมให้เลือกในขณะนี้</p>
          </div>
        )}
      </div>
      <div className="mt-10 flex justify-end">
        <button onClick={() => setStep(4)} className="bg-blue-600 text-white font-bold py-4 px-14 rounded-2xl hover:bg-blue-700 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.3)] flex items-center gap-3 cursor-pointer text-lg">
          ถัดไป <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
}