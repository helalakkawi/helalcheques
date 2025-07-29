
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
