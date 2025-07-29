
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddCheckPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    beneficiary: '',
    checkNumber: '',
    amount: '',
    dueDate: '',
    bankName: '',
    type: 'outgoing'
  });
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // فحص التكرار عند تغيير رقم الشيك
    if (name === 'checkNumber' && value) {
      checkDuplicate(value);
    }
  };

  const checkDuplicate = (checkNumber: string) => {
    const savedChecks = localStorage.getItem('bankChecks');
    if (savedChecks) {
      const checks = JSON.parse(savedChecks);
      const duplicate = checks.find((check: any) => check.checkNumber === checkNumber);
      setIsDuplicate(!!duplicate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDuplicate) {
      setShowDuplicateModal(true);
      return;
    }
    
    saveCheck();
  };

  const saveCheck = () => {
    const savedChecks = localStorage.getItem('bankChecks');
    const checks = savedChecks ? JSON.parse(savedChecks) : [];
    
    const newCheck = {
      id: Date.now().toString(),
      beneficiary: formData.beneficiary,
      checkNumber: formData.checkNumber,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      bankName: formData.bankName,
      type: formData.type,
      status: 'received',
      createdAt: new Date().toISOString()
    };
    
    checks.push(newCheck);
    localStorage.setItem('bankChecks', JSON.stringify(checks));
    
    router.push('/checks');
  };

  const handleForceSave = () => {
    setShowDuplicateModal(false);
    saveCheck();
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
              <Link href="/checks" className="text-blue-600 font-medium">إدارة الشيكات</Link>
              <Link href="/reports" className="text-gray-600 hover:text-blue-600">التقارير</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/checks" className="text-blue-600 hover:text-blue-800 flex items-center">
            <i className="ri-arrow-right-line ml-2"></i>
            العودة إلى قائمة الشيكات
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">إضافة شيك جديد</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المستفيد *
                </label>
                <input
                  type="text"
                  name="beneficiary"
                  value={formData.beneficiary}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل اسم المستفيد"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الشيك *
                </label>
                <input
                  type="text"
                  name="checkNumber"
                  value={formData.checkNumber}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDuplicate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="أدخل رقم الشيك"
                />
                {isDuplicate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <i className="ri-error-warning-line ml-1"></i>
                    تم إدخال هذا الرقم مسبقاً
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مبلغ الشيك (₪) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الاستحقاق *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم البنك *
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل اسم البنك"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الشيك *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                >
                  <option value="outgoing">صرف</option>
                  <option value="incoming">قبض</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-reverse space-x-4 pt-6">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center whitespace-nowrap"
              >
                <i className="ri-save-line ml-2"></i>
                حفظ الشيك
              </button>
              <Link
                href="/checks"
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 flex items-center whitespace-nowrap"
              >
                إلغاء
              </Link>
            </div>
          </form>
        </div>

        {/* Duplicate Modal */}
        {showDuplicateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center ml-3">
                  <i className="ri-error-warning-line text-yellow-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">تحذير: شيك مكرر</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                تم إدخال شيك بنفس الرقم "{formData.checkNumber}" مسبقاً. هل ترغب في المتابعة؟
              </p>
              
              <div className="flex space-x-reverse space-x-3">
                <button
                  onClick={handleForceSave}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 whitespace-nowrap"
                >
                  نعم، المتابعة
                </button>
                <button
                  onClick={() => setShowDuplicateModal(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 whitespace-nowrap"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
