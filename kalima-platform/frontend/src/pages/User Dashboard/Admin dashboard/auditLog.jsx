/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { FiX, FiFileText, FiChevronDown, FiUser, FiEdit, FiRotateCw } from "react-icons/fi";
import { FaCheckCircle, FaHourglassHalf, FaExclamationTriangle } from "react-icons/fa";

const AuditLog = () => {
  return (
    <div className="mx-auto w-full max-w-full p-20 bg-base-100 min-h-screen bg-gradient-to-br" dir="rtl">      
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 justify-start">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-outline rounded-full min-w-[180px] flex justify-between">
            <FiChevronDown className="h-5 w-5" />
            <span>المستخدم</span>
          </label>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a>الكل</a></li>
            <li><a>أحمد علي</a></li>
            <li><a>سارة حسن</a></li>
            <li><a>يوسف سعيد</a></li>
            <li><a>عمر خالد</a></li>
          </ul>
        </div>
        
        <div className="dropdown dropdown-end">
          <label tabIndex={1} className="btn btn-outline rounded-full min-w-[180px] flex justify-between">
            <FiChevronDown className="h-5 w-5" />
            <span>الصلاحية</span>
          </label>
          <ul tabIndex={1} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a>الكل</a></li>
            <li><a>مسؤول</a></li>
            <li><a>معلم</a></li>
            <li><a>طالب</a></li>
            <li><a>مشرف</a></li>
          </ul>
        </div>
        
        <div className="dropdown dropdown-end">
          <label tabIndex={2} className="btn btn-outline rounded-full min-w-[180px] flex justify-between">
            <FiChevronDown className="h-5 w-5" />
            <span>الإجراء</span>
          </label>
          <ul tabIndex={2} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a>الكل</a></li>
            <li><a>حذف</a></li>
            <li><a>تعديل</a></li>
            <li><a>محاولة</a></li>
          </ul>
        </div>
        
        <div className="dropdown dropdown-end">
          <label tabIndex={3} className="btn btn-outline rounded-full min-w-[180px] flex justify-between">
            <FiChevronDown className="h-5 w-5" />
            <span>العنصر المتأثر</span>
          </label>
          <ul tabIndex={3} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a>الكل</a></li>
            <li><a>كورس</a></li>
            <li><a>درس</a></li>
            <li><a>اختبار</a></li>
            <li><a>مستخدم</a></li>
          </ul>
        </div>
        
        <div className="dropdown dropdown-end">
          <label tabIndex={4} className="btn btn-outline rounded-full min-w-[180px] flex justify-between">
            <FiChevronDown className="h-5 w-5" />
            <span>التاريخ والوقت</span>
          </label>
          <ul tabIndex={4} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a>اليوم</a></li>
            <li><a>هذا الأسبوع</a></li>
            <li><a>هذا الشهر</a></li>
            <li><a>مخصص</a></li>
          </ul>
        </div>
        
        <div className="dropdown dropdown-end">
          <label tabIndex={5} className="btn btn-outline rounded-full min-w-[180px] flex justify-between">
            <FiChevronDown className="h-5 w-5" />
            <span>الحالة</span>
          </label>
          <ul tabIndex={5} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a>الكل</a></li>
            <li><a>ناجح</a></li>
            <li><a>قيد المعالجة</a></li>
            <li><a>فشل</a></li>
          </ul>
        </div>
        
        <button className="btn btn-info text-white rounded-full gap-2">
          <FiRotateCw className="h-5 w-5" />
          <span>تطبيق الفلتر</span>
        </button>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto ">
        <table className="table w-full">
          {/* Table Headers */}
          <thead>
            <tr className="text-right">
              <th className="text-right">المستخدم</th>
              <th className="text-right">الصلاحية</th>
              <th className="text-right">الإجراء</th>
              <th className="text-right">العنصر المتأثر</th>
              <th className="text-right">التاريخ و الوقت</th>
              <th className="text-right">الحالة</th>
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody>
            {/* Row 1 */}
            <tr className="hover">
              <td className="text-right">أحمد علي</td>
              <td className="text-right">مسؤول (أدمن)</td>
              <td className="text-right">
                <div className="flex items-center justify-start gap-2">
                  <span>حذف كورس</span>
                  <div className="badge badge-error badge-sm p-3">
                    <FiX className="h-4 w-4 text-white" />
                  </div>
                </div>
              </td>
              <td className="text-right">كورس: فيزياء 101</td>
              <td className="text-right">
                <div className="flex flex-col">
                  <span>02-04-2025</span>
                  <span>14:35</span>
                </div>
              </td>
              <td className="text-right">
                <div className="flex items-center justify-start gap-2">
                  <span>ناجح</span>
                  <FaCheckCircle className="h-5 w-5 text-success" />
                </div>
              </td>
            </tr>
            
            {/* Row 2 */}
            <tr className="hover">
              <td className="text-right">سارة حسن</td>
              <td className="text-right">معلم</td>
              <td className="text-right">
                <div className="flex items-center justify-start gap-2">
                  <span>تعديل درس</span>
                  <div className="badge badge-warning badge-sm p-3">
                    <FiEdit className="h-4 w-4 text-white" />
                  </div>
                </div>
              </td>
              <td className="text-right">درس: قواعد النحو</td>
              <td className="text-right">
                <div className="flex flex-col">
                  <span>02-04-2025</span>
                  <span>10:12</span>
                </div>
              </td>
              <td className="text-right">
                <div className="flex items-center justify-start gap-2">
                  <span>ناجح</span>
                  <FaCheckCircle className="h-5 w-5 text-success" />
                </div>
              </td>
            </tr>
            
            {/* Row 3 */}
            <tr className="hover">
              <td className="text-right">يوسف سعيد</td>
              <td className="text-right">طالب</td>
              <td className="text-right">
                <div className="flex items-center justify-start gap-2">
                  <span>محاولة اختبار</span>
                  <div className="badge badge-neutral badge-sm p-3">
                    <FiFileText className="h-4 w-4 text-white" />
                  </div>
                </div>
              </td>
              <td className="text-right">
                <div className="flex items-center justify-start gap-2">
                  <span>اختبار الجبر: 1</span>
                  <div className="badge badge-neutral badge-sm p-3">
                    <FiFileText className="h-4 w-4 text-white" />
                  </div>
                </div>
              </td>
              <td className="text-right">
                <div className="flex flex-col">
                  <span>01-04-2025</span>
                  <span>18:22</span>
                </div>
              </td>
              <td className="text-right">
                <div className="flex items-center justify-start gap-2">
                  <span>قيد المعالجة</span>
                  <FaHourglassHalf className="h-5 w-5 text-amber-700" />
                </div>
              </td>
            </tr>
            
            {/* Row 4 */}
            <tr className="hover">
              <td className="text-right">عمر خالد</td>
              <td className="text-right">مشرف</td>
              <td className="text-right">
                <div className="flex items-center justify-start gap-2">
                  <span>تعديل صلاحية مستخدم</span>
                  <div className="badge badge-info badge-sm p-3">
                    <FiRotateCw className="h-4 w-4 text-white" />
                  </div>
                </div>
              </td>
              <td className="text-right">
                <div className="flex items-center justify-start gap-2">
                  <span>المستخدم فاطمة (تم التغيير إلى معلم)</span>
                  <div className="badge badge-neutral badge-sm p-3">
                    <FiUser className="h-4 w-4 text-white" />
                  </div>
                </div>
              </td>
              <td className="text-right">
                <div className="flex flex-col">
                  <span>31-03-2025</span>
                  <span>22:10</span>
                </div>
              </td>
              <td className="text-right">
                <div className="flex items-center justify-start gap-2">
                  <span>فشل</span>
                  <FaExclamationTriangle className="h-5 w-5 text-warning" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;