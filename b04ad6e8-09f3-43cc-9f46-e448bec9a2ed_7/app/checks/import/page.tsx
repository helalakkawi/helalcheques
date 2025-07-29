
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ImportChecksPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
    duplicates: number;
  } | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const validateFile = (file: File) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('يرجى اختيار ملف Excel أو CSV صالح');
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
      return false;
    }
    
    return true;
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }
    
    return data;
  };

  const processImport = async () => {
    if (!file) return;
    
    setImporting(true);
    
    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      const savedChecks = localStorage.getItem('bankChecks');
      const existingChecks = savedChecks ? JSON.parse(savedChecks) : [];
      const existingNumbers = new Set(existingChecks.map((c: any) => c.checkNumber));
      
      const results = {
        success: 0,
        errors: [] as string[],
        duplicates: 0
      };
      
      const newChecks = [];
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        try {
          // تحقق من الحقول المطلوبة
          if (!row.beneficiary || !row.checkNumber || !row.amount || !row.dueDate || !row.bankName) {
            results.errors.push(`الصف ${i + 2}: حقول مطلوبة مفقودة`);
            continue;
          }
          
          // تحقق من التكرار
          if (existingNumbers.has(row.checkNumber)) {
            results.duplicates++;
            continue;
          }
          
          // تحقق من صحة البيانات
          const amount = parseFloat(row.amount);
          if (isNaN(amount) || amount <= 0) {
            results.errors.push(`الصف ${i + 2}: مبلغ غير صحيح`);
            continue;
          }
          
          if (!['outgoing', 'incoming'].includes(row.type)) {
            results.errors.push(`الصف ${i + 2}: نوع الشيك غير صحيح (يجب أن يكون outgoing أو incoming)`);
            continue;
          }
          
          // إنشاء شيك جديد
          const newCheck = {
            id: Date.now().toString() + i,
            beneficiary: row.beneficiary,
            checkNumber: row.checkNumber,
            amount: amount,
            dueDate: row.dueDate,
            bankName: row.bankName,
            type: row.type,
            status: 'received',
            createdAt: new Date().toISOString()
          };
          
          newChecks.push(newCheck);
          existingNumbers.add(row.checkNumber);
          results.success++;
          
        } catch (error) {
          results.errors.push(`الصف ${i + 2}: خطأ في معالجة البيانات`);
        }
      }
      
      // حفظ الشيكات الجديدة
      if (newChecks.length > 0) {
        const updatedChecks = [...existingChecks, ...newChecks];
        localStorage.setItem('bankChecks', JSON.stringify(updatedChecks));
      }
      
      setImportResults(results);
      
    } catch (error) {
      alert('خطأ في معالجة الملف');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `beneficiary,checkNumber,amount,dueDate,bankName,type
محمد أحمد,12345,1000,2025-01-15,بنك فلسطين,outgoing
شركة المستقبل,12346,2500,2025-01-20,البنك العربي,incoming
سارة محمود,12347,750,2025-01-25,بنك الاستثمار,outgoing`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_checks.csv';
    link.click();
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/checks" className="text-blue-600 hover:text-blue-800 flex items-center">
            <i className="ri-arrow-right-line ml-2"></i>
            العودة إلى قائمة الشيكات
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">استيراد الشيكات من Excel</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">تعليمات الاستيراد:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• يجب أن يحتوي الملف على الأعمدة التالية: beneficiary, checkNumber, amount, dueDate, bankName, type</li>
                <li>• نوع الشيك يجب أن يكون: outgoing (صرف) أو incoming (قبض)</li>
                <li>• تاريخ الاستحقاق بصيغة: YYYY-MM-DD</li>
                <li>• المبلغ يجب أن يكون رقماً صحيحاً</li>
                <li>• حد أقصى لحجم الملف: 5 ميجابايت</li>
              </ul>
            </div>

            {/* Template Download */}
            <div className="flex justify-center">
              <button
                onClick={downloadTemplate}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center whitespace-nowrap"
              >
                <i className="ri-download-line ml-2"></i>
                تحميل ملف نموذجي
              </button>
            </div>

            {/* File Upload */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-excel-line text-2xl text-gray-600"></i>
              </div>
              
              {!file ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    اسحب وأفلت الملف هنا
                  </h3>
                  <p className="text-gray-600 mb-4">أو</p>
                  <label className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-block">
                    اختر ملف
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    ملفات Excel أو CSV (حد أقصى 5MB)
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-reverse space-x-3">
                    <i className="ri-file-excel-line text-2xl text-green-600"></i>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-reverse space-x-3 justify-center">
                    <button
                      onClick={processImport}
                      disabled={importing}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center whitespace-nowrap"
                    >
                      {importing ? (
                        <>
                          <i className="ri-loader-line animate-spin ml-2"></i>
                          جاري الاستيراد...
                        </>
                      ) : (
                        <>
                          <i className="ri-upload-line ml-2"></i>
                          بدء الاستيراد
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setFile(null)}
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 whitespace-nowrap"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Import Results */}
            {importResults && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">نتائج الاستيراد:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-100 rounded-lg p-3">
                    <div className="flex items-center">
                      <i className="ri-check-line text-green-600 text-xl ml-2"></i>
                      <div>
                        <p className="text-sm text-green-700">تم بنجاح</p>
                        <p className="text-xl font-bold text-green-800">{importResults.success}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-100 rounded-lg p-3">
                    <div className="flex items-center">
                      <i className="ri-error-warning-line text-yellow-600 text-xl ml-2"></i>
                      <div>
                        <p className="text-sm text-yellow-700">مكررة</p>
                        <p className="text-xl font-bold text-yellow-800">{importResults.duplicates}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-100 rounded-lg p-3">
                    <div className="flex items-center">
                      <i className="ri-close-line text-red-600 text-xl ml-2"></i>
                      <div>
                        <p className="text-sm text-red-700">أخطاء</p>
                        <p className="text-xl font-bold text-red-800">{importResults.errors.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {importResults.errors.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">الأخطاء:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {importResults.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-4 flex justify-center">
                  <Link
                    href="/checks"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center whitespace-nowrap"
                  >
                    <i className="ri-list-check ml-2"></i>
                    عرض الشيكات
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
