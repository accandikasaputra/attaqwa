import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowUpCircle, ArrowDownCircle, Wallet, Clock, Filter 
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCashFlowStatistics } from "@/services/cashflowApi";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#facc15', '#8b5cf6'];

export default function CashFlowDashboard() {
  const [dateRange, setDateRange] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["cashflow-statistics", dateRange],
    queryFn: () => {
      if (dateRange === "all") return getCashFlowStatistics();

      const endDate = new Date();
      let startDate = new Date();
      const ranges: Record<string, number> = { "30": 30, "90": 90, "365": 365 };
      startDate.setDate(endDate.getDate() - (ranges[dateRange] || 0));

      return getCashFlowStatistics({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });
    },
  });

  if (isLoading) return <div className="p-6">Loading...</div>;

  const stats = data?.data;
  const categoryData = Object.entries(stats?.categoryBreakdown || {}).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Cash Flow</h1>
          <p className="text-gray-500">Overview keuangan pembangunan masjid</p>
        </div>

        {/* ✅ Native Select (no runtime error) */}
        <div className="relative">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">Semua Waktu</option>
            <option value="30">30 Hari Terakhir</option>
            <option value="90">90 Hari Terakhir</option>
            <option value="365">1 Tahun Terakhir</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {stats?.totalPemasukan.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Dari donasi dan iuran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rp {stats?.totalPengeluaran.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Material, upah, operasional
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (stats?.saldo || 0) >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              Rp {stats?.saldo.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sisa dana tersedia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.pendingApprovals}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Menunggu persetujuan</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Bulanan */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Bulanan</CardTitle>
            <CardDescription>Pemasukan vs Pengeluaran (6 bulan terakhir)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => `Rp ${v.toLocaleString("id-ID")}`} />
                <Legend />
                <Bar dataKey="pemasukan" fill="#22c55e" name="Pemasukan" />
                <Bar dataKey="pengeluaran" fill="#ef4444" name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Breakdown Pengeluaran */}
        <Card>
          <CardHeader>
            <CardTitle>Breakdown Pengeluaran</CardTitle>
            <CardDescription>Per kategori</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `Rp ${v.toLocaleString("id-ID")}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Net Cash Flow Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Net Cash Flow</CardTitle>
          <CardDescription>Selisih pemasukan dan pengeluaran per bulan</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v: number) => `Rp ${v.toLocaleString("id-ID")}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Net Cash Flow"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detail Kategori */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Pengeluaran per Kategori</CardTitle>
          <CardDescription>Rincian kategori pengeluaran</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats?.categoryBreakdown || {}).map(([category, amount]) => (
              <div
                key={category}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium capitalize">
                  {category.replace("_", " ")}
                </span>
                <span className="text-lg font-bold text-red-600">
                  Rp {(amount as number).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
