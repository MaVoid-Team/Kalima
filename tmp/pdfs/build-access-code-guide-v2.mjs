import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("../../kalima-platform/frontend/node_modules/playwright");

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const outDir = path.join(root, "output/pdf");
const htmlPath = path.join(root, "tmp/pdfs/kalima-access-code-guide-ar.html");
const pdfPath = path.join(outDir, "kalima-access-code-guide-ar.pdf");

function dataUri(relativePath) {
  const filePath = path.join(root, relativePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".webp" ? "image/webp" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  return `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`;
}

const assets = {
  logo: dataUri("kalima-platform/frontend/src/assets/Logo.webp"),
  adminTemplates: dataUri(".codex-screenshots/access-code-guide-ar/01-admin-print-templates-ar.png"),
  instanceControls: dataUri(".codex-screenshots/access-code-guide-ar/02-instance-controls-ar.png"),
  accessCodes: dataUri(".codex-screenshots/access-code-guide-ar/03-access-codes-ar.png"),
  printableBatch: dataUri(".codex-screenshots/access-code-guide-ar/04-printable-batch-ar.png"),
  studentManual: dataUri(".codex-screenshots/access-code-guide-ar/05-student-manual-code-ar.png"),
  generatedPdf: dataUri(".codex-screenshots/access-code-guide/07-generated-batch-pdf-preview.png"),
};

const shot = (src, caption, extra = "") => `
  <figure class="shot ${extra}">
    <img src="${src}" alt="${caption}">
    <figcaption>${caption}</figcaption>
  </figure>`;

const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>دليل أكواد الوصول في كلمة</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #201315;
      background: #fffafa;
      font-family: "Geeza Pro", "Arial", "Tahoma", sans-serif;
      font-size: 13px;
      line-height: 1.65;
      direction: rtl;
    }
    .page {
      min-height: 273mm;
      padding-top: 7mm;
      page-break-after: always;
    }
    .page:last-child { page-break-after: auto; }
    .cover {
      display: flex;
      min-height: 273mm;
      flex-direction: column;
      justify-content: space-between;
      padding: 22mm;
      border: 1px solid #f4bdc4;
      border-radius: 18px;
      background:
        radial-gradient(circle at 100% 10%, rgba(227, 6, 19, .16), transparent 32%),
        linear-gradient(135deg, #fff 0%, #fff4f6 55%, #ffe8ec 100%);
    }
    .brand { display: flex; align-items: center; gap: 11px; }
    .brand img { width: 48px; height: 48px; object-fit: contain; }
    .brand strong { font-size: 22px; }
    h1, h2, h3 { margin: 0; line-height: 1.28; color: #171012; }
    h1 { font-size: 38px; max-width: 680px; }
    h2 { margin-bottom: 10px; font-size: 23px; }
    h3 { margin: 12px 0 7px; font-size: 16px; }
    p { margin: 0 0 8px; }
    .lead { max-width: 720px; font-size: 18px; color: #55373d; }
    .tag { color: #e30613; font-weight: 800; }
    .section {
      margin-bottom: 13px;
      padding: 14px 16px;
      border: 1px solid #f2c7cd;
      border-radius: 14px;
      background: #fff;
      box-shadow: 0 8px 20px rgba(70, 11, 20, .04);
      break-inside: avoid;
    }
    .soft { background: #fff7f8; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .three { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .card {
      padding: 11px;
      border: 1px solid #f2cbd0;
      border-radius: 12px;
      background: #fff;
      break-inside: avoid;
    }
    .num {
      display: inline-grid;
      place-items: center;
      width: 24px;
      height: 24px;
      margin-left: 6px;
      border-radius: 999px;
      background: #e30613;
      color: #fff;
      font-weight: 800;
      font-size: 12px;
    }
    ul, ol { margin: 6px 0 0; padding: 0 21px 0 0; }
    li { margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; overflow: hidden; border-radius: 10px; }
    th, td { padding: 7px 8px; border: 1px solid #f1cbd0; vertical-align: top; }
    th { background: #e30613; color: #fff; font-weight: 800; }
    td { background: #fff; }
    .ltr { direction: ltr; unicode-bidi: isolate; font-family: "Arial", sans-serif; }
    .note {
      padding: 9px 11px;
      border-right: 4px solid #e30613;
      border-radius: 10px;
      background: #fff1f3;
      color: #4d2d32;
      font-weight: 700;
      break-inside: avoid;
    }
    .shot {
      margin: 10px 0 0;
      border: 1px solid #edc4ca;
      border-radius: 12px;
      overflow: hidden;
      background: #fff;
      break-inside: avoid;
    }
    .shot img {
      display: block;
      width: 100%;
      max-height: 136mm;
      object-fit: contain;
      object-position: top center;
      background: #fff;
    }
    .shot.tall img { max-height: 155mm; }
    .shot.compact img { max-height: 92mm; }
    figcaption {
      padding: 7px 10px;
      border-top: 1px solid #f0c8ce;
      background: #fff7f8;
      color: #69474d;
      font-size: 11px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 9px;
      color: #8a6870;
      font-size: 11px;
      direction: ltr;
    }
  </style>
</head>
<body>
  <main>
    <section class="page cover">
      <div class="brand"><img src="${assets.logo}" alt="كلمة"><strong>كلمة</strong></div>
      <div>
        <p class="tag">دليل عربي تشغيلي</p>
        <h1>دليل أكواد الوصول المطبوعة للمذكرات التفاعلية</h1>
        <p class="lead">شرح خطوة بخطوة لإنشاء قالب الطباعة، ضبط الحقول، إنشاء أكواد الوصول، توليد دفعة PDF جاهزة للطباعة، مشاركة البطاقات، ثم استرداد الكود من حساب الطالب.</p>
      </div>
      <div class="note">كل الصور داخل هذا الملف مضمّنة في PDF نفسه، وليست روابط خارجية. لذلك ستظهر عند فتح الملف على أي جهاز.</div>
    </section>

    <section class="page">
      <div class="section">
        <h2>المسار الكامل باختصار</h2>
        <ol>
          <li><span class="num">1</span>افتح لوحة الإدارة ثم مساحة <b>المذكرات التفاعلية</b>.</li>
          <li><span class="num">2</span>ادخل إلى تبويب <b>وصول المعلمين</b>.</li>
          <li><span class="num">3</span>أنشئ أو اختر <b>قالب طباعة</b> للبطاقة.</li>
          <li><span class="num">4</span>افتح نسخة المذكرة الخاصة بالمعلم ثم اضغط <b>أكواد الوصول</b>.</li>
          <li><span class="num">5</span>اضبط شروط الأكواد ونوعها وعددها.</li>
          <li><span class="num">6</span>من <b>دفعة PDF جاهزة للطباعة</b> اختر القالب والنصوص والصورة ثم اضغط <b>إنشاء PDF للطباعة</b>.</li>
          <li><span class="num">7</span>نزّل ملف PDF وشاركه أو اطبعه، ثم يسترد الطالب الكود من صفحة <b>استرداد كود المذكرة التفاعلية</b>.</li>
        </ol>
      </div>
      <div class="grid">
        <div class="section soft"><h3>ما هو قالب الطباعة؟</h3><p>هو تصميم البطاقة الثابتة بمقاس 827 × 438 بكسل. القالب يحدد أماكن رمز QR ورقم الكود وصورة المدرس والصف والسعر والنص الأحمر.</p></div>
        <div class="section soft"><h3>ما هي دفعة PDF؟</h3><p>هي ملف PDF يحتوي على بطاقات جاهزة للتوزيع. كل بطاقة تمثل كود وصول لطالب واحد عند استخدام الإعداد الافتراضي الآمن.</p></div>
      </div>
      ${shot(assets.adminTemplates, "تبويب وصول المعلمين وفيه قوالب الطباعة ولوحة ضبط الحقول", "tall")}
      <div class="footer"><span>دليل أكواد الوصول في كليمة</span><span>1</span></div>
    </section>

    <section class="page">
      <div class="section">
        <h2>إنشاء قالب الطباعة</h2>
        <ol>
          <li><span class="num">1</span>في قسم <b>قوالب الطباعة</b> اكتب <b>اسم القالب</b>.</li>
          <li><span class="num">2</span>ارفع <b>صورة الخلفية</b> أو أدخل <b>معرّف أصل الخلفية</b> إذا كانت الخلفية محفوظة مسبقا.</li>
          <li><span class="num">3</span>يفضل أن تكون الخلفية 827 × 438 بكسل بدقة 300 نقطة لكل بوصة.</li>
          <li><span class="num">4</span>اضغط زر الحفظ أو الإنشاء بعد اكتمال الاسم والخلفية.</li>
        </ol>
      </div>
      <div class="section">
        <h2>ضبط حقول البطاقة</h2>
        <table>
          <tr><th>الحقل</th><th>استخدامه</th><th>ملاحظة مهمة</th></tr>
          <tr><td>رمز QR</td><td>يفتح صفحة استرداد الكود مع بيانات البطاقة.</td><td>اترك حوله مساحة كافية حتى يسهل مسحه.</td></tr>
          <tr><td>رقم الكود</td><td>يعطي الطالب بديلا يدويا إذا لم يستطع مسح QR.</td><td>يجب أن يكون واضحا وغير مغطى بعناصر التصميم.</td></tr>
          <tr><td>صورة المدرس</td><td>تضاف من الدفعة عند الحاجة.</td><td>لا تُسحب تلقائيا من ملف المدرس.</td></tr>
          <tr><td>طريقة التسجيل</td><td>مثال: كود أو منصة.</td><td>يمكن استخدام نص جاهز لتوحيد الكتابة.</td></tr>
          <tr><td>الصف</td><td>اسم الصف أو المجموعة.</td><td>يفضل اختيار النص من النصوص الجاهزة.</td></tr>
          <tr><td>السعر</td><td>نص اختياري للسعر المطبوع.</td><td>اتركه فارغا إذا لا تريد إظهاره.</td></tr>
          <tr><td>النص الأحمر</td><td>تنبيه أو عبارة قصيرة على البطاقة.</td><td>استخدمه للنصوص الضرورية فقط.</td></tr>
        </table>
      </div>
      <div class="note">يمكن تحريك الحقول بالسحب أو بإدخال قيم X و Y والعرض والارتفاع وحجم الخط من لوحة الحقل المحدد.</div>
      <div class="footer"><span>القالب</span><span>2</span></div>
    </section>

    <section class="page">
      <div class="section">
        <h2>فتح نسخة المعلم</h2>
        <p>بعد حفظ القالب، انزل إلى قائمة المعلمين وافتح نسخة المذكرة المطلوبة. ستظهر بطاقة فيها سعة المقاعد، مقاعد الطلاب المستخدمة، حصة مقاعد الطلاب، والأجهزة المستخدمة.</p>
        <p>من نفس البطاقة يمكن فتح الطلاب، عرض الإدارة، أكواد الوصول، أو إلغاء الوصول حسب الصلاحيات.</p>
      </div>
      ${shot(assets.instanceControls, "نسخة مذكرة مفتوحة وبها زر أكواد الوصول وبيانات المقاعد والطلاب", "tall")}
      <div class="footer"><span>نسخة المعلم</span><span>3</span></div>
    </section>

    <section class="page">
      <div class="section">
        <h2>إنشاء أكواد الوصول</h2>
        <ol>
          <li><span class="num">1</span>اضغط <b>أكواد الوصول</b>.</li>
          <li><span class="num">2</span>اختر <b>الشروط</b> أو السياسة النشطة التي ستتبعها الأكواد.</li>
          <li><span class="num">3</span>اختر <b>نوع الكود</b>: كود مدفوع أو كود مجاني.</li>
          <li><span class="num">4</span>حدد <b>عدد الأكواد</b>.</li>
          <li><span class="num">5</span>حدد <b>أقصى عدد استردادات</b>. اجعله 1 إذا أردت كودا خاصا لكل طالب.</li>
          <li><span class="num">6</span>أضف <b>تاريخ الانتهاء</b> عند الحاجة.</li>
          <li><span class="num">7</span>اضغط <b>إنشاء الأكواد</b> إذا كنت تريد أكوادا رقمية بدون ملف طباعة.</li>
        </ol>
      </div>
      ${shot(assets.accessCodes, "قسم أكواد الوصول: الشروط، نوع الكود، عدد الأكواد، الاستردادات، وتاريخ الانتهاء", "tall")}
      <div class="footer"><span>أكواد الوصول</span><span>4</span></div>
    </section>

    <section class="page">
      <div class="section">
        <h2>إنشاء دفعة PDF جاهزة للطباعة</h2>
        <ol>
          <li><span class="num">1</span>افتح قسم <b>دفعة PDF جاهزة للطباعة</b>.</li>
          <li><span class="num">2</span>اختر <b>معرّف قالب الطباعة</b> من قائمة القوالب.</li>
          <li><span class="num">3</span>اكتب <b>اسم الدفعة</b> حتى يسهل الرجوع إليها.</li>
          <li><span class="num">4</span>ارفع صورة المدرس أو أدخل <b>معرّف أصل صورة المدرس</b>.</li>
          <li><span class="num">5</span>املأ <b>نص الصف/المجموعة</b> و<b>طريقة التسجيل</b> و<b>نص السعر</b> و<b>النص الأحمر المخصص</b> عند الحاجة.</li>
          <li><span class="num">6</span>استخدم <b>معاينة البطاقة</b> للتأكد قبل التوليد.</li>
          <li><span class="num">7</span>اضغط <b>إنشاء PDF للطباعة</b>.</li>
        </ol>
      </div>
      ${shot(assets.printableBatch, "قسم دفعة PDF جاهزة للطباعة وفيه القالب والنصوص والصورة وزر إنشاء PDF للطباعة", "tall")}
      <div class="footer"><span>دفعة PDF جاهزة للطباعة</span><span>5</span></div>
    </section>

    <section class="page">
      <div class="section">
        <h2>تنزيل ومشاركة الدفعة</h2>
        <p>بعد التوليد تظهر الدفعة في <b>دفعات PDF المنشأة</b>. اضغط زر PDF لتنزيل الملف ثم اطبعه أو أرسله للمدرس أو فريق التوزيع.</p>
        <p>لا تشارك ملف PDF في قناة عامة، لأن كل بطاقة تحتوي على كود صالح. شارك بطاقة واحدة لكل طالب عند البيع الفردي.</p>
      </div>
      ${shot(assets.generatedPdf, "معاينة ملف PDF الناتج وفيه عدة بطاقات مطبوعة تحمل QR وكود الوصول", "compact")}
      <div class="section soft">
        <h3>قواعد مشاركة آمنة</h3>
        <ul>
          <li>راجع عدد البطاقات قبل الطباعة.</li>
          <li>استخدم اسم دفعة واضح يتضمن المدرس أو المجموعة أو التاريخ.</li>
          <li>إذا تسرب ملف الدفعة قبل التوزيع، أنشئ دفعة جديدة ولا تستخدم القديمة.</li>
          <li>لا ترسل لقطة شاشة عامة يظهر فيها كود وصول كامل.</li>
        </ul>
      </div>
      <div class="footer"><span>المشاركة</span><span>6</span></div>
    </section>

    <section class="page">
      <div class="section">
        <h2>استرداد الطالب للكود</h2>
        <ol>
          <li><span class="num">1</span>يفتح الطالب صفحة <b>استرداد كود المذكرة التفاعلية</b>.</li>
          <li><span class="num">2</span>يسجل الدخول أو ينشئ حساب طالب إذا لم يكن مسجلا.</li>
          <li><span class="num">3</span>يدخل <b>كود الوصول</b> كما هو مطبوع على البطاقة.</li>
          <li><span class="num">4</span>يقبل شروط الوصول.</li>
          <li><span class="num">5</span>يضغط <b>استرداد الكود</b>.</li>
        </ol>
      </div>
      ${shot(assets.studentManual, "صفحة استرداد كود المذكرة التفاعلية بالعربية", "tall")}
      <div class="note">بعد الاسترداد يرتبط الوصول بحساب الطالب وبسياسة الأجهزة المطبقة على المذكرة.</div>
      <div class="footer"><span>استرداد الطالب</span><span>7</span></div>
    </section>

    <section class="page">
      <div class="section">
        <h2>استخدام QR الموجود على البطاقة</h2>
        <p>رمز QR الموجود على البطاقة يفتح نفس مسار استرداد الكود، لكنه يملأ بيانات البطاقة تلقائيا عندما يكون الرابط صالحا والطالب مسجل الدخول.</p>
        <p>إذا فتح الطالب QR وهو غير مسجل الدخول، سيطلب منه النظام تسجيل الدخول أو إنشاء حساب أولا، ثم يعود لاستكمال الاسترداد.</p>
      </div>
      <div class="grid">
        <div class="card"><h3>قبل تسجيل الدخول</h3><p>تظهر رسالة تطلب من الطالب تسجيل الدخول أو التسجيل قبل قبول كود المذكرة.</p></div>
        <div class="card"><h3>بعد تسجيل الدخول</h3><p>تظهر بيانات المعلم والمذكرة والصف وطريقة التسجيل والكود، ثم يضغط الطالب استرداد الكود بعد قبول الشروط.</p></div>
      </div>
      <div class="note">مهم: يجب ألا يغطي أي نص أو صورة رمز QR داخل القالب. إذا كان QR لا يمسح بسهولة، ارجع إلى قالب الطباعة وزد مساحة QR أو انقله بعيدا عن النصوص.</div>
      <div class="footer"><span>استخدام QR</span><span>8</span></div>
    </section>

    <section class="page">
      <div class="section">
        <h2>المتابعة بعد الاسترداد</h2>
        <ul>
          <li>افتح نسخة المذكرة من <b>وصول المعلمين</b> لمراجعة المقاعد المستخدمة.</li>
          <li>قسم <b>طلاب لديهم وصول</b> يعرض الطلاب الذين استردوا أو حصلوا على الوصول.</li>
          <li>استخدم <b>إدارة الأجهزة</b> لمعالجة مشاكل حدود الأجهزة.</li>
          <li>راجع حالة الكود وعدد الاستردادات عند دعم طالب لا يستطيع الدخول.</li>
        </ul>
      </div>
      <div class="section">
        <h2>مشاكل شائعة وحلولها</h2>
        <table>
          <tr><th>المشكلة</th><th>السبب المعتاد</th><th>الحل</th></tr>
          <tr><td>زر إنشاء القالب غير مفعل</td><td>اسم القالب أو الخلفية غير مكتمل.</td><td>اكتب الاسم وارفع الخلفية أو أدخل معرّف أصل صحيح.</td></tr>
          <tr><td>زر إنشاء PDF للطباعة غير مفعل</td><td>قالب غير مختار أو حقل مطلوب فارغ.</td><td>اختر القالب واملأ الحقول المطلوبة للدفعة.</td></tr>
          <tr><td>QR لا يفتح بشكل صحيح</td><td>النصوص تغطي QR أو الطالب غير مسجل الدخول.</td><td>صحح موضع QR واطلب من الطالب تسجيل الدخول.</td></tr>
          <tr><td>الكود مستخدم بالفعل</td><td>كود مدفوع تم استرداده من حساب آخر.</td><td>استخدم كودا جديدا أو راجع أقصى عدد استردادات.</td></tr>
          <tr><td>صورة المدرس لا تظهر</td><td>لم ترفع الصورة داخل الدفعة.</td><td>ارفع الصورة من قسم دفعة PDF أو أدخل معرّف الأصل الصحيح.</td></tr>
        </table>
      </div>
      <div class="footer"><span>الدعم</span><span>9</span></div>
    </section>

    <section class="page">
      <div class="section">
        <h2>قائمة فحص قبل التسليم</h2>
        <div class="three">
          <div class="card"><h3>القالب</h3><ul><li>الخلفية 827 × 438 بكسل.</li><li>QR واضح وغير مغطى.</li><li>رقم الكود ظاهر.</li><li>القالب محفوظ ونشط.</li></ul></div>
          <div class="card"><h3>الدفعة</h3><ul><li>الشروط صحيحة.</li><li>نوع الكود صحيح.</li><li>عدد البطاقات صحيح.</li><li>ملف PDF تم تنزيله.</li></ul></div>
          <div class="card"><h3>الطالب</h3><ul><li>لديه حساب طالب.</li><li>قبل شروط الوصول.</li><li>الكود غير منتهي.</li><li>الوصول ظهر في حسابه.</li></ul></div>
        </div>
      </div>
      <div class="section soft">
        <h2>الخلاصة</h2>
        <p>ابدأ بقالب طباعة مضبوط، ثم افتح نسخة المعلم، اضبط أكواد الوصول، أنشئ دفعة PDF جاهزة للطباعة، ووزع بطاقة واحدة لكل طالب. الطالب يسترد الكود من صفحة استرداد كود المذكرة التفاعلية أو عبر QR.</p>
      </div>
      <div class="brand" style="margin-top: 24px;"><img src="${assets.logo}" alt="كلمة"><strong>كلمة</strong></div>
      <div class="footer"><span>النهاية</span><span>10</span></div>
    </section>
  </main>
</body>
</html>`;

fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(htmlPath, html, "utf8");

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();

console.log(JSON.stringify({ htmlPath, pdfPath }, null, 2));
