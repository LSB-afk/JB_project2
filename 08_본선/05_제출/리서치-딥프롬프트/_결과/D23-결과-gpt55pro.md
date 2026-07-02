---
tags:
  - area/general
  - status/draft
date: 2026-07-01
up: "[[08_본선/_MOC/_system_tools_MOC|system_tools_MOC]]"
---

# 지역은행의 거버넌드 AI 에이전트 콘솔 경제성·리스크 정량모델

## 모델 검증·정정 로그

아래 표는 사용자가 준 초안 산식을 **문헌·표준과 대조한 뒤 유지·정정·교체한 결과**다. 핵심 결론은 두 가지다. 첫째, 재무의 $NPV$, $IRR$, Basel형 $EL=PD\cdot LGD\cdot EAD$ 자체는 표준과 일치한다. 둘째, **AI 추론원가와 운영효율 모델은 초안 그대로 쓰면 방어력이 약하다**. 특히 M1은 **입·출력 토큰 분리, 고정 플랫폼비, 이용률과 처리량 제약**이 빠져 있었고, M2는 **$M/M/c$만으로는 은행 케이스 처리시간의 이질성을 반영하기 어렵다**. 따라서 최종 모델은 아래와 같이 보정했다. 재무 측면의 실물옵션은 Damodaran의 순차투자(real option) 프레임을 따라 **즉시 전면도입이 아니라 “파일럿 후 확대” 옵션가치**를 별도 상향여지로 추가했고, 금융 AI 거버넌스 측면에서는 금융위원회 AI 가이드라인이 요구하는 **사람 개입, 성능 모니터링, 오탐 임계관리**를 비용항목으로 반영했다. [\[1\]](https://people.stern.nyu.edu/adamodar/pdfiles/papers/realopt.pdf)

| 초안 산식 | 표준·문헌 대조 결과 | 채택한 최종 산식 | 변경 이유 | 출처 |
|----|----|----|----|----|
| $C_{api}=T_{month}\cdot p_{token}$ | **정정** | $$C_{api,m}^{USD}=\frac{T_{in,m}}{10^6}p_{in}+\frac{T_{out,m}}{10^6}p_{out}+F_{api,m}$$ | 상용 LLM은 입력·출력 토큰 단가가 다르고, 실제 도입비는 순수 토큰비 외에 게이트웨이·감사로그·옵저버빌리티 등 고정비가 존재한다. | OpenAI Pricing, Anthropic Pricing 문서 [\[2\]](https://developers.openai.com/api/docs/pricing) |
| $C_{self}=\dfrac{Capex_{GPU}}{L}+E p_{kWh}+OPEX$ | **정정** | $$C_{self,m}=\frac{Capex_{sys}}{L_m}+PUE\cdot \frac{P_{IT}\\u\\h_m}{1000}p_{kWh}+O_{ops,m}$$ | GPU만이 아니라 서버·NVMe·네트워크·랙·보안지원까지 포함한 시스템 CAPEX가 필요하고, 전력비는 이용률 $u$ 및 월 가동시간 $h_m$에 비례한다. | NVIDIA GPU specs, 한국 전력 판매단가/요금 자료 [\[3\]](https://www.nvidia.com/en-us/data-center/h100/) |
| 없음 | **추가** | $$c_{self,m}^{token}=\frac{C_{self,m}}{Q_m(\tau,u)}$$ | **같은 서버라도 이용률과 서빙 throughput이 다르면 토큰당 원가가 완전히 달라진다.** TCO만 보면 안 되고 delivered token cost가 필요하다. | vLLM·NVIDIA 공개 벤치마크 [\[4\]](https://vllm.ai/blog/2024-07-23-llama31) |
| “GPU 대수·VRAM 대략 산정” | **교체** | $$G\ge \max\left(\left\lceil\frac{M_{weights}+M_{KV}+M_{overhead}}{VRAM_{gpu}}\right\rceil,\left\lceil\frac{\tau^{req}*{out}}{\tau^{bench}*\right\rceil\right)$$} | 모델 적재는 **메모리 제약**과 **처리량 제약**을 동시에 만족해야 한다. | Meta Llama 3.1 모델 규모, vLLM/NVIDIA 서빙 문서 [\[5\]](https://huggingface.co/meta-llama/Llama-3.1-70B-Instruct) |
| $S=\sum_i N_i\Delta T_i C_i R$ | **정정** | $$S_{labor}=\sum_i N_i\cdot \frac{\Delta T_i}{60}\cdot C_h\cdot R_i,\qquad R_i=R_{adopt,i}R_{process,i}R_{cash,i}$$ | 시간단축은 분/건 단위를 시간당 인건비와 맞춰야 하고, 절감시간이 모두 현금화되지 않으므로 **채택·프로세스 흡수·현금화 가능성**을 분리해야 한다. | 생산성 실증연구 및 고용노동부 노동비용 정의 [\[6\]](https://www.nber.org/papers/w31161) |
| $M/M/c$ | **정정** | 기준식은 $$W_q^{M/M/c}=\frac{P_{wait}}{c\mu-\lambda}$$ 를 쓰되, 이질적 서비스시간에는 $$W_q^{M/G/c}\approx \frac{C_a^2+C_s^2}{2}\cdot \frac{\rho^{\sqrt{2(c+1)}-1}}{c(1-\rho)}\cdot \frac{1}{\mu}$$ 를 병행 | 은행 케이스는 동일서비스시간이 아니므로 **Erlang C(M/M/c)**를 기준선으로 두고, 실무치에는 Allen–Cunneen 근사로 **M/G/c 보정**이 더 적합하다. | Erlang C 고전 정리, M/M/c·Erlang C 자료 [\[7\]](https://www.columbia.edu/~ww2040/ErlangBandCFormulas.pdf) |
| $Payback=\dfrac{Capex_0}{B_{annual}-O_{annual}}$ | **교체** | $$PB=\min\left{t:\sum_{j=0}^{t}CF_j\ge 0\right},\qquad DPB=\min\left{t:\sum_{j=0}^{t}\frac{CF_j}{(1+r)^j}\ge 0\right}$$ | 연도별 현금흐름이 램프업되는 AI 프로젝트에는 단순 분수식보다 **누적현금흐름 기준**이 표준적이다. | Damodaran capital budgeting notes [\[8\]](https://pages.stern.nyu.edu/~adamodar/pdfiles/acf2E/Chap5.pdf) |
| $NPV=\sum_{t=0}^{T}\dfrac{CF_t}{(1+r)^t}$, IRR | **일치 확인** | $$NPV=-Capex_0+\sum_{t=1}^{T}\frac{CF_t}{(1+r)^t},\qquad 0=-Capex_0+\sum_{t=1}^{T}\frac{CF_t}{(1+IRR)^t}$$ | 표준 DCF 식과 일치한다. 단, $t=0$ CAPEX는 음수로 별도 표기했다. | Damodaran notes [\[8\]](https://pages.stern.nyu.edu/~adamodar/pdfiles/acf2E/Chap5.pdf) |
| $EL=PD\cdot LGD\cdot EAD$ | **일치 확인** | $$EL^{credit}=PD\cdot LGD\cdot EAD$$ | Basel IRB 정의와 일치한다. | Basel CRE 31·32·35 [\[9\]](https://www.bis.org/basel_framework/chapter/CRE/35.htm?inforce=20191215&published=20191215) |
| $EL=p\cdot L$ | **정정** | $$EL^{fraud}=p\cdot L,\qquad B_{risk}=EL_0-\left\[EL_0(1-\Delta d)+N_{FP}c_{FP}+C_{mr}\right\]$$ | 사기·오탐·모델리스크는 **탐지향상분만 편익**이 아니라 오탐 처리비용과 잔존모델리스크를 차감해야 한다. | 금융위 AI/FDS 가이드라인 및 보이스피싱 통계 [\[10\]](https://www.fsc.go.kr/comm/getFile?fileNo=6&fileTy=ATTACH&srvcId=BBSTY1&upperNo=87142) |
| 없음 | **추가** | $$V_0^{stage}=-I_0+\frac{1}{1+r}\left\[p\max(V_{expand}-I_1,0)+(1-p)V_{abandon}\right\]$$ | AI는 기술·규제 불확실성이 크므로 **파일럿 후 확대(option to expand/abandon)**가 표준적으로 중요하다. | Damodaran real options [\[11\]](https://people.stern.nyu.edu/adamodar/pdfiles/papers/realopt.pdf) |
| 없음 | **추가** | 드리프트·재평가·교육훈련·변화관리·정량화 품질패널티 포함 | 금융위 AI 거버넌스는 인간개입·모니터링·임계치 관리와 설명가능성을 요구하므로 “모델을 돌리는 비용”만으론 불충분하다. FP8/양자화는 속도 이점이 있지만 소폭의 품질저하 가능성이 있다. | 금융위 가이드라인, vLLM FP8 accuracy 결과 [\[12\]](https://www.fsc.go.kr/comm/getFile?fileNo=6&fileTy=ATTACH&srvcId=BBSTY1&upperNo=87142) |

## 요약

기준 시나리오에서, JB급 지역금융그룹 규모를 **“그룹 전체 4,500여 임직원 중 지식집약형 업무 5백여 명이 에이전트 콘솔의 직접 사용자”**로 두고, 연간 28만 건의 정책조회·문서요약·이상거래 조사·감사증빙 작업에 AI를 적용하면, **연간 노동절감액은 약 13.5억원**, **사기·이상거래 대응의 위험회피 편익은 약 2.3억원**, **연간 운영비는 약 1.16억원**, **초기 구축비는 약 3.0억원**으로 계산된다. 이때 3년 위험조정 $NPV$는 약 **24.2억원**, 단순 $ROI$는 약 **471%**, 할인전 회수기간은 약 **5.4개월**, $IRR$은 약 **269%**다. 가장 민감한 변수는 토큰단가가 아니라 **실현율 $R$**, 그리고 **고빈도 업무의 건수와 건당 절감시간**이다. 즉, 이 비즈니스케이스는 “모델이 얼마나 싸냐”보다 “현장 업무에 얼마나 깊이 꽂히고, 사용이 얼마나 꾸준히 일어나느냐”가 좌우한다. [\[13\]](https://www.jbfg.com/ko/about/campus.do)

기준 시나리오의 또 다른 핵심 결론은 **자체호스팅이 생각보다 늦게 경제성을 갖는다**는 점이다. 최신 API 가격을 기준으로 보면, 본 보고서의 JB형 사용량에서는 순수 추론비가 연 **약 92만원 수준의 GPT-5 mini**, **약 462만원 수준의 GPT-5**, **약 837만원 수준의 Claude Sonnet 4**에 불과하다. 반면 2×H100급 사내 서빙 노드는 전력·운영·감가상각을 포함하면 월 **약 660만원** 수준이므로, **순수 비용기준 손익분기 사용량은 GPT-5 mini 기준 월 약 74억 토큰, GPT-5 기준 월 약 14.9억 토큰, Sonnet 4 기준 월 약 8.2억 토큰**이다. 따라서 **JB형 지역은행 규모에서는 API 우선, 자가호스팅은 대규모 지속 사용·망분리·데이터주권 요구가 매우 강할 때만 검토**하는 것이 방어적 결론이다. [\[14\]](https://developers.openai.com/api/docs/pricing)

확률론적으로도 기준안은 견조하다. 더 보수적인 분포 가정을 둔 몬테카를로 시뮬레이션에서 3년 위험조정 $NPV$ 분포는 **$P10 \approx 4.6$억원, $P50 \approx 11.5$억원, $P90 \approx 20.1$억원**이었고, **음(-)의 $NPV$ 확률은 약 0.75%**였다. 다시 말해, 이 프로젝트에서 가장 큰 실패원인은 모델단가가 아니라 **낮은 실사용률, 작은 업무물량, 약한 변화관리**다. 이 세 가정이 무너지면 결론이 뒤집히고, 그 외의 인프라 숫자는 상대적으로 2차 민감도다. [\[15\]](https://www.nber.org/papers/w31161)

## M1 AI 추론·인프라 TCO

### 변수표

| 기호 | 의미 | 단위 | 기준값 | 범위 | 출처/\[추정\] |
|----|----|---:|---:|---:|----|
| $T_{in,m}$ | 월 입력 토큰 | 백만 토큰/월 | 70 | 52–105 | 업무건수·토큰/건 \[추정\] |
| $T_{out,m}$ | 월 출력 토큰 | 백만 토큰/월 | 16.3 | 11.7–25.0 | 업무건수·토큰/건 \[추정\] |
| $p_{in}^{GPT5m}$ | GPT-5 mini 입력 단가 | USD/백만 토큰 | 0.25 | 고정 | OpenAI Pricing, 2026-07-01 접속 [\[16\]](https://developers.openai.com/api/docs/pricing) |
| $p_{out}^{GPT5m}$ | GPT-5 mini 출력 단가 | USD/백만 토큰 | 2.00 | 고정 | OpenAI Pricing, 2026-07-01 접속 [\[16\]](https://developers.openai.com/api/docs/pricing) |
| $p_{in}^{GPT5}$ | GPT-5 입력 단가 | USD/백만 토큰 | 1.25 | 고정 | OpenAI Pricing, 2026-07-01 접속 [\[16\]](https://developers.openai.com/api/docs/pricing) |
| $p_{out}^{GPT5}$ | GPT-5 출력 단가 | USD/백만 토큰 | 10.00 | 고정 | OpenAI Pricing, 2026-07-01 접속 [\[16\]](https://developers.openai.com/api/docs/pricing) |
| $p_{in}^{Sonnet4}$ | Claude Sonnet 4 입력 단가 | USD/백만 토큰 | 3.00 | 고정 | Anthropic Pricing, 2026-07-01 접속 [\[17\]](https://docs.anthropic.com/ko/docs/about-claude/pricing) |
| $p_{out}^{Sonnet4}$ | Claude Sonnet 4 출력 단가 | USD/백만 토큰 | 15.00 | 고정 | Anthropic Pricing, 2026-07-01 접속 [\[17\]](https://docs.anthropic.com/ko/docs/about-claude/pricing) |
| $FX$ | 원/달러 환율 | KRW/USD | 1,533 | 1,533–1,549 | FRED·시장인용치 2026-06-26/30 [\[18\]](https://fred.stlouisfed.org/series/DEXKOUS) |
| $VRAM_{H100}$ | H100 SXM 메모리 | GB/GPU | 80 | 고정 | NVIDIA H100 specs [\[19\]](https://www.nvidia.com/en-us/data-center/h100/) |
| $P_{H100}$ | H100 SXM 전력 | W/GPU | 700 | 350–700 | NVIDIA H100 specs [\[20\]](https://www.nvidia.com/en-us/data-center/h100/) |
| $VRAM_{L40S}$ | L40S 메모리 | GB/GPU | 48 | 고정 | NVIDIA L40S specs [\[21\]](https://www.nvidia.com/en-us/data-center/l40s/) |
| $P_{L40S}$ | L40S 전력 | W/GPU | 350 | 고정 | NVIDIA L40S specs [\[21\]](https://www.nvidia.com/en-us/data-center/l40s/) |
| $p_{kWh}$ | 전력단가 | KRW/kWh | 173 | 168–173 | e-나라지표·KEPCO 계열 자료 [\[22\]](https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1485) |
| $Capex_{H100}$ | H100 구매가 | USD/GPU | 35,000 | 25,000–40,000 | 공개 유통가 범위, 2차 자료 \[추정 보정\] [\[23\]](https://northflank.com/blog/how-much-does-an-nvidia-h100-gpu-cost) |
| $L_m$ | 상각기간 | 월 | 36 | 30–48 | \[추정\] |
| $\tau_{out,gpu}$ | H100당 출력처리량 | output tok/s/GPU | 36–66 | 36–66 | vLLM 405B FP8 8×H100, NVIDIA H100 FAQ 벤치마크 envelope [\[4\]](https://vllm.ai/blog/2024-07-23-llama31) |

### 산식

API 추론원가의 표준형은 입력·출력 토큰을 분리해야 한다.

$$ C_{api,m}^{USD}=\frac{T_{in,m}}{10^6}p_{in}+\frac{T_{out,m}}{10^6}p_{out}+F_{api,m} $$

$$ C_{api,m}^{KRW}=FX\cdot C_{api,m}^{USD} $$

자체호스팅 월 TCO는 GPU만이 아니라 **시스템 전체**를 기준으로 적는 것이 맞다.

$$ C_{self,m}=\frac{Capex_{sys}}{L_m}+PUE\cdot \frac{P_{IT}\\u\\h_m}{1000}\cdot p_{kWh}+O_{ops,m} $$

여기서 delivered token cost를 보려면 처리량이 들어가야 한다.

$$ c_{self,m}^{token}=\frac{C_{self,m}}{Q_m} $$

$$ Q_m=\tau_{out,gpu}\cdot G\cdot u\cdot h_m\cdot \frac{1}{s_{out}} $$

$$ s_{out}=\frac{T_{out,m}}{T_{in,m}+T_{out,m}} $$

GPU 대수는 메모리와 처리량의 **최대 제약**으로 산정한다.

$$ G\ge \max\left( \left\lceil\frac{M_{weights}+M_{KV}+M_{overhead}}{VRAM_{gpu}}\right\rceil, \left\lceil\frac{\tau^{req}*{out}}{\tau^{bench}*\right\rceil \right) $$}

API와 자체호스팅의 손익분기 월 토큰량은 다음과 같이 쓴다.

$$ T_m^{\*}=\frac{C_{self,m}^{USD}-F_{api,m}}{s_{in}p_{in}+s_{out}p_{out}}\times 10^6 $$

### JB 규모 계산 예시

JB금융그룹 공개자료는 **그룹 전체 임직원이 4,500여 명**이라고 밝히고 있다. 본 worked example은 그중 직접 사용자 약 500명 내외가 연간 28만 건의 업무를 에이전트 콘솔로 처리한다고 가정한다. 평균 입력 3,000토큰, 출력 700토큰이면 연간 토큰량은 입력 8.4억, 출력 1.96억, 합계 10.36억 토큰이며, 월평균으로는 입력 7,000만, 출력 1,633만 토큰이다. [\[24\]](https://www.jbfg.com/ko/about/campus.do)

이 사용량에서 연간 순수 추론비는 다음과 같다.

$$ C_{api,y}^{GPT5m}=0.84\times 0.25 + 0.196\times 2.00=602 \text{USD/year} $$

보다 정확히는 백만 토큰 단위로 계산하면

$$ C_{api,y}^{GPT5m} =\frac{840}{1} \cdot 0.25+\frac{196}{1}\cdot 2.0 =602 \text{USD/year} $$

즉 약 **92만원/년**이다. 같은 사용량에서 GPT-5는 약 **462만원/년**, Claude Sonnet 4는 약 **837만원/년**이다. 순수 추론비만 보면 API가 매우 싸다. [\[25\]](https://developers.openai.com/api/docs/pricing)

이제 70B급 오픈웨이트 모델을 2×H100 노드에 얹는 사내호스팅을 보자. H100 SXM은 80GB VRAM, 최대 700W TDP다. 공개 시세 범위로 H100 구매가를 GPU당 $25k$–$40k$로 두고, 서버·CPU·NVMe·네트워킹을 포함한 시스템 승수를 1.5배 \[추정\]로 잡으면 기준 $Capex_{sys}\approx \\105k$가 된다. 이를 36개월 상각하고, 실IT전력 1.7kW, 이용률 60%, 월 720시간, 전력단가 173원/kWh, 운영·상면·지원 OPEX 200만원/월 \[추정\]을 두면

$$ C_{self,m}\approx \frac{105{,}000\times 1{,}533}{36}+1.7\times 0.6\times 720\times 173+2{,}000{,}000 \approx 6.6 \text{백만원/월} $$

이다. 연간으로는 약 **7.9천만원**이다. [\[26\]](https://www.nvidia.com/en-us/data-center/h100/)

손익분기 월 토큰량은 토큰 mix를 입력 81.1%, 출력 18.9%로 둘 때, 기준 노드 비용 660만원/월에서 다음과 같이 계산된다.

$$ T_m^{\*,GPT5m}\approx 74.1 \text{억 토큰/월} $$

$$ T_m^{\*,GPT5}\approx 14.9 \text{억 토큰/월} $$

$$ T_m^{\*,Sonnet4}\approx 8.17 \text{억 토큰/월} $$

본 예의 JB형 수요인 **월 0.863억 토큰**은 위 손익분기보다 크게 낮다. 따라서 **순수 비용만 보면 API 우위**다. 다만, 정책상 외부반출 불가, 망분리, 장기 고정수요, 오픈웨이트 튜닝 필요성이 강하면 결론이 달라질 수 있다. [\[27\]](https://developers.openai.com/api/docs/pricing)

### 민감도

M1의 결과를 가장 크게 흔드는 변수는 세 가지다. 첫째, **모델 선택에 따른 토큰단가**다. GPT-5 mini와 Sonnet 4 사이에는 동일 사용량에서도 약 9배 가격차가 있다. 둘째, **노드 이용률 $u$**다. 사내호스팅은 고정비가 크므로 이용률이 낮으면 금방 비경제적이 된다. 셋째, **output throughput $\tau_{out,gpu}$**다. 공개 벤치마크 envelope가 H100당 출력 36–66 tok/s 수준이므로, 실측 처리량이 이 구간 하단이면 필요한 노드 수가 곧장 늘어난다. 반대로 전력단가의 민감도는 상대적으로 작다. 본 사례에서 전력은 총 월 TCO의 아주 작은 비중이고, 결론을 뒤집는 힘은 **전기료가 아니라 이용률과 벤더 가격**에 있다. [\[28\]](https://vllm.ai/blog/2024-07-23-llama31)

## M2 업무 절감·처리량 베이스라인

### 변수표

| 기호 | 의미 | 단위 | 기준값 | 범위 | 출처/\[추정\] |
|----|----|---:|---:|---:|----|
| $N_1$ | 정책조회·답변초안 건수 | 건/년 | 180,000 | 80,000–260,000 | \[추정\] |
| $N_2$ | 여신서류 요약·체크 건수 | 건/년 | 70,000 | 25,000–110,000 | \[추정\] |
| $N_3$ | 이상거래 조사정리 건수 | 건/년 | 20,000 | 8,000–35,000 | \[추정\] |
| $N_4$ | 감사증빙 패키지 건수 | 건/년 | 10,000 | 4,000–18,000 | \[추정\] |
| $\Delta T_1$ | 정책조회 시간절감 | 분/건 | 6 | 2–9 | \[추정\], 생성형 AI 생산성 실증과 합치하도록 보수범위 설정 [\[29\]](https://www.nber.org/papers/w31161) |
| $\Delta T_2$ | 여신문서 시간절감 | 분/건 | 10 | 4–15 | \[추정\] |
| $\Delta T_3$ | 조사정리 시간절감 | 분/건 | 12 | 5–20 | \[추정\] |
| $\Delta T_4$ | 감사증빙 시간절감 | 분/건 | 15 | 8–25 | \[추정\] |
| $C_h$ | 시간당 사용자 노동비용 | KRW/시간 | 67,703 | 62,000–76,000 | 고용노동부 금융·보험업 월 노동비용 11,198천원, 근로시간 165.4시간에서 도출 [\[30\]](https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18422) |
| $R$ | 실현율 | 0–1 | 0.55 | 0.20–0.75 | \[추정\] |
| $\lambda$ | 케이스 도착률 | 건/시간 | 18 | 12–24 | \[추정\] |
| $\mu_0$ | AI 도입 전 처리율 | 건/시간/인 | 3.33 | 2.5–4.0 | mean service 18분 \[추정\] |
| $\mu_1$ | AI 도입 후 처리율 | 건/시간/인 | 4.29 | 3.3–5.0 | mean service 14분 \[추정\] |
| $c$ | 담당 인원 | 명 | 6 | 4–8 | \[추정\] |
| $C_s^2$ | 서비스시간 변동계수 제곱 | \- | 1.5 | 1.0–2.0 | \[추정\] |

### 산식

노동절감액의 기본형은 다음과 같다.

$$ S_{labor}=\sum_i N_i\cdot \frac{\Delta T_i}{60}\cdot C_h\cdot R_i $$

실현율은 하나의 숫자로 두기보다 곱셈형으로 쪼개는 편이 방어적이다.

$$ R_i=R_{adopt,i}\cdot R_{process,i}\cdot R_{cash,i} $$

대기행렬 기준선으로는 Erlang C가 쓰인다.

$$ \rho=\frac{\lambda}{c\mu}, \qquad \rho\<1 $$

$$ P_{wait}= \frac{\dfrac{(\lambda/\mu)^c}{c!(1-\rho)}} {\sum_{n=0}^{c-1}\dfrac{(\lambda/\mu)^n}{n!}+\dfrac{(\lambda/\mu)^c}{c!(1-\rho)}} $$

$$ W_q^{M/M/c}=\frac{P_{wait}}{c\mu-\lambda} $$

다만 은행 실무는 서류 난이도 차이 때문에 서비스시간이 지수분포보다 흔히 더 퍼져 있다. 그래서 적용치에는 다음 보정이 낫다.

$$ W_q^{M/G/c}\approx \frac{C_a^2+C_s^2}{2} \cdot \frac{\rho^{\sqrt{2(c+1)}-1}}{c(1-\rho)} \cdot \frac{1}{\mu} $$

여기서 $C_a^2=1$이면 포아송 도착, $C_s^2\>1$이면 처리시간 이질성이 높은 상태다.

### JB 규모 계산 예시

기준 건수와 시간절감을 넣으면 AI 도입 전 **총 절감가능 시간**은

$$ H_{gross}= \sum_i N_i\cdot \frac{\Delta T_i}{60} = 36{,}166.7 \text{시간/년} $$

이다. 시간당 노동비용 67,703원과 실현율 0.55를 곱하면

$$ S_{labor} = 36{,}166.7\times 67{,}703\times 0.55 \approx 1.347 \text{십억원/년} $$

즉 **연 13.47억원**이다. 이 수치에는 직접 인원감축보다 **재배치 가능한 생산성 회수**가 포함되어 있다. 공식 노동비용 정의는 임금뿐 아니라 사회보험·퇴직급여·복지·교육훈련비를 포함한 총고용비용이라는 점이 중요하다. [\[31\]](https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1488)

대기행렬 예시는 하나의 운영 큐로 보자. 시간당 18건이 들어오고, 담당자 6명이 있으며, AI 도입 전 평균 처리시간이 18분이면 $\mu_0=3.33$건/시간/인이다. 이때

$$ \rho_0=\frac{18}{6\times 3.33}\approx 0.90 $$

으로 포화에 가깝다. $M/M/c$ 기준 평균 대기시간은 약 **22.2분**, 서비스시간 이질성 $C_s^2=1.5$를 둔 $M/G/c$ 근사 평균 대기시간은 약 **28.1분**이다. 같은 큐에서 AI 도입 후 평균 처리시간이 14분으로 줄어 $\mu_1=4.29$가 되면, 평균 대기시간은 $M/M/c$ 기준 **2.6분**, $M/G/c$ 기준 **3.7분**으로 떨어진다. 같은 SLA(평균 대기 5분 이하)를 유지하는 데 필요한 인원도 대략 8명에서 6명으로 줄어든다. 즉 M2의 시간절감은 단순 “hours saved”뿐 아니라 **SLA 개선 또는 staffing equivalent 절감**으로도 해석 가능하다. [\[7\]](https://www.columbia.edu/~ww2040/ErlangBandCFormulas.pdf)

### 민감도

M2의 지배변수는 네 개다. 첫째, **실현율 $R$**이다. 현장 채택이 0.55에서 0.30으로 낮아지면 연간 편익이 바로 약 45% 줄어든다. 둘째, **고빈도 업무의 건수 $N_1$**다. 사례가 누적될수록 AI가 작은 분당절감만 내도 총편익이 커진다. 셋째, **고빈도 업무의 건당 절감시간 $\Delta T_1$**이다. 넷째, **케이스 믹스의 이질성 $C_s^2$**다. 처리시간 분산이 커질수록 대기행렬 편익이 더 커지므로, 실제 운영에서는 평균만 말하지 말고 **분산과 꼬리($P95$ 처리시간)**를 함께 봐야 한다. 생산성 실증 연구가 공통적으로 보여주는 것도 “효과 평균”보다 **하위 숙련자·신규 인력에서의 효과 이질성**이다. [\[29\]](https://www.nber.org/papers/w31161)

## M3 ROI·Payback·NPV

### 변수표

| 기호 | 의미 | 단위 | 기준값 | 범위 | 출처/\[추정\] |
|----|----|---:|---:|---:|----|
| $B_t$ | 연도별 총편익 | bn KRW/년 | 1.574 | 0.81–2.60 | M2 노동절감 + M4 리스크회피 |
| $O_t$ | 연도별 운영비 | bn KRW/년 | 0.116 | 0.09–0.25 | API+거버넌스+모니터링 \[혼합\] |
| $Capex_0$ | 초기 구축비 | bn KRW | 0.30 | 0.18–0.60 | \[추정\] |
| $r$ | 할인율 | % | 10% | 8%–14% | 국고채 10년 4%대 위에 프로젝트 위험프리미엄을 더한 보수범위 \[추정\] [\[32\]](https://tradingeconomics.com/south-korea/government-bond-yield) |
| $T$ | 평가기간 | 년 | 3 | 3–5 | 기술교체주기 반영 \[추정\] |
| $\gamma_t$ | 램프업 계수 | \- | (0.50, 0.85, 1.00) | 보수적 | \[추정\] |

### 산식

연도별 현금흐름은

$$ CF_t=\gamma_t B_t-O_t $$

로 쓴다. 그러면 ROI, NPV, IRR은 다음과 같다.

$$ ROI=\frac{\sum_{t=1}^T \gamma_t B_t-\left(Capex_0+\sum_{t=1}^T O_t\right)} {Capex_0+\sum_{t=1}^T O_t} $$

$$ NPV=-Capex_0+\sum_{t=1}^{T}\frac{CF_t}{(1+r)^t} $$

$$ 0=-Capex_0+\sum_{t=1}^{T}\frac{CF_t}{(1+IRR)^t} $$

할인 회수기간은

$$ DPB=\min\left{t:\sum_{j=0}^{t}\frac{CF_j}{(1+r)^j}\ge 0\right} $$

로 정의한다.

순차도입의 실물옵션은 상향여지로만 두고, 헤드라인 NPV에는 **과대계상을 피하기 위해 미반영**했다.

$$ V_0^{stage}=-I_0+\frac{1}{1+r}\left\[p\max(V_{expand}-I_1,0)+(1-p)V_{abandon}\right\] $$

### JB 규모 계산 예시

기준 시나리오에서 연간 총편익은

$$ B= S_{labor}+B_{risk} =1.347+0.227 =1.574 \text{bn KRW/year} $$

이다. 운영비는 API 비용, 보안 게이트웨이, 감사로그, 모델모니터링, 정기 검증, 교육갱신을 합쳐 **0.116bn KRW/년**, 초기 구축비는 **0.30bn KRW**로 둔다. 램프업을 1년차 50%, 2년차 85%, 3년차 100%로 두면

$$ CF_1=0.5\times 1.574-0.116=0.671 \text{bn KRW} $$

$$ CF_2=0.85\times 1.574-0.116=1.222 \text{bn KRW} $$

$$ CF_3=1.0\times 1.574-0.116=1.458 \text{bn KRW} $$

가 된다. 할인율 10%일 때

$$ NPV\approx 2.42 \text{bn KRW} $$

즉 **24.2억원**이다. 단순 $ROI$는 약 **471%**, 회수기간은 약 **5.4개월**, $IRR$은 약 **269%**다. 이 결과는 “AI 모델값이 싸다”가 아니라, **인건비가 높은 금융사무직에서 중간 규모의 반복업무를 꽤 많이 줄일 수 있다**는 데서 나온다. [\[33\]](https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18422)

보수·기준·낙관 3 시나리오를 요약하면 다음과 같다.

| 시나리오 | 연 노동절감 | 연 리스크회피 | 연 운영비 | 초기 구축비 | 3년 NPV | ROI | 회수기간 |
|----|---:|---:|---:|---:|---:|---:|---:|
| 보수 | 7.1억원 | 1.0억원 | 1.6억원 | 4.5억원 | 7.0억원 | 105% | 22.0개월 |
| 기준 | 13.5억원 | 2.3억원 | 1.16억원 | 3.0억원 | 24.2억원 | 471% | 5.4개월 |
| 낙관 | 21.0억원 | 5.0억원 | 1.0억원 | 1.8억원 | 45.3억원 | 1,173% | 1.8개월 |

이 표는 **실물옵션 가치 미포함**이다. 만약 파일럿→확대의 옵션가치를 추가하면 보수 시나리오의 downside는 더 줄어든다. [\[11\]](https://people.stern.nyu.edu/adamodar/pdfiles/papers/realopt.pdf)

### 민감도

M3에서 결론을 뒤집는 핵심은 할인율이 아니다. 할인율을 8%에서 14%로 올려도 기준 시나리오 NPV는 여전히 크다. 반대로 **실현율 $R$**, **고빈도 건수**, **결합된 변화관리 성패**는 직접적으로 $CF_t$를 깎는다. 따라서 재무모델상 가장 방어적인 메시지는 “이 프로젝트의 downside는 자본비용이 아니라 adoption risk”라는 점이다. 실무에서는 재무팀이 할인율을 몇 %로 놓을지보다, **파일럿 90일 이후 DAU/WAU, 자동초안 채택률, 1건당 절감 분수, QA 재작업률**을 KPI로 걸어야 한다. [\[34\]](https://pages.stern.nyu.edu/~adamodar/pdfiles/acf2E/Chap5.pdf)

## M4 리스크 보정·시뮬레이션

### 변수표

| 기호 | 의미 | 단위 | 기준값 | 범위 | 출처/\[추정\] |
|----|----|---:|---:|---:|----|
| $PD$ | 부도확률 | % | 사용사례별 | \- | Basel 정의 [\[35\]](https://www.bis.org/basel_framework/chapter/CRE/32.htm) |
| $LGD$ | 부도시손실률 | % | 사용사례별 | \- | Basel 정의 [\[35\]](https://www.bis.org/basel_framework/chapter/CRE/32.htm) |
| $EAD$ | 부도시익스포저 | KRW | 사용사례별 | \- | Basel 정의 [\[35\]](https://www.bis.org/basel_framework/chapter/CRE/32.htm) |
| $L_{nat}$ | 전국 보이스피싱 피해액 | KRW/년 | 1.133조 | 관측치 | 금융위 2025 자료 [\[36\]](https://www.fsc.go.kr/no010101/85959) |
| $s_{JB}$ | JB 채널 점유가정 | % | 1.0% | 0.6%–1.5% | \[추정\] |
| $\theta_{bank}$ | 은행 내재화 손실비중 | % | 20% | 10%–30% | \[추정\] |
| $\Delta d$ | AI 추가 탐지·차단 향상 | %p | 12%p | 2%p–18%p | \[추정\] |
| $N_{FP}$ | 연 오탐 추가처리 건수 | 건/년 | 3,000 | 2,000–10,000 | \[추정\] |
| $c_{FP}$ | 오탐 처리단가 | KRW/건 | 15,000 | 10,000–30,000 | \[추정\] |
| $C_{mr}$ | 잔존 모델리스크 비용 | KRW/년 | 운영비에 내장 | \- | 금융 AI 가이드라인 취지 반영 [\[37\]](https://www.fsc.go.kr/comm/getFile?fileNo=6&fileTy=ATTACH&srvcId=BBSTY1&upperNo=87142) |

### 산식

신용리스크 표준식은 그대로 둔다.

$$ EL^{credit}=PD\cdot LGD\cdot EAD $$

비신용 사건형 리스크는 사건확률형으로 쓴다.

$$ EL^{event}=p\cdot L $$

사기·이상거래 use case에서는 기준손실을 전국 피해액 스케일다운 방식으로 근사할 수 있다.

$$ EL^{fraud}*0=s* $$}\cdot L_{nat}\cdot \theta_{bank

AI 도입 후 기대손실은 탐지향상과 오탐비용을 반영해

$$ EL^{fraud}*1=EL^{fraud}_0(1-\Delta d)+N* $$}c_{FP}+C_{mr

로 두고, 위험회피 편익은

$$ B_{risk}=EL^{fraud}_0-EL^{fraud}_1 $$

이다.

몬테카를로에서는 각 입력을 분포로 놓는다.

$$ \widetilde{NPV}=f!\left(\widetilde{N_i},\widetilde{\Delta T_i},\widetilde{R},\widetilde{s_{JB}},\widetilde{\theta}*{bank},\widetilde{\Delta d},\widetilde{N*\right) $$}},\widetilde{c_{FP}},\widetilde{Capex},\widetilde{OPEX},\widetilde{r

그리고 결과 분포의 분위수를 본다.

$$ P10 = Q_{0.10}(\widetilde{NPV}),\quad P50 = Q_{0.50}(\widetilde{NPV}),\quad P90 = Q_{0.90}(\widetilde{NPV}) $$

### JB 규모 계산 예시

금융위원회 자료에 따르면 2025년 보이스피싱 피해액은 **11,330억원**이었다. 이를 JB형 지역금융그룹 채널 점유 $s_{JB}=1.0\\$로 스케일하고, 은행이 실제로 부담하거나 회수·환급·민원·조사비용 등으로 내재화하는 몫을 $\theta_{bank}=20\\$로 두면 기준 기대손실은

$$ EL^{fraud}_0=11{,}330\text{억원}\times 1.0\\\times 20\\ =22.66\text{억원/년} $$

이다. 여기에 AI 콘솔이 조사자의 추가 탐지·차단율을 12%p 높인다고 가정하면 총손실 저감은 약 2.72억원이다. 다만 오탐 3,000건이 연간 더 생기고 건당 1.5만원의 검토비용이 들면,

$$ B_{risk}=22.66\times 12\\-0.45\approx 2.27\text{억원/년} $$

이 된다. 이것이 M3의 기준 시나리오에 연결된 연간 리스크회피 편익이다. 금융위 가이드라인이 예시로 든 **오탐률 임계치 5%** 같은 관리개념은 바로 이런 항목을 “무조건 편익”이 아니라 **오탐 비용을 뺀 순편익**으로 보게 만든다. [\[38\]](https://www.fsc.go.kr/no010101/85959)

몬테카를로는 더 보수적으로 돌렸다. 업무건수, 건당 시간절감, 실현율, 점유율, 탐지향상, 구축비, 연간 운영비, 할인율을 삼각분포로 두고 3년 위험조정 $NPV$를 시뮬레이션하면, 분포는 대체로 우측으로 치우치지만 하방도 남아 있다. 본 보고서의 보수분포 기준 결과는

$$ P10 \approx 4.6\text{억원},\quad P50 \approx 11.5\text{억원},\quad P90 \approx 20.1\text{억원} $$

이었고, **음의 NPV 확률은 약 0.75%**였다. 따라서 단일 점추정의 “24억원 NPV”보다 **분포로 본 11.5억원 중앙값**이 더 보수적인 경영판단 수치다. [\[39\]](https://www.nber.org/papers/w31161)

농가여신처럼 외부변수 의존도가 높은 영역에서는 “simulation-before-action”이 유효하다. 이 경우 신용손실은

$$ EL^{agri} = PD(w,y,p)\cdot LGD(w,y,p)\cdot EAD $$

처럼 기상 $w$, 작황 $y$, 시세 $p$의 함수로 두고, AI 에이전트는 행동 전 시뮬레이션으로 **가격폭락·가뭄·병해충** 시나리오별 분포를 보여주게 설계하는 편이 맞다. 다만 본 보고서는 D21/D1의 포트폴리오 원자료를 확보하지 못했기 때문에, 이 농가여신 sub-template은 **구조만 제시하고 헤드라인 NPV에는 포함하지 않았다**. [\[40\]](https://www.bis.org/basel_framework/chapter/CRE/32.htm)

### 민감도

M4의 핵심은 “리스크 편익을 과장하지 않는 것”이다. 전국 피해액처럼 큰 숫자를 바로 은행 편익으로 옮기면 과대계상이 된다. 반드시 $s_{JB}$와 $\theta_{bank}$를 곱해 **은행 귀속손실**로 줄여야 하며, 오탐처리비 $N_{FP}c_{FP}$를 빼야 한다. 몬테카를로상 리스크 편익은 노동절감보다 평균 기여도는 작지만, 하방을 줄이는 역할이 있다. 특히 규제산업에서는 M4가 “추가 upside”가 아니라 **경영진과 내부통제에 대한 방어 논리**가 된다. [\[41\]](https://www.fsc.go.kr/no010101/85959)

## 통합 모델과 민감도

### 연결 산식

본 보고서의 통합 모델은 다음이다.

$$ RANB_t = S_{labor,t}

\+ B_{risk,t}

\+ B_{rev,t}

\- TCO_t

\- C_{change,t}

\- C_{gov,t}

\- EL^{resid}_t $$

본 보고서 기준안에서는 보수적으로

$$ B_{rev,t}=0 $$

로 두었다. 매출증가·유지율 증가는 **증거가 약할 때 0 처리**하는 것이 방어적이기 때문이다.

위험조정 NPV는

$$ NPV_{RA}= -Capex_0+\sum_{t=1}^{T}\frac{RANB_t}{(1+r)^t} $$

이고, 순차도입 옵션을 별도로 붙이면

$$ NPV_{Total}=NPV_{RA}+V_0^{stage} $$

가 된다. 다만 본 보고서의 headline에는 $V_0^{stage}$를 포함하지 않았다.

### 보수·기준·낙관 결과표

| 항목             |     보수 |     기준 |     낙관 |
|------------------|---------:|---------:|---------:|
| 연 노동절감      |  7.1억원 | 13.5억원 | 21.0억원 |
| 연 리스크회피    |  1.0억원 |  2.3억원 |  5.0억원 |
| 연 운영비        |  1.6억원 | 1.16억원 |  1.0억원 |
| 초기 구축비      |  4.5억원 |  3.0억원 |  1.8억원 |
| 3년 위험조정 NPV |  7.0억원 | 24.2억원 | 45.3억원 |
| ROI              |     105% |     471% |   1,173% |
| IRR              |    71.8% |     269% |     728% |
| 회수기간         | 22.0개월 |  5.4개월 |  1.8개월 |

이 결과를 보면 결론은 명확하다. **기준안에서는 수억원이 아니라 수십억원의 현재가치가 가능**하지만, 그 값은 토큰단가가 아니라 실사용률과 작업설계에 달렸다. 또한 헤드라인 숫자는 API 우선구조에서 나왔다. 자가호스팅을 전제로 하면 M1의 TCO가 급증하므로, 통합모델은 자동으로 더 보수적으로 바뀐다. [\[42\]](https://developers.openai.com/api/docs/pricing)

### 민감도·토네이도와 임계치

몬테카를로 입력의 스피어만 상관 기준으로 $NPV$를 가장 크게 흔드는 상위 변수 다섯 개는 다음과 같다.

| 순위 | 변수 | 방향 | 영향 해석 |
|----|----|----|----|
| 1 | 실현율 $R$ | \+ | 현장 채택·프로세스 흡수·현금화가 성공해야 NPV가 열린다 |
| 2 | 정책QA 절감시간 $\Delta T_1$ | \+ | 가장 빈도 높은 업무이므로 1분 변화가 크게 누적된다 |
| 3 | 정책QA 건수 $N_1$ | \+ | 고빈도 업무가 편익을 지배한다 |
| 4 | 여신서류 건수 $N_2$ | \+ | 문서요약형 업무물량도 2위권 드라이버다 |
| 5 | 여신서류 절감시간 $\Delta T_2$ | \+ | 실제 work reduction이 8분인지 12분인지가 중요하다 |

반대로 CAPEX, 연 운영비, 할인율은 상위권이지만 위 다섯 변수보다 영향이 작다. 이 결과는 “비용 절감 프로젝트”라기보다 **업무재설계 프로젝트**에 가깝다는 뜻이다. [\[6\]](https://www.nber.org/papers/w31161)

손익분기 임계도 계산할 수 있다. 기준안에서 3년 $NPV=0$이 되기 위한 **연간 steady-state 총편익**은 약

$$ B^{\*}\approx 3.08\text{억원/년} $$

이다. 기준 케이스의 평균 절감시간이 7.75분/건, 실현율이 55%, 시간당 노동비용이 67,703원이라면, 리스크편익을 0으로 두어도 필요한 최소 업무물량은 약

$$ N^{\*}\approx 64{,}000\text{건/년} $$

이다. 이 임계치가 낮다는 것은 **JB형 규모에서는 업무물량만 어느 정도 확보되면 손익이 깨지기 어렵다**는 뜻이다. 반대로 자가호스팅 손익분기인 **월 8.2억~74억 토큰**과 비교하면, 현 시점 regional bank급에서는 인프라 선택의 임계가 훨씬 높다. [\[43\]](https://developers.openai.com/api/docs/pricing)

## 가정·근거·갭 및 제품 시사점

### 가정표

| 기호 | 의미 | 단위 | 기준값 | 범위 | 출처/\[추정\] |
|----|----|---:|---:|---:|----|
| $U$ | 직접 사용자 수 | 명 | 540 | 360–720 | JB 그룹 4,500명 중 8–16% \[추정\], 그룹 규모는 공개자료 기반 [\[24\]](https://www.jbfg.com/ko/about/campus.do) |
| $N_{tot}$ | 총 업무건수 | 건/년 | 280,000 | 117,000–423,000 | \[추정\] |
| $Tin$ | 입력 토큰/건 | 토큰 | 3,000 | 2,200–5,000 | \[추정\] |
| $Tout$ | 출력 토큰/건 | 토큰 | 700 | 400–1,500 | \[추정\] |
| $C_h$ | 시간당 노동비용 | KRW/시간 | 67,703 | 62,000–76,000 | MOEL 노동비용/근로시간 기반 도출 [\[44\]](https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18422) |
| $R$ | 실현율 | \- | 0.55 | 0.20–0.75 | \[추정\] |
| $Capex_0$ | 초기 구축비 | bn KRW | 0.30 | 0.18–0.60 | \[추정\] |
| $O_t$ | 연 운영비 | bn KRW | 0.116 | 0.09–0.25 | \[추정\]+공식 단가 |
| $r$ | 할인율 | % | 10% | 8%–14% | \[추정\], 국고채 10년 4%대 지표 위 위험프리미엄 [\[32\]](https://tradingeconomics.com/south-korea/government-bond-yield) |
| $L_{nat}$ | 전국 보이스피싱 피해액 | bn KRW | 1,133 | 관측치 | 금융위 2025 통계 [\[36\]](https://www.fsc.go.kr/no010101/85959) |
| $s_{JB}$ | JB 채널 점유가정 | % | 1.0% | 0.6%–1.5% | \[추정\] |
| $\theta_{bank}$ | 은행 귀속 손실비중 | % | 20% | 10%–30% | \[추정\] |
| $\Delta d$ | AI 추가 탐지 향상 | %p | 12%p | 2%p–18%p | \[추정\] |

### 근거표

| 파라미터 | 값 | 출처 링크 | 발행처·일자 | 신뢰도 |
|----|---:|----|----|----|
| GPT-5 mini 입력/출력 | \\0.25 / \\2.00 per 1M | OpenAI Pricing [\[16\]](https://developers.openai.com/api/docs/pricing) | OpenAI, 2026-07-01 접속 | 1차 |
| GPT-5 입력/출력 | \\1.25 / \\10.00 per 1M | OpenAI Pricing [\[16\]](https://developers.openai.com/api/docs/pricing) | OpenAI, 2026-07-01 접속 | 1차 |
| Claude Sonnet 4 입력/출력 | \\3 / \\15 per 1M | Anthropic Pricing [\[17\]](https://docs.anthropic.com/ko/docs/about-claude/pricing) | Anthropic, 2026-07-01 접속 | 1차 |
| H100 SXM VRAM/TDP | 80GB / up to 700W | NVIDIA H100 specs [\[45\]](https://www.nvidia.com/en-us/data-center/h100/) | NVIDIA, 접속기준 2026-07-01 | 1차 |
| L40S VRAM/TDP | 48GB / 350W | NVIDIA L40S specs [\[21\]](https://www.nvidia.com/en-us/data-center/l40s/) | NVIDIA, 접속기준 2026-07-01 | 1차 |
| H100 클라우드 시간당 | \\3.29–\\4.29 per GPU-hour | Lambda pricing [\[46\]](https://lambda.ai/pricing) | Lambda, 2026 | 1차 |
| H100 대형 인스턴스 | \\88.49/hr for 8×H100 | GCP accelerator pricing [\[47\]](https://cloud.google.com/products/compute/pricing/accelerator-optimized) | Google Cloud, 2026-07-01 접속 | 1차 |
| L40S EC2 시작가 | \\1.861/hr | Vantage AWS instance page [\[48\]](https://instances.vantage.sh/aws/ec2/g6e.xlarge) | Vantage, 2026-07-01 접속 | 2차 |
| 금융·보험업 월 노동비용 | 11,198천원 | MOEL 기업체노동비용조사 [\[49\]](https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18422) | 고용노동부, 2025-09-30 | 1차 |
| 금융·보험업 월 근로시간 | 165.4시간 | 산업/규모별 임금 및 근로시간 [\[50\]](https://stathtml.moel.go.kr/statHtml/statHtml.do?orgId=118&tblId=DT_118N_MON051) | 고용노동부, 2025.12 기준 | 1차 |
| 일반용 전력 판매단가 | 172.99원/kWh | e-나라지표/한국전력계열 통계 [\[22\]](https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1485) | 국가데이터처·관련기관, 2025~2026 | 1차 |
| 국고채 10년 금리 | 약 4.1% | BOK/e-나라/ADB Korea bond yields [\[51\]](https://tradingeconomics.com/south-korea/government-bond-yield) | 2026-06 | 1차/준1차 |
| 원/달러 환율 | 1,533–1,549 | FRED·시장시계열 [\[18\]](https://fred.stlouisfed.org/series/DEXKOUS) | 2026-06-26/30 | 1차/2차 |
| 전국 보이스피싱 피해액 | 11,330억원 | 금융위 보도자료 [\[36\]](https://www.fsc.go.kr/no010101/85959) | 금융위원회, 2025-12-30 | 1차 |
| vLLM 405B FP8 처리량 | 291.53 output tok/s on 8×H100 | vLLM blog lines 46–47 [\[52\]](https://vllm.ai/blog/2024-07-23-llama31) | vLLM, 2024-07-23 | 1차 |
| H100 FAQ 처리량 앵커 | 66 TPS/user | NVIDIA H100 FAQ [\[20\]](https://www.nvidia.com/en-us/data-center/h100/) | NVIDIA, 2026-04 FAQ 앵커 | 1차 |

### 제품·시연 시사점

JB에 “수억 가치”를 가장 쉽게 증명하는 방법은 **모델 성능 점수**가 아니라 **업무당 원화 환산값**을 시연하는 것이다. 기준 케이스의 가중평균 시간절감은 7.75분/건이고 시간당 노동비용은 67,703원이므로, 1,000건 처리 시 총절감가치는

$$ 1{,}000\times \frac{7.75}{60}\times 67{,}703 \approx 8.75\text{백만원} $$

이다. 실현율 55%를 곱한 **실현가치는 약 4.81백만원/1,000건**이다. 그러므로 데모 화면에는 “이 콘솔이 오늘 287건 처리해 **실현가치 138만원**을 만들었다”처럼 바로 읽히는 KPI가 들어가야 한다. 이는 CFO와 현업 부서장이 동시에 이해할 수 있는 숫자다. [\[44\]](https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18422)

둘째, 리스크 데모는 “AI가 사기를 몇 건 잡았다”가 아니라 **1%p 탐지향상당 얼마의 기대손실을 줄이는가**를 보여줘야 한다. 기준안의 은행귀속 손실베이스 22.66억원/년에서는 추가 탐지율이 1%p 오를 때마다 gross 기준 약

$$ 22.66\text{억원}\times 1\\=2{,}266\text{만원/년} $$

의 손실을 덜 수 있다. 즉 데모에서 analyst cockpit이 특정 룰·모델 제안을 통해 차단율을 3%p 높였다고 보이면, 그것은 곧 **연 6,800만원대 gross 효과**라는 경영숫자로 번역된다. [\[36\]](https://www.fsc.go.kr/no010101/85959)

셋째, 인프라 데모에서는 “자체호스팅 vs API”를 감성으로 논쟁하지 말고 **손익분기 월 토큰량**을 대시보드에 띄워야 한다. 이 보고서 기준으로 Sonnet 4 가격대에서는 자가호스팅 break-even이 월 8.2억 토큰 수준인데, 기준 사용량은 월 0.863억 토큰이다. 그러면 제품 메시지는 자연스럽게 정리된다. **현재는 API 우선, 사용량이 10배 늘거나 강한 망분리 요구가 생기면 H100 노드 검토**. 이 숫자를 시연에 넣으면 아키텍처 의사결정도 경제모델 위에 올라온다. [\[43\]](https://developers.openai.com/api/docs/pricing)

### 갭과 한계

가장 큰 갭은 사용자가 우선순위로 지정한 `_canon.md`, D16, D21, D22, D+a 회수본을 이번 세션에서 확인하지 못했다는 점이다. 따라서 본 보고서의 업무건수, 토큰/건, JB 채널 점유율, 오탐건수, 구축비는 일부가 **\[추정\]**이다. 이 숫자들을 사내 SSOT로 교체하면 모델은 그대로 유지한 채 결과만 업데이트할 수 있다.

두 번째 갭은 **JB 고유의 실제 업무 로그 부재**다. 현장 시스템에서 최소 4주치만 뽑아도 $N_i$, $\Delta T_i$, $\lambda$, 서비스시간 분산 $C_s^2$, 토큰/건 분포가 실측으로 바뀌고, 그러면 M2와 M4의 신뢰도가 가장 크게 오른다.

세 번째 갭은 **자가호스팅 구매단가의 공식 list price 부재**다. NVIDIA는 H100 소매가를 공개하지 않기 때문에, CAPEX는 공개 유통가 범위를 사용한 \[추정\]이다. 반면 VRAM·전력·클라우드 시간당 단가는 상대적으로 더 잘 관측된다. [\[53\]](https://northflank.com/blog/how-much-does-an-nvidia-h100-gpu-cost)

네 번째 한계는 **queueing 근사의 단순화**다. 본문은 $M/M/c$ 기준과 $M/G/c$ 근사를 병행했지만, 실제 은행 운영은 시간대별 도착률, 우선순위 큐, 재작업, 승인단계 분기를 가진다. 고빈도 실운영 배치 전에는 discrete-event simulation으로 검증하는 것이 가장 안전하다. 그럼에도 본 보고서의 목적이 “초안 산식을 방어 가능한 수학모델로 교정”하는 것이라면, 현재 단계의 모델은 **의사결정용 screening model**로는 충분히 방어적이다.

------------------------------------------------------------------------

[\[1\]](https://people.stern.nyu.edu/adamodar/pdfiles/papers/realopt.pdf) [\[11\]](https://people.stern.nyu.edu/adamodar/pdfiles/papers/realopt.pdf) https://people.stern.nyu.edu/adamodar/pdfiles/papers/realopt.pdf

<https://people.stern.nyu.edu/adamodar/pdfiles/papers/realopt.pdf>

[\[2\]](https://developers.openai.com/api/docs/pricing) [\[14\]](https://developers.openai.com/api/docs/pricing) [\[16\]](https://developers.openai.com/api/docs/pricing) [\[25\]](https://developers.openai.com/api/docs/pricing) [\[27\]](https://developers.openai.com/api/docs/pricing) [\[42\]](https://developers.openai.com/api/docs/pricing) [\[43\]](https://developers.openai.com/api/docs/pricing) https://developers.openai.com/api/docs/pricing

<https://developers.openai.com/api/docs/pricing>

[\[3\]](https://www.nvidia.com/en-us/data-center/h100/) [\[19\]](https://www.nvidia.com/en-us/data-center/h100/) [\[20\]](https://www.nvidia.com/en-us/data-center/h100/) [\[26\]](https://www.nvidia.com/en-us/data-center/h100/) [\[45\]](https://www.nvidia.com/en-us/data-center/h100/) https://www.nvidia.com/en-us/data-center/h100/

<https://www.nvidia.com/en-us/data-center/h100/>

[\[4\]](https://vllm.ai/blog/2024-07-23-llama31) [\[28\]](https://vllm.ai/blog/2024-07-23-llama31) [\[52\]](https://vllm.ai/blog/2024-07-23-llama31) https://vllm.ai/blog/2024-07-23-llama31

<https://vllm.ai/blog/2024-07-23-llama31>

[\[5\]](https://huggingface.co/meta-llama/Llama-3.1-70B-Instruct) https://huggingface.co/meta-llama/Llama-3.1-70B-Instruct

<https://huggingface.co/meta-llama/Llama-3.1-70B-Instruct>

[\[6\]](https://www.nber.org/papers/w31161) [\[15\]](https://www.nber.org/papers/w31161) [\[29\]](https://www.nber.org/papers/w31161) [\[39\]](https://www.nber.org/papers/w31161) https://www.nber.org/papers/w31161

<https://www.nber.org/papers/w31161>

[\[7\]](https://www.columbia.edu/~ww2040/ErlangBandCFormulas.pdf) https://www.columbia.edu/~ww2040/ErlangBandCFormulas.pdf

<https://www.columbia.edu/~ww2040/ErlangBandCFormulas.pdf>

[\[8\]](https://pages.stern.nyu.edu/~adamodar/pdfiles/acf2E/Chap5.pdf) [\[34\]](https://pages.stern.nyu.edu/~adamodar/pdfiles/acf2E/Chap5.pdf) https://pages.stern.nyu.edu/~adamodar/pdfiles/acf2E/Chap5.pdf

<https://pages.stern.nyu.edu/~adamodar/pdfiles/acf2E/Chap5.pdf>

[\[9\]](https://www.bis.org/basel_framework/chapter/CRE/35.htm?inforce=20191215&published=20191215) https://www.bis.org/basel_framework/chapter/CRE/35.htm?inforce=20191215&published=20191215

<https://www.bis.org/basel_framework/chapter/CRE/35.htm?inforce=20191215&published=20191215>

[\[10\]](https://www.fsc.go.kr/comm/getFile?fileNo=6&fileTy=ATTACH&srvcId=BBSTY1&upperNo=87142) [\[12\]](https://www.fsc.go.kr/comm/getFile?fileNo=6&fileTy=ATTACH&srvcId=BBSTY1&upperNo=87142) [\[37\]](https://www.fsc.go.kr/comm/getFile?fileNo=6&fileTy=ATTACH&srvcId=BBSTY1&upperNo=87142) https://www.fsc.go.kr/comm/getFile?fileNo=6&fileTy=ATTACH&srvcId=BBSTY1&upperNo=87142

<https://www.fsc.go.kr/comm/getFile?fileNo=6&fileTy=ATTACH&srvcId=BBSTY1&upperNo=87142>

[\[13\]](https://www.jbfg.com/ko/about/campus.do) [\[24\]](https://www.jbfg.com/ko/about/campus.do) https://www.jbfg.com/ko/about/campus.do

<https://www.jbfg.com/ko/about/campus.do>

[\[17\]](https://docs.anthropic.com/ko/docs/about-claude/pricing) https://docs.anthropic.com/ko/docs/about-claude/pricing

<https://docs.anthropic.com/ko/docs/about-claude/pricing>

[\[18\]](https://fred.stlouisfed.org/series/DEXKOUS) https://fred.stlouisfed.org/series/DEXKOUS

<https://fred.stlouisfed.org/series/DEXKOUS>

[\[21\]](https://www.nvidia.com/en-us/data-center/l40s/) https://www.nvidia.com/en-us/data-center/l40s/

<https://www.nvidia.com/en-us/data-center/l40s/>

[\[22\]](https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1485) https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1485

<https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1485>

[\[23\]](https://northflank.com/blog/how-much-does-an-nvidia-h100-gpu-cost) [\[53\]](https://northflank.com/blog/how-much-does-an-nvidia-h100-gpu-cost) https://northflank.com/blog/how-much-does-an-nvidia-h100-gpu-cost

<https://northflank.com/blog/how-much-does-an-nvidia-h100-gpu-cost>

[\[30\]](https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18422) [\[33\]](https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18422) [\[44\]](https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18422) [\[49\]](https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18422) https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18422

<https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18422>

[\[31\]](https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1488) https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1488

<https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1488>

[\[32\]](https://tradingeconomics.com/south-korea/government-bond-yield) [\[51\]](https://tradingeconomics.com/south-korea/government-bond-yield) https://tradingeconomics.com/south-korea/government-bond-yield

<https://tradingeconomics.com/south-korea/government-bond-yield>

[\[35\]](https://www.bis.org/basel_framework/chapter/CRE/32.htm) [\[40\]](https://www.bis.org/basel_framework/chapter/CRE/32.htm) https://www.bis.org/basel_framework/chapter/CRE/32.htm

<https://www.bis.org/basel_framework/chapter/CRE/32.htm>

[\[36\]](https://www.fsc.go.kr/no010101/85959) [\[38\]](https://www.fsc.go.kr/no010101/85959) [\[41\]](https://www.fsc.go.kr/no010101/85959) https://www.fsc.go.kr/no010101/85959

<https://www.fsc.go.kr/no010101/85959>

[\[46\]](https://lambda.ai/pricing) https://lambda.ai/pricing

<https://lambda.ai/pricing>

[\[47\]](https://cloud.google.com/products/compute/pricing/accelerator-optimized) https://cloud.google.com/products/compute/pricing/accelerator-optimized

<https://cloud.google.com/products/compute/pricing/accelerator-optimized>

[\[48\]](https://instances.vantage.sh/aws/ec2/g6e.xlarge) https://instances.vantage.sh/aws/ec2/g6e.xlarge

<https://instances.vantage.sh/aws/ec2/g6e.xlarge>

[\[50\]](https://stathtml.moel.go.kr/statHtml/statHtml.do?orgId=118&tblId=DT_118N_MON051) https://stathtml.moel.go.kr/statHtml/statHtml.do?orgId=118&tblId=DT_118N_MON051

<https://stathtml.moel.go.kr/statHtml/statHtml.do?orgId=118&tblId=DT_118N_MON051>
