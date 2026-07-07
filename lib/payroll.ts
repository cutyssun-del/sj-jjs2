import * as XLSX from "xlsx";

// 급여대장 시트 컬럼 인덱스(0-based) — build 스크립트의 열 순서와 일치
export interface PayRow {
  month: number;        // 귀속월 (1~12)
  no: number;           // NO
  empId: string;        // 사번
  name: string;         // 성명
  dept: string;         // 부서
  grade: string;        // 직급
  base: number;         // 기본급
  hourly: number;       // 통상시급
  otHours: number;      // 연장시간
  ntHours: number;      // 야간시간
  fixedOt: number;      // 약정근로수당
  otPay: number;        // 연장근로수당
  ntPay: number;        // 야간근로수당
  duty: number;         // 직책수당
  attend: number;       // 출근수당
  cert: number;         // 자격수당
  tel: number;          // 통신비(비과세)
  meal: number;         // 식대(비과세)
  car: number;          // 차량유지비(비과세)
  gross: number;        // 지급합계
  taxFree: number;      // 비과세합계
  taxable: number;      // 과세급여
  np: number;           // 국민연금
  hi: number;           // 건강보험
  ltc: number;          // 장기요양
  ei: number;           // 고용보험
  incomeTax: number;    // 소득세
  localTax: number;     // 지방소득세
  etc: number;          // 기타공제
  deduction: number;    // 공제합계
  net: number;          // 실지급액
}

const num = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^0-9.-]/g, ""));
    return isNaN(n) ? 0 : n;
  }
  return 0;
};

const monthOf = (v: unknown): number => {
  if (v instanceof Date) return v.getMonth() + 1;
  if (typeof v === "number") {
    const d = XLSX.SSF ? XLSX.SSF.parse_date_code(v) : null;
    if (d && d.m) return d.m;
  }
  if (typeof v === "string") {
    const m = v.match(/(\d{1,2})\s*월/);
    if (m) return Number(m[1]);
  }
  return 0;
};

export async function loadPayroll(url: string): Promise<PayRow[]> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const ws = wb.Sheets["급여대장"];
  if (!ws) throw new Error("급여대장 시트를 찾을 수 없습니다.");
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false });

  const out: PayRow[] = [];
  for (const r of rows) {
    const no = num(r[1]);
    const name = typeof r[3] === "string" ? r[3].trim() : "";
    // 데이터 행만: NO가 양수 & 성명이 문자열 & 기본급이 존재
    if (!no || !name || num(r[6]) <= 0) continue;
    out.push({
      month: monthOf(r[0]),
      no,
      empId: String(r[2] ?? ""),
      name,
      dept: String(r[4] ?? ""),
      grade: String(r[5] ?? ""),
      base: num(r[6]),
      hourly: num(r[7]),
      otHours: num(r[8]),
      ntHours: num(r[9]),
      fixedOt: num(r[10]),
      otPay: num(r[11]),
      ntPay: num(r[12]),
      duty: num(r[13]),
      attend: num(r[14]),
      cert: num(r[15]),
      tel: num(r[16]),
      meal: num(r[17]),
      car: num(r[18]),
      gross: num(r[19]),
      taxFree: num(r[20]),
      taxable: num(r[21]),
      np: num(r[22]),
      hi: num(r[23]),
      ltc: num(r[24]),
      ei: num(r[25]),
      incomeTax: num(r[26]),
      localTax: num(r[27]),
      etc: num(r[28]),
      deduction: num(r[29]),
      net: num(r[30]),
    });
  }
  return out;
}

export const won = (n: number): string =>
  n === 0 ? "-" : n.toLocaleString("ko-KR");

export interface Employee {
  no: number;
  name: string;
  dept: string;
  grade: string;
  empId: string;
}

export function employeesOf(rows: PayRow[]): Employee[] {
  const map = new Map<number, Employee>();
  for (const r of rows) {
    if (!map.has(r.no))
      map.set(r.no, { no: r.no, name: r.name, dept: r.dept, grade: r.grade, empId: r.empId });
  }
  return [...map.values()].sort((a, b) => a.no - b.no);
}
