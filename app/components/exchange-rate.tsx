"use client";

import { DollarSign, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export function ExchangeRate() {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRate = () => {
    setLoading(true);
    fetch("/api/exchange-rate?from=USD&to=KRW")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error && data.rate) setRate(data.rate);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRate();
  }, []);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#8B7FD8]" />
          <h3 className="font-medium text-[#3D3557]">실시간 환율 체크</h3>
        </div>
        <button
          onClick={fetchRate}
          disabled={loading}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-[#F5F3FF] text-[#8B7FD8] hover:bg-[#E5DFF8] transition-colors"
          title="Refresh"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#E5DFF8]">
          {loading ? (
            <span className="text-sm text-[#9B91C1]">Loading...</span>
          ) : rate ? (
            <span className="text-2xl font-bold text-[#3D3557]">
              $1 = {rate.toLocaleString("en-US", { maximumFractionDigits: 0 })} KRW
            </span>
          ) : (
            <span className="text-sm text-[#9B91C1]">Unable to load exchange rate</span>
          )}
        </div>
        <p className="text-xs text-[#9B91C1]">
          미국 주식 가격을 환산할 때 참고하세요!
        </p>
      </div>
    </div>
  );
}
