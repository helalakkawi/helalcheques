
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ChecksList from './ChecksList';
import CheckStatusModal from './CheckStatusModal';
import EditCheckModal from './EditCheckModal';

export default function ChecksPage() {
  const [checks, setChecks] = useState<any[]>([]);
  const [selectedCheck, setSelectedCheck] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    loadChecks();
    updateCheckStatuses();
  }, []);

  const loadChecks = () => {
    const savedChecks = localStorage.getItem('bankChecks');
    if (savedChecks) {
      setChecks(JSON.parse(savedChecks));
    }
  };

  const updateCheckStatuses = () => {
    const savedChecks = localStorage.getItem('bankChecks');
    if (savedChecks) {
      const checks = JSON.parse(savedChecks);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const updatedChecks = checks.map((check: any) => {
        const dueDate = new Date(check.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (check.status === 'received' && dueDate.getTime() === today.getTime()) {
          return { ...check, status: 'due' };
        }
        return check;
      });

      localStorage.setItem('bankChecks', JSON.stringify(updatedChecks));
      setChecks(updatedChecks);
    }
  };

  const handleStatusChange = (checkId: string, newStatus: string) => {
    const updatedChecks = checks.map(check =>
      check.id === checkId ? { ...check, status: newStatus } : check
    );
    setChecks(updatedChecks);
    localStorage.setItem('bankChecks', JSON.stringify(updatedChecks));
    setShowStatusModal(false);
  };

  const handleEditCheck = (updatedCheck: any) => {
    const updatedChecks = checks.map(check =>
      check.id === updatedCheck.id ? updatedCheck : check
    );
    setChecks(updatedChecks);
    localStorage.setItem('bankChecks', JSON.stringify(updatedChecks));
    setShowEditModal(false);
  };

  const handleDelete = (checkId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الشيك؟')) {
      const updatedChecks = checks.filter(check => check.id !== checkId);
      setChecks(updatedChecks);
      localStorage.setItem('bankChecks', JSON.stringify(updatedChecks));
    }
  };

  const filteredChecks = checks.filter(check => {
    const matchesFilter = filter === 'all' || check.status === filter;
    const matchesSearch =
      check.beneficiary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.checkNumber.toString().includes(searchTerm) ||
      check.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  function DueChecksAlert() {
    const [dueChecks, setDueChecks] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);

      const savedChecks = localStorage.getItem('bankChecks');
      if (savedChecks) {
        const checks = JSON.parse(savedChecks);
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        const upcoming = checks.filter((check: any) => {
          const checkDate = new Date(check.dueDate);
          return checkDate >= today && checkDate <= threeDaysFromNow && check.status === 'received';
        });

        setDueChecks(upcoming);
      }
    }, []);

    if (!isClient) {
      return (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      );
    }

    if (dueChecks.length === 0) {
      return (
        <div className="text-center py-8">
          <i className="ri-check-line text-4xl text-green-500 mb-2"></i>
          <p className="text-gray-600">لا توجد شيكات مستحقة خلال الأيام القادمة</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {dueChecks.map((check, index) => (
          <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full ml-3"></div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{check.beneficiary}</p>
              <p className="text-sm text-gray-600" suppressHydrationWarning={true}>
                {check.amount.toLocaleString()} ₪ - {new Date(check.dueDate).toLocaleDateString('en-GB')}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${
              check.type === 'outgoing' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {check.type === 'outgoing' ? 'صرف' : 'قبض'}
            </span>
          </div>
        ))}
      </div>
    );
  }

  function RecentActivity() {
    const [recentChecks, setRecentChecks] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);

      const savedChecks = localStorage.getItem('bankChecks');
      if (savedChecks) {
        const checks = JSON.parse(savedChecks);
        const recent = checks
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setRecentChecks(recent);
      }
    }, []);

    if (!isClient) {
      return (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      );
    }

    if (recentChecks.length === 0) {
      return (
        <div className="text-center py-8">
          <i className="ri-file-list-line text-4xl text-gray-300 mb-2"></i>
          <p className="text-gray-500">لا توجد شيكات مدخلة بعد</p>
          <Link href="/checks/add" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            إضافة شيك جديد
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {recentChecks.map((check, index) => (
          <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center ml-4">
              <i className="ri-file-text-line text-gray-600"></i>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{check.beneficiary}</p>
              <p className="text-sm text-gray-600">شيك رقم {check.checkNumber} - {check.bankName}</p>
              <p className="text-xs text-gray-500" suppressHydrationWarning={true}>
                {new Date(check.createdAt).toLocaleDateString('en-GB')}
              </p>
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">{check.amount.toLocaleString()} ₪</p>
              <span className={`px-2 py-1 rounded-full text-xs ${
                check.status === 'received' ? 'bg-gray-100 text-gray-800' :
                  check.status === 'due' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
              }`}>
                {check.status === 'received' ? 'مستلم' : 
                 check.status === 'due' ? 'مستحق' : 'تم'}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
              <Link href="/checks" className="text-blue-600 font-medium">إدارة الشيكات</Link>
              <Link href="/reports" className="text-gray-600 hover:text-blue-600">التقارير</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">إدارة الشيكات</h2>
          <div className="flex space-x-reverse space-x-4">
            <Link href="/checks/add" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center whitespace-nowrap">
              <i className="ri-add-line ml-2"></i>
              إضافة شيك جديد
            </Link>
            <Link href="/checks/import" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center whitespace-nowrap">
              <i className="ri-file-excel-line ml-2"></i>
              استيراد من Excel
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="البحث في الشيكات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">فلترة حسب الحالة</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="all">جميع الحالات</option>
                <option value="received">مستلم</option>
                <option value="due">مستحق</option>
                <option value="cashed">تم صرفه</option>
                <option value="received_payment">تم قبضه</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center whitespace-nowrap"
              >
                <i className="ri-refresh-line ml-2"></i>
                إعادة تعيين
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                <i className="ri-file-list-line text-blue-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الشيكات</p>
                <p className="text-xl font-bold text-gray-900" suppressHydrationWarning={true}>
                  {isClient ? checks.length : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center ml-3">
                <i className="ri-time-line text-yellow-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">مستحقة</p>
                <p className="text-xl font-bold text-gray-900" suppressHydrationWarning={true}>
                  {isClient ? checks.filter(c => c.status === 'due').length : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center ml-3">
                <i className="ri-check-line text-green-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">مكتملة</p>
                <p className="text-xl font-bold text-gray-900" suppressHydrationWarning={true}>
                  {isClient ? checks.filter(c => c.status === 'cashed' || c.status === 'received_payment').length : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center ml-3">
                <i className="ri-money-dollar-circle-line text-gray-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي المبلغ</p>
                <p className="text-xl font-bold text-gray-900" suppressHydrationWarning={true}>
                  {isClient ? checks.reduce((sum, check) => sum + check.amount, 0).toLocaleString() : 0} ₪
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Due Checks Alert */}
        <DueChecksAlert />

        {/* Recent Activity */}
        <RecentActivity />

        {/* Checks List */}
        {isClient && (
          <ChecksList 
            checks={filteredChecks}
            onStatusChange={(check) => {
              setSelectedCheck(check);
              setShowStatusModal(true);
            }}
            onEdit={(check) => {
              setSelectedCheck(check);
              setShowEditModal(true);
            }}
            onDelete={handleDelete}
          />
        )}

        {/* Status Modal */}
        {showStatusModal && selectedCheck && (
          <CheckStatusModal
            check={selectedCheck}
            onClose={() => setShowStatusModal(false)}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedCheck && (
          <EditCheckModal
            check={selectedCheck}
            onClose={() => setShowEditModal(false)}
            onSave={handleEditCheck}
          />
        )}
      </main>
    </div>
  );
}
