"use client";

import { useMemo, useRef, useState } from "react";
import {
  parseWorkbook,
  rowsFromMatrix,
  employeesOf,
  won,
  PayRow,
} from "@/lib/payroll";
import { DEMO_MATRIX } from "@/lib/demoData";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
type Tab = "summary" | "ledger" | "slip" | "deduction";

export default function Page() {
  const [rows, setRows] = useState<PayRow[]>([]);
  const [err, setErr] = useState("");
  const [source, setSource] = useState<"none" | "file" | "demo">("none");
  const [fileName, setFileName] = useState("");
  const [tab, setTab] = useState<Tab>("summary");
  const [empNo, setEmpNo] = useState<number>(0); // 0 = 전체
  const [month, setMonth] = useState<number>(0); // 0 = 전체
  const [slipNo, setSlipNo] = useState<number>(1);
  const [slipMonth, setSlipMonth] = useState<number>(7);
  const inputRef = useRef<HTMLInputElement>(null);

  const applyRows = (r: PayRow[]) => {
    setRows(r);
    setErr("");
    if (r.length) setSlipNo(employeesOf(r)[0].no);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const buf = await file.arrayBuffer(); // 브라우저 메모리에서만 처리 — 서버 전송 없음
      const r = parseWorkbook(buf);
      applyRows(r);
      setSource("file");
      setFileName(file.name);
      setTab("summary");
    } catch (e: any) {
      setErr(String(e?.message ?? e));
      setRows([]);
      setSource("none");
    }
  };

  const loadDemo = () => {
    applyRows(rowsFromMatrix(DEMO_MATRIX));
    setSource("demo");
    setFileName("");
    setTab("summary");
  };

  const reset = () => {
    setRows([]);
    setSource("none");
    setFileName("");
    setErr("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const emps = useMemo(() => employeesOf(rows), [rows]);

  const HiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept=".xlsx,.xlsm,.xls"
      style={{ display: "none" }}
      onChange={(e) => onFile(e.target.files?.[0])}
    />
  );

  // ── 랜딩(데이터 미선택) 화면 ──
  if (!rows.length) {
    return (
      <>
        <header className="top">
          <div className="wrap">
            <div>
              <h1>㈜신정개발 경영지원 대시보드</h1>
              <div className="sub">급여 정산 · 4대보험 · 세금 · 급여명세서</div>
            </div>
            <span className="badge">로컬 전용 · 데이터 비저장</span>
          </div>
        </header>
        <div className="wrap">
          {HiddenInput}
          <div className="drop">
            <div className="drop-ic">🔒</div>
            <h2>급여 엑셀 파일을 선택하세요</h2>
            <p>
              선택한 엑셀은 <b>내 컴퓨터(브라우저) 안에서만</b> 열려 분석됩니다.
              <br />
              파일이 서버나 GitHub·인터넷 어디로도 <b>업로드·전송되지 않습니다.</b>
            </p>
            <div className="drop-actions">
              <button className="btn primary" onClick={() => inputRef.current?.click()}>
                📂 내 엑셀 파일 선택
              </button>
              <button className="btn" onClick={loadDemo}>
                👀 가상 데이터로 미리보기
              </button>
            </div>
            {err && <div className="err">⚠️ {err}</div>}
            <div className="drop-hint">
              지원 형식: .xlsx / .xlsm · &lsquo;급여대장&rsquo; 시트가 포함된 급여관리 마스터 파일
            </div>
          </div>

          <div className="secgrid">
            <div className="seccard">
              <div className="ic">🖥️</div>
              <div className="t">데이터는 내 PC에만</div>
              <div className="d">파일은 브라우저 메모리에서만 파싱되고, 새로고침하면 사라집니다. 서버 저장 없음.</div>
            </div>
            <div className="seccard">
              <div className="ic">🚫</div>
              <div className="t">저장소에 엑셀 없음</div>
              <div className="d">모든 엑셀·CSV는 .gitignore로 차단되어 GitHub에 올라가거나 다운로드될 수 없습니다.</div>
            </div>
            <div className="seccard">
              <div className="ic">🔄</div>
              <div className="t">엑셀이 곧 데이터</div>
              <div className="d">엑셀에서 급여를 입력·수정한 뒤 다시 선택하면 대시보드가 즉시 갱신됩니다.</div>
            </div>
          </div>
          <div className="footer">
            ㈜신정개발 경영지원 대시보드 · 데이터 원본은 사용자 PC의 엑셀 파일 · GitHub → Vercel 배포
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="top">
        <div className="wrap">
          <div>
            <h1>㈜신정개발 경영지원 대시보드</h1>
            <div className="sub">직원 급여 정산 · 4대보험 · 세금 · 급여명세서</div>
          </div>
          <span className="badge">
            {source === "demo" ? "가상 데이터 미리보기" : `📄 ${fileName}`}
          </span>
        </div>
      </header>

      <div className="wrap">
        {HiddenInput}
        <div className="bar">
          <div>
            {source === "demo" ? (
              <span>
                <b>가상 데이터</b>로 미리보는 중입니다 (실제 직원 정보 아님).
              </span>
            ) : (
              <span>
                <b>{fileName}</b> · 내 컴퓨터에서만 열림 (서버 전송 없음)
              </span>
            )}
          </div>
          <div className="bar-actions">
            <button className="btn sm" onClick={() => inputRef.current?.click()}>
              📂 다른 파일
            </button>
            <button className="btn sm ghost" onClick={reset}>
              ✕ 닫기
            </button>
          </div>
        </div>

        <div className="tabs">
          {(
            [
              ["summary", "📊 요약"],
              ["ledger", "📁 급여대장(연간)"],
              ["slip", "🧾 급여명세서"],
              ["deduction", "🏥 4대보험·세금"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              className={`tab ${tab === id ? "active" : ""}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "summary" && <Summary rows={rows} empCount={emps.length} />}
        {tab === "ledger" && (
          <Ledger
            rows={rows}
            emps={emps}
            empNo={empNo}
            month={month}
            setEmpNo={setEmpNo}
            setMonth={setMonth}
          />
        )}
        {tab === "slip" && (
          <Slip
            rows={rows}
            emps={emps}
            slipNo={slipNo}
            slipMonth={slipMonth}
            setSlipNo={setSlipNo}
            setSlipMonth={setSlipMonth}
          />
        )}
        {tab === "deduction" && (
          <Deduction
            rows={rows}
            emps={emps}
            empNo={empNo}
            month={month}
            setEmpNo={setEmpNo}
            setMonth={setMonth}
          />
        )}

        <div className="footer">
          데이터 원본: <span className="chip">payroll_sample.xlsx</span> · 엑셀을 교체하면 대시보드가
          갱신됩니다 · GitHub → Vercel 배포
        </div>
      </div>
    </>
  );
}

function Summary({ rows, empCount }: { rows: PayRow[]; empCount: number }) {
  const sum = (f: (r: PayRow) => number) => rows.reduce((a, r) => a + f(r), 0);
  const totalNet = sum((r) => r.net);
  const totalGross = sum((r) => r.gross);
  const totalDed = sum((r) => r.deduction);
  const totalTax = sum((r) => r.incomeTax + r.localTax);
  const totalIns = sum((r) => r.np + r.hi + r.ltc + r.ei);

  // 부서별 집계
  const byDept = new Map<string, { gross: number; net: number; cnt: Set<number> }>();
  for (const r of rows) {
    const d = byDept.get(r.dept) ?? { gross: 0, net: 0, cnt: new Set() };
    d.gross += r.gross;
    d.net += r.net;
    d.cnt.add(r.no);
    byDept.set(r.dept, d);
  }
  const depts = [...byDept.entries()].sort((a, b) => b[1].gross - a[1].gross);

  return (
    <>
      <div className="cards">
        <Card k="재직 직원" v={empCount.toLocaleString()} u="명" />
        <Card k="연간 지급총액" v={won(totalGross)} u="원" />
        <Card k="연간 실지급총액" v={won(totalNet)} u="원" />
        <Card k="연간 공제총액" v={won(totalDed)} u="원" />
        <Card k="연간 4대보험(근로자)" v={won(totalIns)} u="원" />
        <Card k="연간 소득·지방세" v={won(totalTax)} u="원" />
      </div>

      <div className="panel">
        <h2>부서별 급여 집계 (연간)</h2>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th className="l">부서</th>
                <th className="c">인원</th>
                <th>지급총액</th>
                <th>실지급총액</th>
                <th>1인 평균 실지급(월)</th>
              </tr>
            </thead>
            <tbody>
              {depts.map(([name, d]) => (
                <tr key={name}>
                  <td className="l">{name}</td>
                  <td className="c">{d.cnt.size}</td>
                  <td className="num">{won(d.gross)}</td>
                  <td className="num pos">{won(d.net)}</td>
                  <td className="num">{won(Math.round(d.net / d.cnt.size / 12))}</td>
                </tr>
              ))}
              <tr className="total">
                <td className="l">합계</td>
                <td className="c">{empCount}</td>
                <td className="num">{won(totalGross)}</td>
                <td className="num">{won(totalNet)}</td>
                <td className="num">{won(Math.round(totalNet / empCount / 12))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Card({ k, v, u }: { k: string; v: string; u?: string }) {
  return (
    <div className="card">
      <div className="k">{k}</div>
      <div className="v">
        {v}
        {u && <span className="u">{u}</span>}
      </div>
    </div>
  );
}

function Filters({
  emps,
  empNo,
  month,
  setEmpNo,
  setMonth,
}: {
  emps: ReturnType<typeof employeesOf>;
  empNo: number;
  month: number;
  setEmpNo: (n: number) => void;
  setMonth: (n: number) => void;
}) {
  return (
    <div className="controls">
      <label>직원</label>
      <select value={empNo} onChange={(e) => setEmpNo(Number(e.target.value))}>
        <option value={0}>전체 직원</option>
        {emps.map((e) => (
          <option key={e.no} value={e.no}>
            {e.name} ({e.dept}/{e.grade})
          </option>
        ))}
      </select>
      <label>월</label>
      <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
        <option value={0}>1~12월 전체</option>
        {MONTHS.map((m) => (
          <option key={m} value={m}>
            {m}월
          </option>
        ))}
      </select>
    </div>
  );
}

function Ledger({ rows, emps, empNo, month, setEmpNo, setMonth }: any) {
  const filtered: PayRow[] = rows
    .filter((r: PayRow) => (empNo ? r.no === empNo : true))
    .filter((r: PayRow) => (month ? r.month === month : true))
    .sort((a: PayRow, b: PayRow) => a.no - b.no || a.month - b.month);

  const sum = (f: (r: PayRow) => number) => filtered.reduce((a, r) => a + f(r), 0);

  return (
    <div className="panel">
      <h2>급여대장 · {empNo ? `${emps.find((e: any) => e.no === empNo)?.name} 직원` : "전체"} {month ? `${month}월` : "연간"}</h2>
      <Filters {...{ emps, empNo, month, setEmpNo, setMonth }} />
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th className="c">월</th>
              <th className="l">성명</th>
              <th className="l">부서</th>
              <th className="c">직급</th>
              <th>기본급</th>
              <th>연장</th>
              <th>야간</th>
              <th>제수당</th>
              <th>비과세</th>
              <th>지급합계</th>
              <th>공제합계</th>
              <th>실지급액</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                <td className="c">{r.month}월</td>
                <td className="l">{r.name}</td>
                <td className="l">{r.dept}</td>
                <td className="c">{r.grade}</td>
                <td className="num">{won(r.base)}</td>
                <td className="num">{won(r.otPay)}</td>
                <td className="num">{won(r.ntPay)}</td>
                <td className="num">{won(r.fixedOt + r.duty + r.attend + r.cert)}</td>
                <td className="num">{won(r.taxFree)}</td>
                <td className="num">{won(r.gross)}</td>
                <td className="num neg">{won(r.deduction)}</td>
                <td className="num pos">{won(r.net)}</td>
              </tr>
            ))}
            {filtered.length > 1 && (
              <tr className="total">
                <td className="c" colSpan={4}>
                  합계 ({filtered.length}건)
                </td>
                <td className="num">{won(sum((r) => r.base))}</td>
                <td className="num">{won(sum((r) => r.otPay))}</td>
                <td className="num">{won(sum((r) => r.ntPay))}</td>
                <td className="num">{won(sum((r) => r.fixedOt + r.duty + r.attend + r.cert))}</td>
                <td className="num">{won(sum((r) => r.taxFree))}</td>
                <td className="num">{won(sum((r) => r.gross))}</td>
                <td className="num">{won(sum((r) => r.deduction))}</td>
                <td className="num">{won(sum((r) => r.net))}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Deduction({ rows, emps, empNo, month, setEmpNo, setMonth }: any) {
  const filtered: PayRow[] = rows
    .filter((r: PayRow) => (empNo ? r.no === empNo : true))
    .filter((r: PayRow) => (month ? r.month === month : true))
    .sort((a: PayRow, b: PayRow) => a.no - b.no || a.month - b.month);
  const sum = (f: (r: PayRow) => number) => filtered.reduce((a, r) => a + f(r), 0);

  return (
    <div className="panel">
      <h2>4대보험 · 세금 공제 내역</h2>
      <Filters {...{ emps, empNo, month, setEmpNo, setMonth }} />
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th className="c">월</th>
              <th className="l">성명</th>
              <th>과세급여</th>
              <th>국민연금</th>
              <th>건강보험</th>
              <th>장기요양</th>
              <th>고용보험</th>
              <th>소득세</th>
              <th>지방소득세</th>
              <th>공제합계</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                <td className="c">{r.month}월</td>
                <td className="l">{r.name}</td>
                <td className="num">{won(r.taxable)}</td>
                <td className="num">{won(r.np)}</td>
                <td className="num">{won(r.hi)}</td>
                <td className="num">{won(r.ltc)}</td>
                <td className="num">{won(r.ei)}</td>
                <td className="num">{won(r.incomeTax)}</td>
                <td className="num">{won(r.localTax)}</td>
                <td className="num neg">{won(r.deduction)}</td>
              </tr>
            ))}
            {filtered.length > 1 && (
              <tr className="total">
                <td className="c" colSpan={2}>
                  합계 ({filtered.length}건)
                </td>
                <td className="num">{won(sum((r) => r.taxable))}</td>
                <td className="num">{won(sum((r) => r.np))}</td>
                <td className="num">{won(sum((r) => r.hi))}</td>
                <td className="num">{won(sum((r) => r.ltc))}</td>
                <td className="num">{won(sum((r) => r.ei))}</td>
                <td className="num">{won(sum((r) => r.incomeTax))}</td>
                <td className="num">{won(sum((r) => r.localTax))}</td>
                <td className="num">{won(sum((r) => r.deduction))}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Slip({ rows, emps, slipNo, slipMonth, setSlipNo, setSlipMonth }: any) {
  const r: PayRow | undefined = rows.find(
    (x: PayRow) => x.no === slipNo && x.month === slipMonth
  );
  const payItems = r
    ? [
        ["기본급", r.base],
        ["약정근로수당", r.fixedOt],
        ["연장근로수당", r.otPay],
        ["야간근로수당", r.ntPay],
        ["직책수당", r.duty],
        ["출근수당", r.attend],
        ["자격수당", r.cert],
        ["통신비(비과세)", r.tel],
        ["식대(비과세)", r.meal],
        ["차량유지비(비과세)", r.car],
      ]
    : [];
  const dedItems = r
    ? [
        ["국민연금", r.np],
        ["건강보험", r.hi],
        ["장기요양보험", r.ltc],
        ["고용보험", r.ei],
        ["소득세(갑근세)", r.incomeTax],
        ["지방소득세", r.localTax],
        ["기타공제", r.etc],
      ]
    : [];

  return (
    <div className="panel">
      <div className="controls" style={{ justifyContent: "center" }}>
        <label>직원</label>
        <select value={slipNo} onChange={(e) => setSlipNo(Number(e.target.value))}>
          {emps.map((e: any) => (
            <option key={e.no} value={e.no}>
              {e.name} ({e.dept})
            </option>
          ))}
        </select>
        <label>월</label>
        <select value={slipMonth} onChange={(e) => setSlipMonth(Number(e.target.value))}>
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}월
            </option>
          ))}
        </select>
        <button className="tab" onClick={() => window.print()}>
          🖨 인쇄 / PDF
        </button>
      </div>

      {!r ? (
        <div className="loading">해당 월 데이터가 없습니다.</div>
      ) : (
        <div className="slip">
          <div className="head">
            <div className="t">급 여 명 세 서</div>
            <div className="p">2026년 {r.month}월 귀속분 · ㈜신정개발</div>
          </div>
          <div className="meta">
            <div>
              <div className="lb">성명</div>
              {r.name}
            </div>
            <div>
              <div className="lb">부서 / 직급</div>
              {r.dept} / {r.grade}
            </div>
            <div>
              <div className="lb">사번</div>
              {r.empId}
            </div>
            <div>
              <div className="lb">통상시급</div>
              {won(r.hourly)} 원
            </div>
            <div>
              <div className="lb">연장 / 야간</div>
              {r.otHours} / {r.ntHours} 시간
            </div>
            <div>
              <div className="lb">지급일</div>
              2026-{String(r.month).padStart(2, "0")}-25
            </div>
          </div>

          <div className="cols">
            <div className="col">
              <h3>지급 내역</h3>
              <div className="rows">
                {payItems.map(([k, v]) => (
                  <div className="row" key={k as string}>
                    <span>{k}</span>
                    <span className="rn">{won(v as number)}</span>
                  </div>
                ))}
              </div>
              <div className="sum">
                <span>지급액 계</span>
                <span className="rn">{won(r.gross)}</span>
              </div>
            </div>
            <div className="col">
              <h3>공제 내역</h3>
              <div className="rows">
                {dedItems.map(([k, v]) => (
                  <div className="row" key={k as string}>
                    <span>{k}</span>
                    <span className="rn">{won(v as number)}</span>
                  </div>
                ))}
              </div>
              <div className="sum">
                <span>공제액 계</span>
                <span className="rn">{won(r.deduction)}</span>
              </div>
            </div>
          </div>

          <div className="net">
            <span className="l">실 지 급 액</span>
            <span className="r">{won(r.net)} 원</span>
          </div>

          <div className="foot">
            위 금액은 근로소득 간이세액 기준으로 산출되었으며, 연말정산 시 정산됩니다.
            <div className="sign">㈜ 신 정 개 발　대 표 이 사</div>
          </div>
        </div>
      )}
    </div>
  );
}
