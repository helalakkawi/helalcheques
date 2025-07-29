
'use client';

interface CheckStatusModalProps {
  check: any;
  onClose: () => void;
  onStatusChange: (checkId: string, newStatus: string) => void;
}

export default function CheckStatusModal({ check, onClose, onStatusChange }: CheckStatusModalProps) {
  const getAvailableStatuses = () => {
    const statuses = [
      { value: 'received', label: 'مستلم' },
      { value: 'due', label: 'مستحق' }
    ];
    
    if (check.type === 'outgoing') {
      statuses.push({ value: 'cashed', label: 'تم صرفه' });
    } else {
      statuses.push({ value: 'received_payment', label: 'تم قبضه' });
    }
    
    return statuses;
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(check.id, newStatus);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" dir="rtl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">تغيير حالة الشيك</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        <div className="mb-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">المستفيد:</span>
                <p className="text-gray-900">{check.beneficiary}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">رقم الشيك:</span>
                <p className="text-gray-900">{check.checkNumber}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">المبلغ:</span>
                <p className="text-gray-900">{check.amount.toLocaleString()} ₪</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">النوع:</span>
                <p className="text-gray-900">{check.type === 'outgoing' ? 'صرف' : 'قبض'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الحالة الحالية: <span className="text-blue-600">{
              check.status === 'received' ? 'مستلم' :
              check.status === 'due' ? 'مستحق' :
              check.status === 'cashed' ? 'تم صرفه' :
              'تم قبضه'
            }</span>
          </label>
          
          <div className="space-y-2">
            {getAvailableStatuses().map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                className={`w-full text-right px-4 py-2 rounded-lg border transition-colors ${
                  check.status === status.value
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-reverse space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
