/* RM 산출물(MD) 빌더 — 개별 에이전트 .md + 통합본 .md.
   원문 민감정보 없이 요약·근거표·출처만 담는다. AI 산출물은 내부 업무 참고용.
   통합본은 개별 md를 옵시디언식 링크로 연결한다([[파일명]] → 클릭 이동). */

/* 에이전트별 산출물 콘텐츠 템플릿(샘플) — 요약/근거표/출처/기대값 */
const RMO_DELIVERABLE_TEMPLATES = {
  "rmo-marine-risk": {
    summary: "고수온·풍랑 경보 권역과 사업장 위치가 겹칩니다. 재해 대응 체크리스트와 운전자금·사료비 부담 신호를 정리했습니다.",
    evidence: [
      ["경보 매칭", "고수온 예보 + 태풍 접근 경보 권역에 사업장 포함", "기상특보(공개·샘플)"],
      ["재해 노출", "폐사 위험 상승으로 사료비·운전자금 부담 동반 상승 신호", "사업장 권역 매칭(샘플)"],
      ["대응 후보", "상환유예 검토·정책 재해자금 안내 대상 여부 확인 필요", "내부 체크리스트"],
    ],
    sources: [
      { label: "기상특보·고수온 예보(공개)", ref: "sample:marine-alert" },
      { label: "사업장 권역 매칭(샘플)", ref: "sample:region-match" },
    ],
    expectedValue: "재해 노출을 조기에 근거와 함께 파악해 대응 태스크로 넘길 수 있습니다.",
    contribution: 40,
  },
  "rmo-credit-care": {
    summary: "운전자금·소액대출 상환일과 최근 입출금 흐름(샘플)을 참고해 상환 여력 신호와 분할·리마인드 시나리오 후보를 정리했습니다.",
    evidence: [
      ["상환일", "다가오는 상환일과 최근 입출금 흐름이 빠듯한 구간", "상환일정(샘플)"],
      ["시나리오", "분할 상환/상환일 조정 후보(승인 필요)", "내부 시나리오"],
      ["리마인드", "상환일 사전 안내 문안 후보", "안내 템플릿"],
    ],
    sources: [
      { label: "상환일정·입출금 흐름(샘플)", ref: "sample:repayment-flow" },
    ],
    expectedValue: "상환 여력 공백을 미리 알려 연체 전 조치로 연결합니다.",
    contribution: 30,
  },
  "rmo-salary-flow": {
    summary: "급여 입금 주기와 변동성(샘플)을 판단해 소득 정상화 시점과 상환 여력 공백 구간을 정리했습니다.",
    evidence: [
      ["급여 주기", "복직 직후 급여 정상화 전 공백 구간 존재", "급여주기(샘플)"],
      ["공백 구간", "카드론·직장인대출 상환일과 겹치는 구간", "상환일정(샘플)"],
    ],
    sources: [{ label: "급여주기·소득 흐름(샘플)", ref: "sample:salary-flow" }],
    expectedValue: "소득 정상화 시점을 근거로 상환일 조정 후보를 제시합니다.",
    contribution: 35,
  },
  "rmo-dsr-guard": {
    summary: "월 상환 집중도(샘플 지표)를 점검해 상환일 겹침과 집중 구간을 참고 신호로 정리했습니다. DSR 확정 산출은 하지 않습니다.",
    evidence: [
      ["집중도", "특정 월에 상환이 몰리는 집중 구간", "월 상환(샘플)"],
      ["조정 후보", "상환일 분산 후보(승인 필요)", "내부 시나리오"],
    ],
    sources: [{ label: "월 상환 집중도(샘플)", ref: "sample:monthly-repayment" }],
    expectedValue: "상환 집중 위험을 조기에 표시해 조정 검토로 연결합니다.",
    contribution: 25,
  },
  "rmo-youth-finance": {
    summary: "학사일정·장학금 예상 입금 구간·소액 상환일을 판단해 생활비 공백 구간과 리마인드 후보를 정리했습니다.",
    evidence: [
      ["학사일정", "장학금 입금 전 생활비 공백 구간", "학사일정(샘플)"],
      ["소액 상환일", "아르바이트 급여와 상환일 사이 간극", "상환일정(샘플)"],
      ["위험 안내", "고금리 대체대출 위험을 쉬운 문장으로 설명", "안내 템플릿"],
    ],
    sources: [{ label: "학사일정·장학금 구간(샘플)", ref: "sample:academic-schedule" }],
    expectedValue: "생활비 공백을 미리 알려 고금리 대출 유입을 예방합니다.",
    contribution: 40,
  },
  "rmo-policy-finance": {
    summary: "소상공인·창업 정책자금과 지역 협약대출의 자격 확인 체크리스트를 정리했습니다. 대상 여부는 확정하지 않습니다.",
    evidence: [
      ["자격 후보", "매출 규모·업력·지역 요건 확인 항목", "정책자금 안내(공개)"],
      ["증빙 목록", "사업자·매출 증빙(원문 저장 금지) 확인 항목", "내부 체크리스트"],
      ["안내 후보", "협약대출·이차보전 안내 대상 여부 확인", "협약대출 안내(공개)"],
    ],
    sources: [
      { label: "정책자금 요건(공개 안내)", ref: "sample:policy-guide" },
      { label: "지역 협약대출 안내(공개)", ref: "sample:local-loan" },
    ],
    expectedValue: "조달비용을 낮출 정책금융 후보를 근거와 함께 제시합니다.",
    contribution: 45,
  },
  "rmo-action": {
    summary: "상환유예 검토·정책자금 안내·담당자 콜백 등 다음 조치 태스크를 정리했습니다. 실행은 담당 RM 승인 후 진행됩니다.",
    evidence: [
      ["태스크", "상환유예 검토 / 정책자금 안내 / 콜백 예약 후보", "내부 태스크"],
      ["핸드오프", "안내 문안은 승인 대기, 승인 항목은 승인 라우팅", "핸드오프 규칙"],
    ],
    sources: [{ label: "내부 조치 규칙", ref: "internal:action-rules" }],
    expectedValue: "다음 조치를 태스크로 정리해 담당자가 바로 실행할 수 있습니다.",
    contribution: 20,
  },
  "rmo-comms": {
    summary: "고객에게 전달할 안내 문안 초안을 쉬운 문장으로 작성했습니다. 발송 승인 대기 상태이며 직접 발송하지 않습니다.",
    evidence: [
      ["문안 초안", "상환일/정책자금 안내 초안(확정 표현 없음)", "안내 템플릿"],
      ["승인", "발송 전 approval pending → 승인 라우팅", "승인 규칙"],
    ],
    sources: [{ label: "안내 문안 템플릿", ref: "internal:guidance-template" }],
    expectedValue: "고객 눈높이 안내문 초안을 승인 대기 상태로 준비합니다.",
    contribution: 15,
  },
};

function rmoDeliverableTemplate(agentId) {
  return RMO_DELIVERABLE_TEMPLATES[agentId] || {
    summary: "내부 업무 참고용 요약을 생성했습니다. 담당자 검토가 필요합니다.",
    evidence: [["요약", "근거 기반 참고 결과", "내부 샘플"]],
    sources: [{ label: "내부 샘플 데이터", ref: "internal:sample" }],
    expectedValue: "담당자 검토를 돕는 참고 결과입니다.",
    contribution: 20,
  };
}

function rmoAgentDisplayName(id) {
  const agent = rmOfficerAgents.find((item) => item.id === id);
  return agent ? agent.displayName : (id || "-");
}

/* 개별 에이전트 MD 산출물 객체(마크다운 body 포함). db insert는 services에서. */
function rmoBuildAgentDeliverable(caseRow, agentId, overrides) {
  const agent = rmOfficerAgents.find((item) => item.id === agentId) || rmOfficerAgents[0];
  const template = rmoDeliverableTemplate(agentId);
  const summary = (overrides && overrides.summary) || template.summary;
  const evidence = (overrides && overrides.evidence) || template.evidence;
  const sources = (overrides && overrides.sources) || template.sources;
  const fileName = agent.deliverableFile || `${agent.id}.md`;
  const createdAt = new Date().toISOString().slice(0, 10);
  const body = [
    `---`,
    `case: ${caseRow.caseNo}`,
    `agent: ${agent.displayName}`,
    `org: ${agent.org}`,
    `date: ${createdAt}`,
    `note: 내부 업무 참고용 · 담당자 검토 필요`,
    `---`,
    ``,
    `# ${agent.displayName} 결과 — ${caseRow.theme}`,
    ``,
    `## Summary`,
    summary,
    ``,
    `## 근거`,
    `| 항목 | 내용 | 출처 |`,
    `| --- | --- | --- |`,
    ...evidence.map((row) => `| ${row[0]} | ${row[1]} | ${row[2]} |`),
    ``,
    `## 예상 기대값`,
    template.expectedValue,
    ``,
    `> 이 문서는 실제 승인·금리·한도·신용평가·정책자금 대상 확정이 아닙니다.`,
  ].join("\n");
  return {
    kind: "agent",
    agentId: agent.id,
    caseId: caseRow.id,
    title: `${agent.displayName} 결과`,
    fileName,
    summary,
    evidenceRows: evidence.map((row) => ({ item: row[0], detail: row[1], source: row[2] })),
    sources,
    contribution: (overrides && overrides.contribution) || template.contribution,
    expectedValue: template.expectedValue,
    body,
    reviewRequired: true,
    createdAt,
  };
}

/* 통합본 MD 산출물 — 개별 md를 링크로 연결 + 관여율 표 + 출처 종합 */
function rmoBuildIntegratedDeliverable(caseRow, agentDeliverables) {
  const createdAt = new Date().toISOString().slice(0, 10);
  const links = agentDeliverables.map((d) => ({ fileName: d.fileName, deliverableId: d.id, title: d.title, agentId: d.agentId }));
  const allSources = [];
  agentDeliverables.forEach((d) => (d.sources || []).forEach((s) => {
    if (!allSources.some((x) => x.ref === s.ref)) allSources.push(s);
  }));
  const contributionRows = agentDeliverables.map((d) => ({
    agent: rmoAgentDisplayName(d.agentId),
    fileName: d.fileName,
    data: (d.sources || []).map((s) => s.label).join(", "),
    date: d.createdAt,
    contribution: d.contribution,
  }));
  const body = [
    `---`,
    `case: ${caseRow.caseNo}`,
    `type: 통합본`,
    `date: ${createdAt}`,
    `note: 내부 업무 참고용 · 담당자 검토 필요`,
    `---`,
    ``,
    `# 통합 리포트 — ${caseRow.theme}`,
    ``,
    `## 상황`,
    caseRow.situation,
    ``,
    `## 우선순위 근거`,
    caseRow.priorityReason || "-",
    ``,
    `## 개별 산출물`,
    ...agentDeliverables.map((d) => `- [[${d.fileName}]] — ${d.title} (${rmoAgentDisplayName(d.agentId)})`),
    ``,
    `## 사용 에이전트/스킬`,
    `| 에이전트 | 산출물.md | 사용 데이터 | 날짜 | 관여율 |`,
    `| --- | --- | --- | --- | --- |`,
    ...contributionRows.map((r) => `| ${r.agent} | ${r.fileName} | ${r.data} | ${r.date} | ${r.contribution}% |`),
    ``,
    `## 사용 출처`,
    ...allSources.map((s) => `- ${s.label} (${s.ref})`),
    ``,
    `> 통합본은 개별 산출물의 요약이며 실제 금융 판단이 아닙니다. 담당 RM 검토가 필요합니다.`,
  ].join("\n");
  return {
    kind: "integrated",
    agentId: "rmo-triage",
    caseId: caseRow.id,
    title: `${caseRow.caseNo} 통합 리포트`,
    fileName: "통합본.md",
    summary: `${caseRow.theme} — 개별 산출물 ${agentDeliverables.length}건을 통합했습니다.`,
    links,
    contributionRows,
    sources: allSources,
    contribution: 100,
    body,
    reviewRequired: true,
    createdAt,
  };
}
