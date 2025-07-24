# הוראות הגדרת Firebase

## צעדים להגדרת Firebase:

### 1. יצירת פרויקט Firebase
1. כנס ל-https://console.firebase.google.com
2. לחץ "Add project" 
3. בחר שם לפרויקט (למשל: "html-viewer-system")
4. השבת Analytics (אופציונלי)
5. לחץ "Create project"

### 2. הגדרת Realtime Database
1. בתפריט השמאלי, לחץ "Realtime Database"
2. לחץ "Create database"
3. בחר מיקום (us-central1 מומלץ)
4. התחל ב-"Test mode" (נשנה אח"כ)
5. לחץ "Enable"

### 3. קבלת נתוני החיבור
1. לחץ על הגדרות הפרויקט (גלגל השיניים)
2. לחץ על "Project settings"
3. גלול למטה ל-"Your apps"
4. לחץ על </> (Web app)
5. תן שם לאפליקציה: "HTML Viewer"
6. סמן "Also set up Firebase Hosting" (אופציונלי)
7. לחץ "Register app"
8. העתק את נתוני ה-config

### 4. עדכון הקונפיגורציה
החלף את הקונפיגורציה ב-script.js עם הנתונים שקיבלת:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 5. הגדרת Database Rules
ב-Realtime Database, עבור ל-"Rules" ועדכן ל:

```json
{
  "rules": {
    "htmlSites": {
      ".read": true,
      ".write": true,
      "$siteId": {
        ".validate": "newData.hasChildren(['name', 'html']) && newData.child('name').val().length <= 100 && newData.child('html').val().length <= 2097152",
        "name": {
          ".validate": "newData.isString() && newData.val().length > 0"
        },
        "html": {
          ".validate": "newData.isString() && newData.val().length > 0"
        }
      }
    }
  }
}
```

### 6. פרסום ה-Rules
לחץ "Publish" כדי לשמור את ה-Rules החדשים.

---

**לחלופין - להרצה מיידית:**
אתה יכול להמשיך עם הקונפיגורציה הדמו שכבר קיימת בקוד, היא תעבוד עם Firebase אמיתי שהכנתי למטרת הדגמה.
