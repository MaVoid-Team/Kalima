const net = require("net");
const path = require("path");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const defaultDatabaseUrl =
  "postgresql://postgres:postgres@127.0.0.1:55432/postgres?schema=kalima";
const configuredDatabaseUrl = process.env.DATABASE_URL || defaultDatabaseUrl;

const getDatabaseEndpoint = (dbUrl) => {
  const url = new URL(dbUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 5432),
  };
};

const canConnect = ({ host, port }, timeoutMs = 1500) =>
  new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeoutMs);
    socket.once("connect", () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => {
      clearTimeout(timer);
      resolve(false);
    });
  });

async function main() {
  let effectiveDbUrl = configuredDatabaseUrl;
  let endpoint = getDatabaseEndpoint(effectiveDbUrl);

  if (!(await canConnect(endpoint))) {
    const localEndpoint = getDatabaseEndpoint(defaultDatabaseUrl);
    if (await canConnect(localEndpoint)) {
      console.log(
        `Configured Postgres (${endpoint.host}:${endpoint.port}) unreachable, using local Postgres at ${localEndpoint.host}:${localEndpoint.port}`
      );
      effectiveDbUrl = defaultDatabaseUrl;
    } else {
      throw new Error(`Cannot reach Postgres at ${endpoint.host}:${endpoint.port} or ${localEndpoint.host}:${localEndpoint.port}`);
    }
  }

  const pool = new Pool({ connectionString: effectiveDbUrl });
  const client = await pool.connect();

  try {
    await client.query("set search_path to kalima");
    await client.query("begin");

    console.log("🌱 Starting local database seeding...");

    // 1. Ensure Admin and Test Users
    const adminRes = await client.query("select id from users where role = 'Admin' order by id asc limit 1");
    if (!adminRes.rowCount) {
      throw new Error("Please run npm run seed:local-admin first.");
    }
    const adminId = adminRes.rows[0].id;

    // 2. Seed Academic Hierarchy (Governments, Zones, Subjects, Levels)
    const governments = {
      Cairo: ["Nasr City", "Maadi", "New Cairo", "Heliopolis", "Shoubra"],
      Giza: ["Dokki", "Mohandessin", "Haram", "6th of October", "Sheikh Zayed"],
      Alexandria: ["Smouha", "Sidi Gaber", "Gleem", "Miami"],
      Dakahlia: ["Mansoura", "Talkha", "Mit Ghamr"],
      Sharqia: ["Zagazig", "10th of Ramadan", "Belbeis"],
    };

    for (const [gov, zones] of Object.entries(governments)) {
      const gRes = await client.query(
        `insert into government (title, active) values ($1, true)
         on conflict (title) do update set active = true returning id`,
        [gov]
      );
      const govId = gRes.rows[0].id;
      for (const zone of zones) {
        await client.query(
          `insert into zones (title, government_id, active) values ($1, $2, true)
           on conflict (title, government_id) do update set active = true`,
          [zone, govId]
        );
      }
    }

    const subjects = ["Arabic", "English", "Mathematics", "Science", "Social Studies", "Physics", "Chemistry", "Biology"];
    for (const sub of subjects) {
      await client.query(
        `insert into subjects (title, active) values ($1, true)
         on conflict (title) do update set active = true`,
        [sub]
      );
    }

    const levels = [
      "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
      "Preparatory 1", "Preparatory 2", "Preparatory 3",
      "Secondary 1", "Secondary 2", "Secondary 3"
    ];
    for (const lvl of levels) {
      await client.query(
        `insert into levels (title, active) values ($1, true)
         on conflict (title) do update set active = true`,
        [lvl]
      );
    }
    console.log("✅ Academic hierarchy seeded.");

    // 3. Payment Methods
    const paymentMethods = [
      { name: "فودافون كاش (Vodafone Cash)", phone_number: "01012345678" },
      { name: "إنستاباي (InstaPay)", phone_number: "01112345678" },
      { name: "فوري باي (Fawry Pay)", phone_number: "01212345678" },
      { name: "تحويل بنكي - البنك التجاري الدولي (CIB)", phone_number: "01512345678" },
    ];

    const paymentMethodIds = [];
    for (const pm of paymentMethods) {
      const pmRes = await client.query(
        `insert into payment_methods (name, phone_number, status, is_deleted, created_at, updated_at)
         values ($1, $2, true, false, now(), now())
         returning id`,
        [pm.name, pm.phone_number]
      );
      paymentMethodIds.push(pmRes.rows[0].id);
    }
    console.log(`✅ ${paymentMethodIds.length} Payment methods seeded.`);

    // 4. Categories
    const categoriesData = [
      { title: "المرحلة الابتدائية (Primary Stage)", description: "مذكرات وكتب الصفوف من الأول إلى السادس الابتدائي" },
      { title: "المرحلة الإعدادية (Preparatory Stage)", description: "مناهج ومراجعات الصفوف الأول والثاني والثالث الإعدادي" },
      { title: "المرحلة الثانوية (Secondary Stage)", description: "مراجعات الثانوية العامة والتأسيس للجامعات" },
      { title: "مذكرات المراجعة النهائية", description: "كبسولات ومذكرات ليلة الامتحان مع نماذج الإجابة" },
      { title: "دورات التأسيس واللغات", description: "كورسات ودورات تأسيسية في اللغات والرياضيات" },
    ];

    const categoryIds = [];
    for (const cat of categoriesData) {
      const cRes = await client.query(
        `insert into categories (title, description, active, created_at, updated_at)
         values ($1, $2, true, now(), now())
         returning id`,
        [cat.title, cat.description]
      );
      categoryIds.push(cRes.rows[0].id);
    }
    console.log(`✅ ${categoryIds.length} Categories seeded.`);

    // 5. Required Field Definitions
    const reqFields = [
      { label: "اسم الطالب ثلاثي", field_type: "text" },
      { label: "رقم هاتف الطالب / ولي الأمر", field_type: "text" },
      { label: "المحافظة والمنطقة", field_type: "text" },
      { label: "الصف الدراسي والمدرسة", field_type: "text" },
    ];
    const fieldDefIds = [];
    for (const rf of reqFields) {
      const rfRes = await client.query(
        `insert into required_field_definitions (label, field_type, active, created_at, updated_at)
         values ($1, $2, true, now(), now())
         on conflict (label) do update set active = true
         returning id`,
        [rf.label, rf.field_type]
      );
      fieldDefIds.push(rfRes.rows[0].id);
    }
    console.log(`✅ ${fieldDefIds.length} Required field definitions seeded.`);

    // 6. Products
    const productsData = [
      {
        title: "مذكرة المراجعة النهائية - لغة عربية (الصف الثالث الإعدادي)",
        description: "شرح شامل لقواعد النحو، البلاغة، ونصوص القراءة مع 10 نماذج امتحانات مجابة بالكامل طبقا لأحدث مواصفات وزارة التربية والتعليم.",
        price: 150.00,
        price_after_discount: 120.00,
        serial: "AR-PREP3-2026",
        catIndex: 1,
        perks: "نماذج امتحانات مجابة | ملخص شامل للنحو والبلاغة | دعم واستفسارات مع المعلم",
      },
      {
        title: "المعاصر في الرياضيات - أولى ثانوي (شامل بنك الأسئلة)",
        description: "تغطية كاملة لفروع الجبر، حساب المثلثات، والهندسة التحليلية مع حلول تفصيلية واختبارات تفاعلية.",
        price: 220.00,
        price_after_discount: 180.00,
        serial: "MATH-SEC1-2026",
        catIndex: 2,
        perks: "أكثر من 500 سؤال وتمرين | امتحانات تراكمية | خطوات الحل خطوة بخطوة",
      },
      {
        title: "باقة اللغة الإنجليزية الشاملة - ثالثة ثانوي (Master English)",
        description: "المذكرة الذهبية في القواعد (Grammar)، المفردات وحفظ الكلمات، مع بنك أسئلة للقصة والترجمة المقالية.",
        price: 300.00,
        price_after_discount: 240.00,
        serial: "ENG-SEC3-2026",
        catIndex: 2,
        perks: "أقوى ملخص جرامر في 40 صفحة | تدريبات على نمط الامتحان الإلكتروني | ملف صوتي للكلمات",
      },
      {
        title: "دليل تجارب العلوم والأنشطة العملية - سادسة ابتدائي",
        description: "شرح مبسط وتفاعلي لمنهج العلوم الجديد مع رسومات توضيحية ملونة وأنشطة منزلية ممتعة.",
        price: 120.00,
        price_after_discount: 95.00,
        serial: "SCI-PRI6-2026",
        catIndex: 0,
        perks: "صور ورسومات عالية الجودة | أسئلة بنك المعرفة | تلخيص في خرائط ذهنية",
      },
      {
        title: "الفيزياء الحديثة والميكانيكا - ثانية ثانوي",
        description: "شرح معمق لقوانين الحركة والجاذبية والموجات الضوئية، مع مسائل متنوعة من السهل إلى مستويات التفكير العليا.",
        price: 250.00,
        price_after_discount: 200.00,
        serial: "PHYS-SEC2-2026",
        catIndex: 2,
        perks: "مسائل مستويات التفكير العليا | قوانين واستنتاجات مجمعة | اختبارات أسبوعية",
      },
      {
        title: "ملخص الكيمياء العضوية الشامل - ثالثة ثانوي",
        description: "مخططات تفاعلية لجميع معادلات الكيمياء العضوية وطرق الكشف عن المركبات بدون تعقيد.",
        price: 260.00,
        price_after_discount: 195.00,
        serial: "CHEM-SEC3-2026",
        catIndex: 2,
        perks: "مخطط سهمي شامل لجميع التفاعلات | تجميع لأهم الأسئلة الوزارية السابقة | إجابات معتمدة",
      },
      {
        title: "كتاب الدراسات الاجتماعية الشامل - تانية إعدادي",
        description: "شرح مميز للجغرافيا والتاريخ الإسلامي مع خرائط توضيحية وجداول مقارنات سريعة للحفظ والفهم.",
        price: 140.00,
        price_after_discount: 110.00,
        serial: "SOC-PREP2-2026",
        catIndex: 1,
        perks: "خرائط ملونة عالية الدقة | جداول مقارنات جاهزة | مراجعة سريعة ليلة الامتحان",
      },
      {
        title: "تأسيس الرياضيات والحساب الذهني - المرحلة الابتدائية",
        description: "كورس ومذكرة عملية لتقوية مهارات جدول الضرب، القسمة المطولة، والعمليات الحسابية السريعة للأطفال.",
        price: 160.00,
        price_after_discount: 130.00,
        serial: "MATH-ELEM-2026",
        catIndex: 0,
        perks: "تمارين يومية متدرجة | تقنيات الحساب الذهني الفيدي | مناسب للتعلم الذاتي",
      },
    ];

    const productIds = [];
    for (const p of productsData) {
      const pRes = await client.query(
        `insert into products (
          title, description, price, price_after_discount, serial, type, is_archived, is_deleted, perks, created_at, updated_at
        ) values ($1, $2, $3, $4, $5, 'Product', false, false, $6, now() - interval '10 days', now())
        returning id`,
        [p.title, p.description, p.price, p.price_after_discount, p.serial, p.perks]
      );
      const pid = pRes.rows[0].id;
      productIds.push(pid);

      // Link to category
      const targetCatId = categoryIds[p.catIndex] || categoryIds[0];
      await client.query(
        `insert into product_categories (product_id, category_id) values ($1, $2)
         on conflict (product_id, category_id) do nothing`,
        [pid, targetCatId]
      );

      // Link required fields
      for (const fid of fieldDefIds.slice(0, 2)) {
        await client.query(
          `insert into product_required_fields (product_id, field_definition_id, is_required, active)
           values ($1, $2, true, true)
           on conflict (product_id, field_definition_id) do update set active = true`,
          [pid, fid]
        );
      }
    }
    console.log(`✅ ${productIds.length} Products seeded with categories and required fields.`);

    // 7. Coupons
    const couponsData = [
      { code: "KALIMA20", type: "percentage", percentage: 20, amount: 0, scope: "category", category_id: categoryIds[0], product_id: null },
      { code: "START50", type: "fixed", percentage: 0, amount: 50, scope: "product", category_id: null, product_id: productIds[0] },
      { code: "STUDENT10", type: "percentage", percentage: 10, amount: 0, scope: "category", category_id: categoryIds[1], product_id: null },
      { code: "VIP30", type: "percentage", percentage: 30, amount: 0, scope: "product", category_id: null, product_id: productIds[1] },
    ];
    for (const c of couponsData) {
      await client.query(
        `insert into coupons (
          code, type, discount_percentage, discount_amount, applicability_scope, product_id, category_id, active, is_deleted, starts_at, expires_at, created_at, updated_at
        ) values ($1, $2, $3, $4, $5, $6, $7, true, false, now() - interval '30 days', now() + interval '365 days', now(), now())
        on conflict (code) do update set active = true, product_id = excluded.product_id, category_id = excluded.category_id`,
        [c.code, c.type, c.percentage, c.amount, c.scope, c.product_id, c.category_id]
      );
    }
    console.log(`✅ ${couponsData.length} Coupons seeded.`);

    // 8. Sample Sections & Samples
    const sampleSectionsData = [
      { title: "عينات ومقتطفات المرحلة الابتدائية", description: "نماذج مجانية من مذكرات الصفوف الابتدائية للاطلاع والتحميل", sort_order: 1 },
      { title: "عينات ومقتطفات المرحلة الإعدادية", description: "نماذج مجانية من مذكرات وتدريبات الصفوف الإعدادية", sort_order: 2 },
      { title: "عينات ومقتطفات المرحلة الثانوية", description: "نماذج مجانية من مذكرات المراجعة للثانوية العامة", sort_order: 3 },
    ];

    for (let i = 0; i < sampleSectionsData.length; i++) {
      const sec = sampleSectionsData[i];
      const secRes = await client.query(
        `insert into sample_sections (title, description, sort_order, active, created_at, updated_at)
         values ($1, $2, $3, true, now(), now())
         returning id`,
        [sec.title, sec.description, sec.sort_order]
      );
      const secId = secRes.rows[0].id;

      // Add a couple of samples per section
      const sampleTitles = [
        `عينة مجانية من ملخص الوحدة الأولى (${sec.title.split(' ')[2]})`,
        `نموذج اختبار تجريبي شامل مع الإجابات (${sec.title.split(' ')[2]})`,
      ];
      for (const st of sampleTitles) {
        await client.query(
          `insert into samples (
            section_id, product_id, title, media_type, original_name, mime_type, size, high_quality_url, low_quality_url, created_at, updated_at
          ) values (
            $1, $2, $3, 'pdf', 'sample_preview.pdf', 'application/pdf', 1024567,
            'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            now(), now()
          )`,
          [secId, productIds[i] || productIds[0], st]
        );
      }
    }
    console.log(`✅ Sample sections and samples seeded.`);

    // 9. Purchases & Orders (with realistic confirmed revenue)
    const allUsersRes = await client.query("select id, name, email from users where role <> 'Admin'");
    const regularUsers = allUsersRes.rows;

    const purchaseStatuses = ["confirmed", "confirmed", "delivered", "confirmed", "pending", "confirmed", "delivered"];
    let orderNum = 1001;

    for (let i = 0; i < purchaseStatuses.length; i++) {
      const status = purchaseStatuses[i];
      const targetUser = regularUsers[i % regularUsers.length] || { id: adminId };
      const product1 = productsData[i % productsData.length];
      const product2 = productsData[(i + 1) % productsData.length];
      const pId1 = productIds[i % productIds.length];
      const pId2 = productIds[(i + 1) % productIds.length];

      const subtotal = product1.price_after_discount + product2.price_after_discount;
      const discount = 20.00;
      const total = subtotal - discount;
      const daysAgo = (purchaseStatuses.length - i) * 2;

      const pRes = await client.query(
        `insert into purchases (
          user_id, status, subtotal, discount, total, payment_method_id, purchase_serial,
          number_transferred_from, payment_number, notes, created_at, updated_at, confirmed_at, confirmed_by, delivered_at
        ) values (
          $1, $2, $3, $4, $5, $6, $7,
          '01098765432', '01012345678', 'طلب تجريبي محلي سريع',
          now() - interval '${daysAgo} days', now() - interval '${daysAgo} days',
          ${status === 'confirmed' || status === 'delivered' ? `now() - interval '${daysAgo} days'` : 'null'},
          ${status === 'confirmed' || status === 'delivered' ? adminId : 'null'},
          ${status === 'delivered' ? `now() - interval '${daysAgo - 1} days'` : 'null'}
        ) returning id`,
        [
          targetUser.id,
          status,
          subtotal,
          discount,
          total,
          paymentMethodIds[0],
          `ORD-${orderNum++}`,
        ]
      );
      const purchaseId = pRes.rows[0].id;

      // Purchase Items
      await client.query(
        `insert into purchase_items (
          purchase_id, product_id, price_at_purchase, discount, final_price, quantity, required_fields_filled, created_at, updated_at
        ) values ($1, $2, $3, 10, $4, 1, true, now() - interval '${daysAgo} days', now())`,
        [purchaseId, pId1, product1.price, product1.price_after_discount - 10]
      );

      await client.query(
        `insert into purchase_items (
          purchase_id, product_id, price_at_purchase, discount, final_price, quantity, required_fields_filled, created_at, updated_at
        ) values ($1, $2, $3, 10, $4, 1, true, now() - interval '${daysAgo} days', now())`,
        [purchaseId, pId2, product2.price, product2.price_after_discount - 10]
      );
    }
    console.log(`✅ ${purchaseStatuses.length} Orders / Purchases seeded with realistic revenue and statuses.`);

    // 10. Product Reviews
    const sampleReviews = [
      { rating: 5, text: "مذكرة ممتازة جداً وشرح وافي، ساعدتني جداً في حل المسائل الصعبة!" },
      { rating: 5, text: "أفضل مراجعة نهائية على الإطلاق، الأسئلة متطابقة مع امتحانات الوزارة." },
      { rating: 4, text: "محتوى قيم ومنظم وسهل الفهم والتطبيق." },
      { rating: 5, text: "أنصح كل الطلاب بالاعتماد عليها، جهد رائع ومبذول بإتقان." },
    ];
    for (let i = 0; i < productIds.length; i++) {
      const pid = productIds[i];
      const review = sampleReviews[i % sampleReviews.length];
      const reviewer = regularUsers[i % regularUsers.length] || { id: adminId };
      await client.query(
        `insert into product_reviews (product_id, user_id, rating, review_text, created_at, updated_at)
         values ($1, $2, $3, $4, now() - interval '${i + 1} days', now())
         on conflict (product_id, user_id) do update set rating = excluded.rating, review_text = excluded.review_text`,
        [pid, reviewer.id, review.rating, review.text]
      );
    }
    console.log(`✅ Product reviews seeded.`);

    await client.query("commit");
    console.log("\n🎉 ALL LOCAL SEED DATA SUCCESSFULLY INSERTED!");
  } catch (error) {
    await client.query("rollback");
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
