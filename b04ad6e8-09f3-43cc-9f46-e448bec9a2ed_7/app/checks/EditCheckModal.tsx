'use client';

import { useState, useEffect } from 'react';

interface EditCheckModalProps {
  check: any;
  onClose: () => void;
  onSave: (updatedCheck: any) => void;
}

export default function EditCheckModal({ check, onClose, onSave }: EditCheckModalProps) {
  const [formData, setFormData] = useState({
    beneficiary: '',
    checkNumber: '',
    amount: '',
    dueDate: '',
    bankName: '',
    type: 'outgoing'
  });
  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    if (check) {
      setFormData({
        beneficiary: check.beneficiary,
        checkNumber: check.checkNumber,
        amount: check.amount.toString(),
        dueDate: check.dueDate,
        bankName: check.bankName,
        type: check.type
      });
    }
  }, [check]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // فحص التكرار عند تغيير رقم الشيك
    if (name === 'checkNumber' && value && value !== check.checkNumber) {
      checkDuplicate(value);
    } else if (name === 'checkNumber' && value === check.checkNumber) {
      setIsDuplicate(false);
    }
  };

  const checkDuplicate = (checkNumber: string) => {
    const savedChecks = localStorage.getItem('bankChecks');
    if (savedChecks) {
      const checks = JSON.parse(savedChecks);
      const duplicate = checks.find((c: any) => c.checkNumber === checkNumber && c.id !== check.id);
      setIsDuplicate(!!duplicate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDuplicate) {
      if (!confirm('رقم الشيك مستخدم مسبقاً. هل تريد المتابعة؟')) {
        return;
      }
    }
    
    const updatedCheck = {
      ...check,
      beneficiary: formData.beneficiary,
      checkNumber: formData.checkNumber,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      bankName: formData.bankName,
      type: formData.type
    };
    
    onSave(updatedCheck);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">تعديل الشيك</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم المستفيد *
              </label>
              <input
                type="text"
                name="beneficiary"
                value={formData.beneficiary}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الشيك *
              </label>
              <input
                type="text"
                name="checkNumber"
                value={formData.checkNumber}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDuplicate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {isDuplicate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <i className="ri-error-warning-line ml-1"></i>
                  رقم الشيك مستخدم مسبقاً
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ الاستحقاق *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم البنك *
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع الشيك *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="outgoing">صرف</option>
                <option value="incoming">قبض</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-reverse space-x-3 pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center whitespace-nowrap"
            >
              <i className="ri-save-line ml-2"></i>
              حفظ التغييرات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 whitespace-nowrap"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}