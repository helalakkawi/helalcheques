
'use client';

interface Check {
  id: string;
  beneficiary: string;
  checkNumber: string;
  amount: number;
  dueDate: string;
  bankName: string;
  type: 'outgoing' | 'incoming';
  status: 'received' | 'due' | 'cashed' | 'received_payment';
  createdAt: string;
}

interface ChecksListProps {
  checks: Check[];
  onStatusChange: (check: Check) => void;
  onDelete: (checkId: string) => void;
  onEdit?: (check: Check) => void;
}

export default function ChecksList({ checks, onStatusChange, onDelete, onEdit }: ChecksListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-gray-100 text-gray-800';
      case 'due':
        return 'bg-yellow-100 text-yellow-800';
      case 'cashed':
      case 'received_payment':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received':
        return 'مستلم';
      case 'due':
        return 'مستحق';
      case 'cashed':
        return 'تم صرفه';
      case 'received_payment':
        return 'تم قبضه';
      default:
        return 'غير محدد';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'outgoing' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const getTypeText = (type: string) => {
    return type === 'outgoing' ? 'صرف' : 'قبض';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (checks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-12 text-center">
          <i className="ri-file-list-line text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد شيكات</h3>
          <p className="text-gray-600 mb-4">ابدأ بإضافة شيك جديد أو استيراد شيكات من ملف Excel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المستفيد
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                رقم الشيك
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المبلغ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاريخ الاستحقاق
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                البنك
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                النوع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {checks.map((check) => (
              <tr key={check.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ml-3">
                      <i className="ri-user-line text-blue-600 text-sm"></i>
                    </div>
                    <div className="font-medium text-gray-900">{check.beneficiary}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-unwrap text-sm text-gray-900 font-mono">
                  {check.checkNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                  {check.amount.toLocaleString()} ₪
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(check.dueDate).toLocaleDateString('en-GB')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {check.bankName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(check.type)}`}>
                    {getTypeText(check.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(check.status)}`}>
                    {getStatusText(check.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-reverse space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(check)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                        title="تعديل"
                      >
                        <i className="ri-edit-2-line"></i>
                      </button>
                    )}
                    <button
                      onClick={() => onStatusChange(check)}
                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                      title="تغيير الحالة"
                    >
                      <i className="ri-refresh-line"></i>
                    </button>
                    <button
                      onClick={() => onDelete(check.id)}
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                      title="حذف"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
