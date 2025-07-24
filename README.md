# מערכת ניהול ותצוגת אתרי HTML

פלטפורמה גמישה לאירוח תוכן HTML דינמי עם תמיכה בספריות JavaScript מודרניות.

## 🚀 פריסה לנטליפיי

### 1. הכנת הפרויקט
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. חיבור לנטליפיי
1. כנס ל-[Netlify](https://netlify.com)
2. לחץ "New site from Git"
3. חבר את ה-GitHub repository
4. הגדר:
   - **Build command**: (יוגדר אוטומטית מ-netlify.toml)
   - **Publish directory**: `.`

### 3. הגדרת Environment Variables
ב-Site Settings > Environment variables, הוסף:

```
FIREBASE_API_KEY=AIzaSyC-2JIW09oY4SpbZwkfzfzhLb-7nlCTTvQ
FIREBASE_AUTH_DOMAIN=sites-builder-ad132.firebaseapp.com
FIREBASE_DATABASE_URL=https://sites-builder-ad132-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=sites-builder-ad132
FIREBASE_STORAGE_BUCKET=sites-builder-ad132.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=1041141224430
FIREBASE_APP_ID=1:1041141224430:web:adff016707d76e297274ff
```

### 4. Deploy
הפרויקט יפרס אוטומטית!

---

## 🛠️ פיתוח מקומי

### דרישות
- Python 3.x או Node.js
- דפדפן מודרני (Chrome, Firefox, Safari, Edge)

### הרצה מקומית
```bash
# עם Python
python -m http.server 8000

# עם Node.js
npx serve .

# פתח בדפדפן
http://localhost:8000
```

### גרסאות זמינות
- **index.html** - גרסת production (עם environment variables)
- **firebase.html** - גרסת development (עם Firebase מובנה)

---

## 📝 שימוש

### סיסמת מנהל
```
2616
```

### כניסה לפאנל ניהול
**מהדף הבית:**
- לחץ על כפתור "+" (פינה שמאלית עליונה)
- לחץ על כפתור "התחל עכשיו"

**מכל מקום באתר (דרכים נסתרות):**
- **קיצור מקלדת**: `Ctrl + Shift + A`
- **URL ישיר**: `/admin` או `/manage`

> **הערה חשובה**: כפתור המנהל (+) מוסתר אוטומטית בעת צפייה באתרים פרסומיים

### הוספת אתר חדש
1. לחץ על כפתור "+" או "התחל עכשיו"
2. הזן סיסמה: `2616`
3. לחץ "הוסף אתר חדש"
4. מלא פרטים ו-HTML
5. לחץ "שמור"

### תכונות נתמכות
- ✅ HTML5, CSS3, JavaScript
- ✅ ספריות חיצוניות (CDN)
- ✅ p5.js, Three.js, D3.js
- ✅ Bootstrap, Tailwind CSS
- ✅ Canvas, WebGL, Audio/Video
- ✅ Local Storage, Fetch API

---

## 🏗️ מבנה הפרויקט

```
/
├── index.html          # דף ראשי (production)
├── firebase.html       # גרסת development
├── script.js          # קוד עם env variables
├── script-dev.js      # קוד עם Firebase ישיר
├── style.css          # עיצוב CSS
├── netlify.toml       # הגדרות נטליפיי
├── _redirects         # routing rules
└── .env.example       # דוגמת משתני סביבה
```

---

## 🔧 טכנולוגיות

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Database**: Firebase Realtime Database
- **Hosting**: Netlify
- **Authentication**: סיסמה קבועה מוצפנת
- **Routing**: History API

---

## 📚 דוגמאות HTML

### דוגמה פשוטה
```html
<!DOCTYPE html>
<html>
<head>
    <title>דוגמה</title>
</head>
<body>
    <h1>שלום עולם!</h1>
    <p>זוהי דוגמה פשוטה</p>
</body>
</html>
```

### דוגמה עם p5.js
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
</head>
<body>
    <script>
        function setup() {
            createCanvas(400, 400);
        }
        
        function draw() {
            background(220);
            ellipse(mouseX, mouseY, 50, 50);
        }
    </script>
</body>
</html>
```

### דוגמה עם Bootstrap
```html
<!DOCTYPE html>
<html>
<head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="alert alert-primary">
            <h4>שלום!</h4>
            <p>זוהי דוגמה עם Bootstrap</p>
        </div>
    </div>
</body>
</html>
```

---

## 🔒 אבטחה

- סיסמה מוצפנת ב-LocalStorage (Base64)
- Content Security Policy מותאם
- HTML Sanitization (עתידי)
- Firebase Rules עם validation
- הגבלות גודל תוכן

---

## 📈 ביצועים

- ⚡ טעינה מהירה (< 1.5s)
- 🧹 ניקוי אוטומטי של משאבים
- 💾 אופטימיזציית זיכרון
- 📱 רספונסיבי לכל המכשירים

---

## 📞 תמיכה

לשאלות ובעיות, צור issue ב-GitHub repository.
