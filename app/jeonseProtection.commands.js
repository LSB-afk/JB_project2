/* 전세사기 보호 담당자 하네스 — Commands (운영자 실행 명령 registry).
   slash command 표기는 앱 내부 command registry로 표현하며, 각 명령은 실제 동작에 연결된다.
   고객 대상 발송·확정 판단으로 이어지는 명령은 존재하지 않는다. */

const jeonseProtectionCommands = [
  {
    key: "/jeonse-new-case",
    label: "신규 전세보호 건 접수",
    description: "5단계 접수 위저드를 연다.",
    run() {
      jpoCaseWizard = jpoDefaultCaseWizard();
      jpoGo("cases-new");
      return { ok: true, message: "접수 위저드로 이동" };
    },
  },
  {
    key: "/jeonse-run-triage",
    label: "분류 오케스트레이터 실행",
    description: "샘플 요청으로 오케스트레이터 라우팅을 실행하고 agent_runs에 기록한다.",
    run() {
      const result = runJeonseProtectionSampleRequest("ratio-check");
      if (!result) return { ok: false, message: "샘플을 찾지 못함" };
      jpoState.lastRun = {
        agent: result.agent ? result.agent.displayName : result.triage.recommendedAgent,
        risk: result.triage.riskOverride,
        sla: result.triage.slaDueAt,
        result: result.run.outputSummary,
        human: result.triage.requiresHumanReview,
        approvalPending: result.run.status === "pendingApproval",
      };
      jpoInvalidateCounts();
      return { ok: true, message: `분류 실행 완료 → ${jpoState.lastRun.agent}` };
    },
  },
  {
    key: "/jeonse-create-approval",
    label: "담당자 검토 승인 요청",
    description: "가장 최근 전세보호 건에 대해 담당자 검토 승인(pending)을 생성한다.",
    run() {
      const latest = jpoTable("jeonse_cases", JPO_ROLE_KEY)[0];
      if (!latest) return { ok: false, message: "케이스 없음" };
      jpoInsert("approvals", {
        roleKey: JPO_ROLE_KEY,
        workspaceId: JPO_WORKSPACE_ID,
        id: jpoNextId("APR-JPO", "approvals"),
        caseId: latest.id,
        approvalType: "담당자 검토",
        status: "pending",
        requestedById: latest.assignedToId,
        approverId: "USR-JPO-AUD-01",
        requestedAt: new Date().toISOString().slice(0, 10),
      });
      jpoWriteAudit({
        id: jpoNextId("AUD-JPO", "audit_logs"),
        actorId: latest.assignedToId,
        action: "JPO_APPROVAL_REQUESTED",
        targetType: "case",
        targetId: latest.id,
        riskLevel: latest.riskLevel,
        reviewRequired: true,
        createdAt: new Date().toISOString().slice(0, 10),
      });
      jpoInvalidateCounts();
      return { ok: true, message: `${latest.caseNo} 승인 요청 생성` };
    },
  },
  {
    key: "/jeonse-redact-evidence",
    label: "증빙 마스킹 점검 실행",
    description: "개인정보·증빙 마스킹 에이전트를 실행해 점검 리포트를 기록한다.",
    run() {
      const run = recordJeonseProtectionAgentRun({
        agentId: "jpo-privacy",
        caseId: (jpoTable("jeonse_cases", JPO_ROLE_KEY)[0] || {}).id || null,
        inputSummary: "증빙·화면·로그 마스킹 점검 요청",
        outputSummary: "익명 Ref 원칙 점검 완료 — 위반 의심 시 reviewRequired 기록",
        status: "needsReview",
        riskLevel: "medium",
        requiresHumanEscalation: false,
        handoffs: [{ toAgentId: "jpo-audit", reason: "마스킹 점검 결과 감사 추적" }],
      });
      jpoInvalidateCounts();
      return { ok: true, message: `마스킹 점검 기록 ${run.id}` };
    },
  },
  {
    key: "/jeonse-export-review-packet",
    label: "검토 패킷 내보내기(익명)",
    description: "최근 케이스의 익명 검토 패킷(JSON)을 훅 검사 후 다운로드한다.",
    run() {
      const latest = jpoTable("jeonse_cases", JPO_ROLE_KEY)[0];
      if (!latest) return { ok: false, message: "케이스 없음" };
      const packet = {
        exportedAt: new Date().toISOString(),
        notice: "내부 운영 참고용 · 담당자 검토 필요 · 개인정보 원문 미포함",
        caseRef: { caseNo: latest.caseNo, taskType: latest.taskType, status: latest.status, riskLevel: latest.riskLevel },
        refs: {
          tenantRefId: latest.tenantRefId,
          contractRefId: latest.contractRefId,
          propertyRefId: latest.propertyRefId,
        },
        checklist: (jpoTable("jeonse_tasks", JPO_ROLE_KEY).filter((t) => t.caseId === latest.id).map((t) => t.title)),
        auditRefs: jpoTable("audit_logs", JPO_ROLE_KEY).filter((a) => a.targetId === latest.id).map((a) => a.id),
      };
      const serialized = JSON.stringify(packet, null, 2);
      const guard = jpoRunHook("beforeExternalReferenceOpen", { serialized });
      if (!guard.ok) return { ok: false, message: `내보내기 차단: ${guard.violations.join(" / ")}` };
      try {
        const blob = new Blob([serialized], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `jeonse-review-packet-${latest.caseNo}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
      } catch (error) { /* headless 환경 등에서는 다운로드 생략 */ }
      jpoWriteAudit({
        id: jpoNextId("AUD-JPO", "audit_logs"),
        actorId: "jpo-audit",
        action: "JPO_REVIEW_PACKET_EXPORTED",
        targetType: "case",
        targetId: latest.id,
        riskLevel: "low",
        reviewRequired: false,
        createdAt: new Date().toISOString().slice(0, 10),
      });
      return { ok: true, message: `검토 패킷 생성 (${latest.caseNo})` };
    },
  },
  {
    key: "/jeonse-run-smoke-test",
    label: "하네스 자체 검증 실행",
    description: "manifest·scope·PII·agent·hook 커버리지를 즉석 검증한다.",
    run() {
      if (typeof runHarnessSelfTest !== "function") return { ok: false, message: "검증기 미탑재" };
      const result = runHarnessSelfTest("jeonse-protection");
      jpoState.selfTest = result;
      return { ok: result.pass, message: result.pass ? "자체 검증 통과" : "자체 검증 실패 — 결과 패널 확인" };
    },
  },
];

function jpoRunCommand(key) {
  const command = jeonseProtectionCommands.find((item) => item.key === key);
  if (!command) return { ok: false, message: `알 수 없는 명령: ${key}` };
  const result = command.run() || { ok: true, message: command.label };
  if (typeof notify === "function") notify(`${command.key} — ${result.message}`);
  return result;
}
