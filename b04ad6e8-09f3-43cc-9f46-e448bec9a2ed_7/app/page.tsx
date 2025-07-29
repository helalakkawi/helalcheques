
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [stats, setStats] = useState({
    totalChecks: 0,
    totalAmount: 0,
    dueAmount: 0,
    upcomingDue: 0
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // حساب الإحصائيات من البيانات المحفوظة
    const savedChecks = localStorage.getItem('bankChecks');
    if (savedChecks) {
      const checks = JSON.parse(savedChecks);
      const today = new Date();
      const currentYear = today.getFullYear();
      
      // إحصائيات 2025
      const checks2025 = checks.filter((check: any) => {
        const checkDate = new Date(check.dueDate);
        return checkDate.getFullYear() === 2025;
      });
      
      // إحصائيات 2026
      const checks2026 = checks.filter((check: any) => {
        const checkDate = new Date(check.dueDate);
        return checkDate.getFullYear() === 2026;
      });
      
      // الشيكات المستحقة خلال 15 يوم
      const next15Days = new Date();
      next15Days.setDate(today.getDate() + 15);
      
      const upcomingChecks = checks.filter((check: any) => {
        const checkDate = new Date(check.dueDate);
        return checkDate >= today && checkDate <= next15Days && check.status === 'received';
      });
      
      setStats({
        totalChecks: checks2025.length,
        totalAmount: checks2025.reduce((sum: number, check: any) => sum + check.amount, 0),
        dueAmount: checks2026.reduce((sum: number, check: any) => sum + check.amount, 0),
        upcomingDue: upcomingChecks.reduce((sum: number, check: any) => sum + check.amount, 0)
      });
    }
  }, []);

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
              <Link href="/" className="text-blue-600 font-medium">الرئيسية</Link>
              <Link href="/checks" className="text-gray-600 hover:text-blue-600">إدارة الشيكات</Link>
              <Link href="/reports" className="text-gray-600 hover:text-blue-600">التقارير</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center ml-4">
                <i className="ri-file-list-line text-2xl text-blue-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الشيكات 2025</p>
                <p className="text-2xl font-bold text-gray-900" suppressHydrationWarning={true}>
                  {isClient ? stats.totalChecks : 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center ml-4">
                <i className="ri-money-dollar-circle-line text-2xl text-green-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">مجموع المبالغ 2025</p>
                <p className="text-2xl font-bold text-gray-900" suppressHydrationWarning={true}>
                  {isClient ? stats.totalAmount.toLocaleString() : 0} ₪
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center ml-4">
                <i className="ri-calendar-line text-2xl text-yellow-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">مستحقات 2026</p>
                <p className="text-2xl font-bold text-gray-900" suppressHydrationWarning={true}>
                  {isClient ? stats.dueAmount.toLocaleString() : 0} ₪
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center ml-4">
                <i className="ri-alarm-warning-line text-2xl text-red-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">مستحقة خلال 15 يوم</p>
                <p className="text-2xl font-bold text-gray-900" suppressHydrationWarning={true}>
                  {isClient ? stats.upcomingDue.toLocaleString() : 0} ₪
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
            <div className="space-y-3">
              <Link href="/checks/add" className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center ml-3">
                  <i className="ri-add-line text-white"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">إضافة شيك جديد</p>
                  <p className="text-sm text-gray-600">إدخال بيانات شيك جديد</p>
                </div>
              </Link>
              
              <Link href="/checks/import" className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center ml-3">
                  <i className="ri-file-excel-line text-white"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">استيراد من Excel</p>
                  <p className="text-sm text-gray-600">رفع ملف Excel مع الشيكات</p>
                </div>
              </Link>
              
              <Link href="/reports" className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center ml-3">
                  <i className="ri-file-chart-line text-white"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">عرض التقارير</p>
                  <p className="text-sm text-gray-600">تقارير وإحصائيات مفصلة</p>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Due Checks Alert */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">تنبيهات الاستحقاق</h3>
            <DueChecksAlert />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">آخر الأنشطة</h3>
          </div>
          <div className="p-6">
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
}

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
              {check.amount.toLocaleString()} ₪ - {new Date(check.dueDate).toLocaleDateString('ar-SA')}
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
              {new Date(check.createdAt).toLocaleDateString('ar-SA')}
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
