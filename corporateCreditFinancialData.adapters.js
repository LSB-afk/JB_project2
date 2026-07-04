/* 기업여신 공개/샘플 데이터 adapter.
   실제 은행 내부 DB·실차주 신용정보·세무자료에는 연결하지 않는다. */

const CCR_FINANCIAL_BENCHMARKS = {
  manufacturing: { label: "제조업", revenueTrend: "보합", operatingCashflow: "보통", leverageSignal: "담당자 확인 필요" },
  wholesaleRetail: { label: "도소매업", revenueTrend: "둔화", operatingCashflow: "주의", leverageSignal: "보완 확인" },
  construction: { label: "건설업", revenueTrend: "변동성 높음", operatingCashflow: "주의", leverageSignal: "고위험 검토" },
  services: { label: "서비스업", revenueTrend: "보합", operatingCashflow: "보통", leverageSignal: "정상" },
  transport: { label: "운수업", revenueTrend: "둔화", operatingCashflow: "주의", leverageSignal: "담당자 확인 필요" },
};

function ccrFetchFinancialBenchmarkSync(industryKey) {
  const key = industryKey || "manufacturing";
  return {
    source: "샘플 업종 벤치마크",
    dataMode: "sample",
    fetchedAt: new Date().toISOString().slice(0, 10),
    ...(CCR_FINANCIAL_BENCHMARKS[key] || CCR_FINANCIAL_BENCHMARKS.manufacturing),
  };
}

function ccrFetchFinancialBenchmark(industryKey) {
  return new Promise((resolve) => setTimeout(() => resolve(ccrFetchFinancialBenchmarkSync(industryKey)), 120));
}
