const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
// تقديم الملفات الثابتة من الجذر (index.html، المجلد fils، إلخ)
app.use(express.static('.'));

// تعريف مجلد الملفات النصية
const FILS_DIR = path.join(__dirname, 'fils');

// نقطة النهاية: GET /api/files
// تُرجع قائمة الملفات النصية الموجودة في مجلد "fils" مرتبة تنازلياً
app.get('/api/files', (req, res) => {
  fs.readdir(FILS_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'تعذر قراءة الملفات' });
    }
    // تصفية الملفات التي تنتهي بـ .txt ثم فرزها تنازلياً بناءً على الرقم داخل اسم الملف
    let txtFiles = files.filter(file => file.endsWith('.txt'));
    txtFiles.sort((a, b) => {
      let matchA = a.match(/(\d+)/);
      let matchB = b.match(/(\d+)/);
      let numA = matchA ? parseInt(matchA[1]) : 0;
      let numB = matchB ? parseInt(matchB[1]) : 0;
      return numB - numA;
    });
    res.json(txtFiles);
  });
});

// نقطة النهاية: GET /api/file?name=<filename>
// تُرجع محتوى الملف المطلوب كنص
app.get('/api/file', (req, res) => {
  let filename = req.query.name;
  if (!filename) return res.status(400).send('معامل اسم الملف مطلوب');
  let filePath = path.join(FILS_DIR, filename);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('تعذر قراءة الملف');
    }
    res.send(data);
  });
});

// نقطة النهاية: POST /api/upload
// تستقبل JSON يحتوي على { filename, content } وتقوم بكتابة الملف إلى مجلد fils
app.post('/api/upload', (req, res) => {
  let { filename, content } = req.body;
  if (!filename || !content) return res.status(400).json({ error: 'مطلوب اسم الملف والمحتوى' });
  let filePath = path.join(FILS_DIR, filename);
  fs.writeFile(filePath, content, 'utf8', (err) => {
    if (err) return res.status(500).json({ error: 'تعذر كتابة الملف' });
    res.json({ message: 'تم رفع الملف بنجاح' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("الخادم يعمل على المنفذ " + PORT));
