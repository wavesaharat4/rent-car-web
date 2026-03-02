import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

type Period = "daily" | "weekly" | "monthly";

interface TrendRow extends RowDataPacket {
  periodKey: string;
  revenue: number | string | null;
  bookings: number | string | null;
}

interface SummaryRow extends RowDataPacket {
  totalRevenue: number | string | null;
  totalBookings: number | string | null;
  uniqueCustomers: number | string | null;
}

interface ProvinceRow extends RowDataPacket {
  province: string | null;
}

interface ProvinceBookingRow extends RowDataPacket {
  province: string | null;
  bookings: number | string | null;
}

const PERIOD_CONFIG: Record<
  Period,
  { groupExpr: string; intervalExpr: string; defaultLimit: number }
> = {
  daily: {
    groupExpr: "DATE(b.bookStart)",
    intervalExpr: "INTERVAL 30 DAY",
    defaultLimit: 30,
  },
  weekly: {
    groupExpr: "DATE_SUB(DATE(b.bookStart), INTERVAL WEEKDAY(b.bookStart) DAY)",
    intervalExpr: "INTERVAL 1 MONTH",
    defaultLimit: 5,
  },
  monthly: {
    groupExpr: "DATE_SUB(DATE(b.bookStart), INTERVAL DAYOFMONTH(b.bookStart) - 1 DAY)",
    intervalExpr: "INTERVAL 12 MONTH",
    defaultLimit: 12,
  },
};

const toNumber = (value: number | string | null): number => {
  if (value == null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const STATUS_FILTER_SQL =
  "AND UPPER(COALESCE(b.bookStatus, '')) IN ('CONFIRMED', 'ACTIVE', 'COMPLETED')";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get("period");
    const provinceParam = searchParams.get("province");
    const limitParam = searchParams.get("limit");
    const dateParam = searchParams.get("date");
    const monthParam = searchParams.get("month");

    const period: Period =
      periodParam === "daily" || periodParam === "weekly" || periodParam === "monthly"
        ? periodParam
        : "monthly";
    const province = provinceParam?.trim() ? provinceParam.trim() : "all";
    const selectedDate =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : null;
    const selectedMonth =
      monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : null;

    const fallbackLimit = PERIOD_CONFIG[period].defaultLimit;
    const parsedLimit = Number(limitParam);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 60) : fallbackLimit;

    const { groupExpr, intervalExpr } = PERIOD_CONFIG[period];
    const provinceExpr =
      "COALESCE(NULLIF(TRIM(b.bookSProvice), ''), NULLIF(TRIM(b.bookEProvince), ''))";
    const dateFilterSql =
      period === "daily" && selectedDate ? "AND DATE(b.bookStart) = ?" : "";
    const dateParams = period === "daily" && selectedDate ? [selectedDate] : [];
    const monthRangeFilterSql =
      period === "weekly" && selectedMonth
        ? "AND DATE(b.bookStart) BETWEEN ? AND LAST_DAY(?)"
        : `AND DATE(b.bookStart) >= DATE_SUB(CURDATE(), ${intervalExpr})`;
    const monthRangeParams =
      period === "weekly" && selectedMonth ? [`${selectedMonth}-01`, `${selectedMonth}-01`] : [];

    const trendSql = `
      SELECT DATE_FORMAT(periodDate, '%Y-%m-%d') AS periodKey, revenue, bookings
      FROM (
        SELECT
          ${groupExpr} AS periodDate,
          SUM(COALESCE(b.bookTotalPrice, 0)) AS revenue,
          COUNT(*) AS bookings
        FROM booking b
        WHERE b.bookStart IS NOT NULL
          ${monthRangeFilterSql}
          ${STATUS_FILTER_SQL}
          AND (? = 'all' OR ${provinceExpr} = ?)
          ${dateFilterSql}
        GROUP BY periodDate
        ORDER BY periodDate DESC
        LIMIT ?
      ) grouped
      ORDER BY periodDate ASC
    `;

    const summarySql = `
      SELECT
        COALESCE(SUM(COALESCE(b.bookTotalPrice, 0)), 0) AS totalRevenue,
        COUNT(*) AS totalBookings,
        COUNT(DISTINCT b.cusID) AS uniqueCustomers
      FROM booking b
      WHERE b.bookStart IS NOT NULL
        ${monthRangeFilterSql}
        ${STATUS_FILTER_SQL}
        AND (? = 'all' OR ${provinceExpr} = ?)
        ${dateFilterSql}
    `;

    const provinceSql = `
      SELECT DISTINCT ${provinceExpr} AS province
      FROM booking b
      WHERE ${provinceExpr} IS NOT NULL
        AND TRIM(${provinceExpr}) <> ''
      ORDER BY province ASC
    `;

    const provinceBookingSql = `
      SELECT
        ${provinceExpr} AS province,
        COUNT(*) AS bookings
      FROM booking b
      WHERE b.bookStart IS NOT NULL
        ${monthRangeFilterSql}
        ${STATUS_FILTER_SQL}
        AND ${provinceExpr} IS NOT NULL
        AND TRIM(${provinceExpr}) <> ''
        AND (? = 'all' OR ${provinceExpr} = ?)
        ${dateFilterSql}
      GROUP BY province
      ORDER BY bookings DESC, province ASC
    `;

    const [[trendRows], [summaryRows], [provinceRows], [provinceBookingRows]] = await Promise.all([
      db.query<TrendRow[]>(trendSql, [
        ...monthRangeParams,
        province,
        province,
        ...dateParams,
        limit,
      ]),
      db.query<SummaryRow[]>(summarySql, [
        ...monthRangeParams,
        province,
        province,
        ...dateParams,
      ]),
      db.query<ProvinceRow[]>(provinceSql),
      db.query<ProvinceBookingRow[]>(provinceBookingSql, [
        ...monthRangeParams,
        province,
        province,
        ...dateParams,
      ]),
    ]);

    const trend = trendRows.map((row) => ({
      periodKey: row.periodKey,
      revenue: toNumber(row.revenue),
      bookings: toNumber(row.bookings),
    }));

    const summary = summaryRows[0] ?? {
      totalRevenue: 0,
      totalBookings: 0,
      uniqueCustomers: 0,
    };

    return NextResponse.json({
      period,
      province,
      date: selectedDate,
      month: selectedMonth,
      summary: {
        totalRevenue: toNumber(summary.totalRevenue),
        totalBookings: toNumber(summary.totalBookings),
        uniqueCustomers: toNumber(summary.uniqueCustomers),
      },
      trend,
      provinceBookings: provinceBookingRows.map((row) => ({
        province: row.province?.trim() || "-",
        bookings: toNumber(row.bookings),
      })),
      provinces: provinceRows
        .map((row) => row.province?.trim())
        .filter((value): value is string => Boolean(value)),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Manager reports error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const detail =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: string }).code ?? "")
        : "";
    return NextResponse.json(
      {
        message: "ไม่สามารถดึงข้อมูลรายงานผู้จัดการได้",
        error: message,
        code: detail || undefined,
      },
      { status: 500 }
    );
  }
}
