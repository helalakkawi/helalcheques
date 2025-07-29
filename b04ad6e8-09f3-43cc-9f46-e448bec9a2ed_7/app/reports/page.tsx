
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [checks, setChecks] = useState<any[]>([]);
  const [searchFilters, setSearchFilters] = useState({
    checkNumber: '',
    beneficiary: '',
    type: '',
    bankName: '',
    month: '',
    year: '',
    status: ''
  });
  const [filteredChecks, setFilteredChecks] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    incoming: 0,
    outgoing: 0,
    received: 0,
    due: 0,
    completed: 0
  });

  useEffect(() => {
    loadChecks();
  }, []);

  useEffect(() => {
    filterChecks();
    calculateStats();
  }, [checks, searchFilters]);

  const loadChecks = () => {
    const savedChecks = localStorage.getItem('bankChecks');
    if (savedChecks) {
      const parsedChecks = JSON.parse(savedChecks);
      setChecks(parsedChecks);
      setFilteredChecks(parsedChecks);
    }
  };

  const filterChecks = () => {
    let filtered = checks;

    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(check => {
          switch (key) {
            case 'checkNumber':
              return check.checkNumber.toString().includes(value);
            case 'beneficiary':
              return check.beneficiary.toLowerCase().includes(value.toLowerCase());
            case 'type':
              return check.type === value;
            case 'bankName':
              return check.bankName.toLowerCase().includes(value.toLowerCase());
            case 'status':
              return check.status === value;
            case 'month':
              const checkDate = new Date(check.dueDate);
              return (checkDate.getMonth() + 1).toString() === value;
            case 'year':
              const checkYear = new Date(check.dueDate);
              return checkYear.getFullYear().toString() === value;
            default:
              return true;
          }
        });
      }
    });

    setFilteredChecks(filtered);
  };

  const calculateStats = () => {
    const total = filteredChecks.length;
    const totalAmount = filteredChecks.reduce((sum, check) => sum + check.amount, 0);
    const incoming = filteredChecks.filter(c => c.type === 'incoming').length;
    const outgoing = filteredChecks.filter(c => c.type === 'outgoing').length;
    const received = filteredChecks.filter(c => c.status === 'received').length;
    const due = filteredChecks.filter(c => c.status === 'due').length;
    const completed = filteredChecks.filter(c => c.status === 'cashed' || c.status === 'received_payment').length;

    setStats({ total, totalAmount, incoming, outgoing, received, due, completed });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      checkNumber: '',
      beneficiary: '',
      type: '',
      bankName: '',
      month: '',
      year: '',
      status: ''
    });
  };

  const getUpcomingChecks = (days: number) => {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + days);

    return checks.filter(check => {
      const checkDate = new Date(check.dueDate);
      return checkDate >= today && checkDate <= targetDate && check.status === 'received';
    });
  };

  const getChartData = () => {
    const monthlyData: { [key: string]: { month: string; incoming: number; outgoing: number; } } = {};

    checks.forEach(check => {
      const date = new Date(check.dueDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          incoming: 0,
          outgoing: 0
        };
      }

      if (check.type === 'incoming') {
        monthlyData[monthKey].incoming += check.amount;
      } else {
        monthlyData[monthKey].outgoing += check.amount;
      }
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center ml-3">
                <i className="ri-bank-line text-white"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">نظام إدارة الشيكات البنكية</h1>
            </div>
            <nav className="flex space-x-reverse space-x-8">
              <Link href="/" className="text-gray-600 hover:text-blue-600">الرئيسية</Link>
              <Link href="/checks" className="text-gray-600 hover:text-blue-600">إدارة الشيكات</Link>
              <Link href="/reports" className="text-blue-600 font-medium">التقارير</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">التقارير والإحصائيات</h2>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">البحث المتقدم</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الشيك</label>
              <input
                type="text"
                name="checkNumber"
                value={searchFilters.checkNumber}
                onChange={handleFilterChange}
                placeholder="أدخل رقم الشيك"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستفيد</label>
              <input
                type="text"
                name="beneficiary"
                value={searchFilters.beneficiary}
                onChange={handleFilterChange}
                placeholder="أدخل اسم المستفيد"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع الشيك</label>
              <select
                name="type"
                value={searchFilters.type}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
              >
                <option value="">جميع الأنواع</option>
                <option value="incoming">قبض</option>
                <option value="outgoing">صرف</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البنك</label>
              <input
                type="text"
                name="bankName"
                value={searchFilters.bankName}
                onChange={handleFilterChange}
                placeholder="أدخل اسم البنك"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الشهر</label>
              <select
                name="month"
                value={searchFilters.month}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
              >
                <option value="">جميع الشهور</option>
                <option value="1">يناير</option>
                <option value="2">فبراير</option>
                <option value="3">مارس</option>
                <option value="4">أبريل</option>
                <option value="5">مايو</option>
                <option value="6">يونيو</option>
                <option value="7">يوليو</option>
                <option value="8">أغسطس</option>
                <option value="9">سبتمبر</option>
                <option value="10">أكتوبر</option>
                <option value="11">نوفمبر</option>
                <option value="12">ديسمبر</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">السنة</label>
              <select
                name="year"
                value={searchFilters.year}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
              >
                <option value="">جميع السنوات</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
              <select
                name="status"
                value={searchFilters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
              >
                <option value="">جميع الحالات</option>
                <option value="received">مستلم</option>
                <option value="due">مستحق</option>
                <option value="cashed">تم صرفه</option>
                <option value="received_payment">تم قبضه</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm whitespace-nowrap"
              >
                مسح الفلاتر
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">المجموع</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">إجمالي المبلغ</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalAmount.toLocaleString()} ₪</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">قبض</p>
              <p className="text-2xl font-bold text-blue-600">{stats.incoming}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">صرف</p>
              <p className="text-2xl font-bold text-red-600">{stats.outgoing}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">مستلم</p>
              <p className="text-2xl font-bold text-gray-600">{stats.received}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">مستحق</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.due}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">مكتمل</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">تطور الشيكات الشهرية</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="incoming" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                  <Area type="monotone" dataKey="outgoing" stackId="1" stroke="#EF4444" fill="#EF4444" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">الشيكات المستحقة قريباً</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-800">خلال 3 أيام</span>
                <div className="text-left">
                  <p className="text-lg font-bold text-red-600">{getUpcomingChecks(3).length}</p>
                  <p className="text-sm text-red-600">
                    {getUpcomingChecks(3).reduce((sum, check) => sum + check.amount, 0).toLocaleString()} ₪
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-yellow-800">خلال 7 أيام</span>
                <div className="text-left">
                  <p className="text-lg font-bold text-yellow-600">{getUpcomingChecks(7).length}</p>
                  <p className="text-sm text-yellow-600">
                    {getUpcomingChecks(7).reduce((sum, check) => sum + check.amount, 0).toLocaleString()} ₪
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-orange-800">خلال 10 أيام</span>
                <div className="text-left">
                  <p className="text-lg font-bold text-orange-600">{getUpcomingChecks(10).length}</p>
                  <p className="text-sm text-orange-600">
                    {getUpcomingChecks(10).reduce((sum, check) => sum + check.amount, 0).toLocaleString()} ₪
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">نتائج البحث ({filteredChecks.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستفيد</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الشيك</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاستحقاق</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البنك</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChecks.map((check) => (
                  <tr key={check.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {check.beneficiary}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {check.checkNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                      {check.amount.toLocaleString()} ₪
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(check.dueDate).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {check.bankName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        check.type === 'outgoing' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {check.type === 'outgoing' ? 'صرف' : 'قبض'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        check.status === 'received' ? 'bg-gray-100 text-gray-800' :
                          check.status === 'due' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                      }`}>
                        {check.status === 'received' ? 'مستلم' : check.status === 'due' ? 'مستحق' : 'مكتمل'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
