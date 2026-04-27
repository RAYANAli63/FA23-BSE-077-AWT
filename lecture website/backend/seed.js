const mongoose = require('mongoose');
const Lecture = require('./models/Lecture');

const mongoURI = 'mongodb://localhost:27017/lecture-platform';

const lectureData = {
  title: 'Node.js Core Concepts & Architecture',
  duration: '120 min',
  tags: ['Node.js', 'Event Loop', 'NPM', 'Backend'],
  order: 2,
  content: `<p class="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
    Welcome to Lecture 2! In this session, we will dive deep into the core concepts of Node.js, its architecture, modules, the event loop, and how NPM is used for package management. Let's get started!
  </p>
  <div class="my-6">
    <img src="/api/assets/images/nodejs_intro.png" alt="Node.js Intro" class="rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 w-full" />
  </div>
  `,
  sections: [
    {
      heading: '1. Node.js Ka Taaruf (Introduction)',
      order: 1,
      content: `
        <h3 class="text-lg font-semibold mt-4 mb-2">Node.js Kya Hai?</h3>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Yeh ek <strong>open-source</strong> aur <strong>cross-platform</strong> runtime environment hai.</li>
          <li>Iska bunyadi maqsad JavaScript ko browser ki hudood se bahar (server-side par) run karna hai.</li>
          <li>Yeh Google Chrome ke taqatwar <strong>V8 JavaScript Engine</strong> par banaya gaya hai.</li>
        </ul>

        <h3 class="text-lg font-semibold mt-4 mb-2">Hum Node.js Kyun Istemal Karte Hain? (Core Features):</h3>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li><strong>Asynchronous aur Non-blocking:</strong> Node.js ek waqt mein mutadid (multiple) requests ko handle kar sakta hai baghair kisi agli request ka intezar kiye. Is khusoosiyat ki wajah se application ki performance aur scalability bohat behtar ho jati hai.</li>
          <li><strong>Single-Threaded but Highly Scalable:</strong> Node.js sirf ek single thread istemal karta hai. Lekin yeh apne event-driven architecture ki badolat hazaron requests ko ba-asani manage kar leta hai.</li>
          <li><strong>Fast Performance (Taiz Raftar):</strong> Kyunke yeh V8 engine istemal karta hai, yeh JavaScript ko seedha machine code mein tabdeel (convert) kar deta hai, jis se execution bohat fast hoti hai.</li>
          <li><strong>Cross-platform:</strong> Yeh Windows, Linux, aur macOS sab par baghair kisi masle ke chalta hai.</li>
        </ul>

        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg my-4 border border-blue-200 dark:border-blue-800">
          <h4 class="font-bold text-blue-700 dark:text-blue-300">Real-life Misaal:</h4>
          <p class="mt-2 text-sm text-blue-900 dark:text-blue-100">Aap ek restaurant ke waiter ke baaray mein sochein.</p>
          <ul class="list-disc pl-5 mt-2 text-sm text-blue-900 dark:text-blue-100">
            <li><strong>Traditional (blocking) tareeqa:</strong> Waiter ek table se order leta hai, aur tab tak wahi khara rehta hai jab tak khana serve na ho jaye, aur phir agla order leta hai.</li>
            <li><strong>Node.js (non-blocking) tareeqa:</strong> Waiter mukhtalif tables se kai order leta hai aur jese jese khana tayar hota hai, unhe bari bari serve karta jata hai.</li>
          </ul>
        </div>

        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg my-4 border border-purple-200 dark:border-purple-800">
          <h4 class="font-bold text-purple-700 dark:text-purple-300">Student Activity - Think-Pair-Share:</h4>
          <ul class="list-decimal pl-5 mt-2 text-sm text-purple-900 dark:text-purple-100">
            <li>Node.js chat applications banane ke liye itna munasib kyun hai?</li>
            <li>Kya Node.js PHP ya Java ki mukammal jagah le sakta hai? Kyun ya kyun nahi?</li>
          </ul>
        </div>
      `
    },
    {
      heading: '2. Node.js Architectures aur Modules',
      order: 2,
      content: `
        <h3 class="text-lg font-semibold mt-4 mb-2">Node.js Architecture ka Khulasa (Overview):</h3>
        <p class="mb-4">Node.js ka bunyadi dhancha (structure) in usoolon par chalta hai:</p>
        <ul class="list-disc pl-5 space-y-1 mb-4">
          <li>Event-driven</li>
          <li>Non-blocking I/O</li>
          <li>Client-Server architecture</li>
        </ul>
        <p class="mb-4"><strong>Architecture ka Flow (Kaam ka Tareeqa):</strong> Sab se pehle, Client ek request bhejta hai. Yeh request Event Queue ke andar jati hai. Phir Event Loop us request ko process karta hai. Agar koi lamba ya heavy task ho, toh background threads use handle karte hain. Akhir mein, tayar shuda response wapas client ko bhej diya jata hai.</p>

        <h3 class="text-lg font-semibold mt-4 mb-2">Modules Kya Hote Hain?</h3>
        <p class="mb-4">Node.js mein Modules asal mein code ke reusable (dobara istemal ke qabil) blocks hote hain. Node.js mein banne wali har file ko ek module hi samjha jata hai.</p>

        <h3 class="text-lg font-semibold mt-4 mb-2">Modules ki Iqsaam (Types of Modules):</h3>
        <ul class="list-disc pl-5 space-y-4 mb-4">
          <li><strong>Core Modules:</strong> Yeh built-in modules hote hain jo Node.js khud faraham karta hai. Examples: <code>fs</code> (File System), <code>http</code>, <code>path</code>.<br/><em>Conceptual Example:</em> <code>fs</code> module files ko read/write karne ke liye istemal hota hai, jabke <code>http</code> module ko hum web servers banane ke liye istemal karte hain.</li>
          <li><strong>Local Modules:</strong> Yeh modules developers apne code ko munasib andaz mein organize karne ke liye khud banate hain.<br/><em>Real-life Misaal:</em> Yeh bilkul aese hai jese ek kitaab ke chapters hote hain - har chapter ek khas topic ko handle kar raha hota hai.</li>
          <li><strong>Third-Party Modules:</strong> Yeh external packages hote hain jinhe NPM ke zariye install kiya jata hai. Examples: <code>express</code>, <code>mongoose</code>.</li>
        </ul>

        <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg my-4 border border-indigo-200 dark:border-indigo-800">
          <h4 class="font-bold text-indigo-700 dark:text-indigo-300">Student Quiz - MCQs Class Discussion:</h4>
          <ul class="list-decimal pl-5 mt-2 text-sm text-indigo-900 dark:text-indigo-100">
            <li>Har Node.js file ko kis taur par treat kiya jata hai? (Jawab: Module)</li>
            <li>Konsa module server banane ke liye istemal hota hai? (Jawab: http)</li>
            <li>Kya Core modules ko alag se install karne ki zaroorat hoti hai? (Yes / No)</li>
          </ul>
        </div>
      `
    },
    {
      heading: '3. Node.js Architecture: Event Loop, Callbacks & Event Emitters',
      order: 3,
      content: `
        <div class="my-6">
          <img src="/api/assets/images/nodejs_event_loop.png" alt="Event Loop Diagram" class="rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 w-full" />
        </div>
        <h3 class="text-lg font-semibold mt-4 mb-2">Event Loop:</h3>
        <p class="mb-4">Event Loop ko Node.js ka Dil (Heart) kaha jata hai. Yeh tamam asynchronous operations ko ba-asani handle karta hai. Yeh musalsal 3 cheezon ko check karta rehta hai: Call stack, Event queue, aur Callback queue.</p>
        <p class="mb-4"><strong>Asan Alfaz Mein:</strong> Event Loop bilkul ek traffic police officer ki tarah hai jo yeh decide karta hai ke ab kis request ko aage guzarne ki ijazat deni hai.</p>

        <h3 class="text-lg font-semibold mt-4 mb-2">Callbacks:</h3>
        <p class="mb-4">Callback asal mein ek function hota hai jo kisi doosre function mein as an argument (parameter) pass kiya jata hai. Yeh function hamesha tab execute hota hai jab koi khas task mukammal (complete) ho jata hai.</p>
        <p class="mb-4"><em>Real-life Misaal:</em> Aap order dete hain -> Waiter ko bulate hain -> Jab khana tayar ho jata hai toh waiter wapas aapko bulata hai (yeh callback hai).</p>

        <h3 class="text-lg font-semibold mt-4 mb-2">Event Emitters:</h3>
        <p class="mb-4">Yeh events ko emit (create/paida karne) aur unko listen (sunne) ke liye istemal kiye jate hain. Inka bunyadi structure Observer pattern par mabni hota hai.</p>
        <p class="mb-4"><strong>Kahan Istemal Hote Hain?</strong> File upload ka mukammal hona, kisi button ka click hona, ya kisi network request ka aana.</p>

        <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <h4 class="font-bold">Inka Aapas Mein Rishta (Relation Between Them):</h4>
          <p class="mt-2 text-sm">Event Loop hamesha callbacks ko manage karta hai. Event Emitters kisi khas event ko trigger karte hain. Aur Callbacks in events ki response ko handle karte hain.</p>
        </div>

        <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg my-4 border border-amber-200 dark:border-amber-800">
          <h4 class="font-bold text-amber-700 dark:text-amber-300">Student Activity - Scenario-Based Discussion:</h4>
          <p class="mt-2 text-sm text-amber-900 dark:text-amber-100">Agar 1000 users ek hi waqt mein koi file download kar rahe hon, toh Node.js is load ko kese sambhale ga? Aur is sab mein Event Loop sab se zyada kahan madadgar sabit hoga?</p>
        </div>
      `
    },
    {
      heading: '4. NPM Repository aur Commands',
      order: 4,
      content: `
        <h3 class="text-lg font-semibold mt-4 mb-2">NPM Kya Hai?</h3>
        <p class="mb-4">NPM ka full form hai <strong>Node Package Manager</strong>. Yeh duniya ki sab se bari software registry hai. Isko mukhtalif libraries install karne aur project ki dependencies (zaroori packages) ko manage karne ke liye istemal kiya jata hai.</p>

        <h3 class="text-lg font-semibold mt-4 mb-2">NPM Repository:</h3>
        <p class="mb-4">Yeh Node.js packages ka ek bohat bada online database hai. Isme mojood kuch ahem packages yeh hain: <code>express</code>, <code>nodemon</code>, <code>lodash</code>.</p>

        <h3 class="text-lg font-semibold mt-4 mb-2">Aam Istemal Hone Wali NPM Commands:</h3>
        <div class="overflow-x-auto my-4">
          <table class="w-full text-sm text-left border-collapse">
            <thead class="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th class="px-4 py-2 border border-slate-300 dark:border-slate-700">Command</th>
                <th class="px-4 py-2 border border-slate-300 dark:border-slate-700">Maqsad (Purpose)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="px-4 py-2 border border-slate-300 dark:border-slate-700"><code>npm init</code></td><td class="px-4 py-2 border border-slate-300 dark:border-slate-700">Naya project create karne ke liye</td></tr>
              <tr><td class="px-4 py-2 border border-slate-300 dark:border-slate-700"><code>npm install</code></td><td class="px-4 py-2 border border-slate-300 dark:border-slate-700">Project ki zaroori package install karne ke liye</td></tr>
              <tr><td class="px-4 py-2 border border-slate-300 dark:border-slate-700"><code>npm install package-name</code></td><td class="px-4 py-2 border border-slate-300 dark:border-slate-700">Koi khas package install karne ke liye</td></tr>
              <tr><td class="px-4 py-2 border border-slate-300 dark:border-slate-700"><code>npm uninstall</code></td><td class="px-4 py-2 border border-slate-300 dark:border-slate-700">Kisi package ko remove (khatam) karne ke liye</td></tr>
              <tr><td class="px-4 py-2 border border-slate-300 dark:border-slate-700"><code>npm -v</code></td><td class="px-4 py-2 border border-slate-300 dark:border-slate-700">NPM ka current version check karne ke liye</td></tr>
            </tbody>
          </table>
        </div>

        <h3 class="text-lg font-semibold mt-4 mb-2">package.json file:</h3>
        <p class="mb-4">Yeh aapke project ki sab se ahem configuration file hoti hai. Is file mein project ka naam, zaroori dependencies, aur scripts ki maloomat mehfooz hoti hai.<br/>
        <em>Real-life Misaal:</em> <code>package.json</code> bilkul ek shopping list ki tarah hai, jis mein likha hota hai ke aapke project ko sahi se chalne ke liye kin kin cheezon (packages) ki zaroorat hai.</p>

        <div class="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg my-4 border border-rose-200 dark:border-rose-800">
          <h4 class="font-bold text-rose-700 dark:text-rose-300">Final Activity (Wrap-Up) - Quick Oral Quiz:</h4>
          <ul class="list-decimal pl-5 mt-2 text-sm text-rose-900 dark:text-rose-100">
            <li>Node.js ko non-blocking kyun kaha jata hai?</li>
            <li>Core aur Third-party modules ke darmiyan kya bunyadi farq hai?</li>
            <li>Node.js project mein NPM ka kya role (kirdar) hota hai?</li>
          </ul>
        </div>
        
        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg my-6 border border-green-200 dark:border-green-800">
          <h4 class="font-bold text-green-800 dark:text-green-300">Lecture Summary (Khulasa)</h4>
          <p class="mt-2 text-sm text-green-900 dark:text-green-100">Node.js nihayat tez, scalable, aur event-driven hai. Yeh apne tamam asynchronous kamo ke liye Event Loop par inhesar (rely) karta hai. Isme mojood Modules code ko behtar tarike se organize karne mein madad dete hain. NPM project ki tamam dependencies ko bohat moassar (efficient) andaz mein manage karta hai.</p>
        </div>
      `
    }
  ]
};

async function seed() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    // Check if Lecture 2 already exists
    const existing = await Lecture.findOne({ title: lectureData.title });
    if (existing) {
      console.log('Lecture 2 already exists, updating...');
      await Lecture.findOneAndUpdate({ title: lectureData.title }, lectureData);
    } else {
      console.log('Inserting Lecture 2...');
      const lecture = new Lecture(lectureData);
      await lecture.save();
    }
    
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
}

seed();
