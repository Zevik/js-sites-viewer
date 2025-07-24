// Firebase imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    onValue, 
    remove, 
    child,
    push 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Firebase Configuration - יוחלפו בזמן BUILD באמצעות Environment Variables
const firebaseConfig = {
    apiKey: "__FIREBASE_API_KEY__",
    authDomain: "__FIREBASE_AUTH_DOMAIN__",
    databaseURL: "__FIREBASE_DATABASE_URL__",
    projectId: "__FIREBASE_PROJECT_ID__",
    storageBucket: "__FIREBASE_STORAGE_BUCKET__",
    messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
    appId: "__FIREBASE_APP_ID__"
};

// בדיקת תקינות הגדרות Firebase
function isFirebaseConfigValid(config) {
    return config && 
           typeof config.databaseURL === 'string' && 
           config.databaseURL.startsWith('https://') && 
           !config.databaseURL.includes('__') &&  // וידוא שלא נשארו placeholders
           !config.apiKey.includes('__');
}

let app, database;
if (!isFirebaseConfigValid(firebaseConfig)) {
    document.addEventListener('DOMContentLoaded', function() {
        console.error('Firebase configuration invalid or missing');
        alert('שגיאת מערכת: הגדרות Firebase חסרות או לא תקינות. יש להגדיר את משתני הסביבה לפני השימוש באתר.');
        document.body.innerHTML = `
            <div style="color: red; font-size: 1.5em; text-align: center; margin-top: 50px; padding: 20px;">
                🚨 שגיאת מערכת<br><br>
                הגדרות Firebase חסרות או לא תקינות.<br>
                יש להגדיר את משתני הסביבה בנטליפיי לפני השימוש באתר.
                <br><br>
                <small>Environment variables need to be configured in Netlify</small>
            </div>
        `;
    });
} else {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
}

// קבועים ומשתנים גלובליים
const ADMIN_PASSWORD = "__ADMIN_PASSWORD__"; // יוחלף בזמן BUILD
let currentEditingKey = null;
let cleanupFunction = null;

// אתחול האפליקציה
document.addEventListener('DOMContentLoaded', function() {
    console.log('HTML Viewer System - Starting with secure configuration...');

    // וידוא שהסיסמה הוחלפה
    if (ADMIN_PASSWORD.includes('__')) {
        console.error('Admin password not configured');
        alert('שגיאת אבטחה: סיסמת מנהל לא הוגדרה. פנה למנהל המערכת.');
        return;
    }

    // קביעת event listeners
    setupEventListeners();

    // טעינת הדף הראשוני - ללא הבהוב!
    loadInitialPage();

    // בדיקת סיסמה שמורה
    checkSavedPassword();

    console.log('System initialized successfully with secure configuration');
});

// טעינה ראשונית נכונה - ללא הבהוב דף הבית
function loadInitialPage() {
    const path = window.location.pathname;
    const siteKey = path.substring(1);
    
    if (path === '/' || path === '/index.html' || !siteKey) {
        // רק עכשיו נציג את דף הבית
        showHomepage();
    } else if (path === '/admin' || path === '/manage') {
        // נתיב נסתר לכניסה למנהל
        showHomepage(); // הציג דף הבית קודם
        setTimeout(() => {
            openAdminAccess();
            history.replaceState(null, '', '/');
        }, 100);
    } else {
        // נתיב אתר ספציפי - טען ישירות ללא הצגת דף הבית
        showLoadingState();
        loadSiteFromKey(siteKey);
    }
}

// הצגת מצב טעינה במקום דף הבית
function showLoadingState() {
    document.getElementById('homepage').classList.add('hidden');
    document.getElementById('siteView').classList.remove('hidden');
    
    document.getElementById('siteView').innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
            <div style="font-size: 2em; margin-bottom: 20px;">⏳</div>
            <div style="font-size: 1.2em; color: #666;">טוען תוכן...</div>
        </div>
    `;
}

// הגדרת event listeners
function setupEventListeners() {
    // כפתור התחל עכשיו
    document.getElementById('startButton').addEventListener('click', handleHomepageLogin);
    
    // קיצור מקלדת נסתר לכניסה למנהל (Ctrl + Shift + A)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            openAdminAccess();
        }
    });
    
    // כניסה עם Enter בשדה הסיסמה בדף הבית
    const homepagePasswordInput = document.getElementById('homepagePasswordInput');
    if (homepagePasswordInput) {
        homepagePasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleHomepageLogin();
            }
        });
    }
    
    // מודל אימות
    document.getElementById('accessForm').addEventListener('submit', function(e) {
        e.preventDefault();
        authenticate();
    });
    document.getElementById('submitCodeButton').addEventListener('click', authenticate);
    document.getElementById('accessCodeInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            authenticate();
        }
    });
    document.getElementById('accessCodeInput').addEventListener('input', clearErrorMessage);
    
    // פאנל ניהול
    document.getElementById('closePanelButton').addEventListener('click', closeAdminPanel);
    document.getElementById('logoutButton').addEventListener('click', logout);
    document.getElementById('addSiteButton').addEventListener('click', showAddSiteForm);
    document.getElementById('backToListButton').addEventListener('click', showSitesList);
    
    // טופס עריכה
    document.getElementById('siteForm').addEventListener('submit', saveSite);
    document.getElementById('previewButton').addEventListener('click', previewSite);
    
    // ניווט עם History API
    window.addEventListener('popstate', loadPageFromPath);
    
    // סגירת מודלים בלחיצה על הרקע
    document.getElementById('accessModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAccessModal();
        }
    });
    
    document.getElementById('adminPanel').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAdminPanel();
        }
    });
}

// פונקציות אימות
function checkSavedPassword() {
    try {
        const savedPassword = localStorage.getItem('admin_access_code');
        if (savedPassword) {
            const decodedPassword = atob(savedPassword);
            if (decodedPassword === ADMIN_PASSWORD) {
                console.log('Valid saved password found');
                return true;
            } else {
                localStorage.removeItem('admin_access_code');
                console.log('Invalid saved password removed');
            }
        }
    } catch (error) {
        console.error('Error checking saved password:', error);
        localStorage.removeItem('admin_access_code');
    }
    return false;
}

function handleHomepageLogin() {
    const passwordInput = document.getElementById('homepagePasswordInput');
    const password = passwordInput ? passwordInput.value.trim() : '';
    
    if (password) {
        // בדיקת סיסמה
        if (password === ADMIN_PASSWORD) {
            // סיסמה נכונה - שמור ב-localStorage ופתח פאנל
            localStorage.setItem('admin_access_code', btoa(password));
            openAdminPanel();
            console.log('Authentication successful from homepage');
        } else {
            // סיסמה שגויה
            alert('סיסמה שגויה');
            passwordInput.value = '';
            passwordInput.focus();
        }
    } else {
        // אם אין סיסמה בשדה, בדוק אם יש סיסמה שמורה
        if (checkSavedPassword()) {
            openAdminPanel();
        } else {
            alert('נא להזין סיסמה');
            passwordInput.focus();
        }
    }
}

function openAdminAccess() {
    if (checkSavedPassword()) {
        openAdminPanel();
    } else {
        showAccessModal();
    }
}

function showAccessModal() {
    document.getElementById('accessModal').classList.remove('hidden');
    const input = document.getElementById('accessCodeInput');
    input.value = '';
    input.focus();
    clearErrorMessage();
}

function closeAccessModal() {
    document.getElementById('accessModal').classList.add('hidden');
}

function authenticate() {
    const password = document.getElementById('accessCodeInput').value;
    if (password === ADMIN_PASSWORD) {
        // סיסמה נכונה - שמור ב-localStorage
        localStorage.setItem('admin_access_code', btoa(password));
        closeAccessModal();
        openAdminPanel();
        console.log('Authentication successful');
    } else {
        // סיסמה שגויה
        showError('סיסמה שגויה');
        document.getElementById('accessCodeInput').value = '';
        document.getElementById('accessCodeInput').focus();
    }
}

function logout() {
    localStorage.removeItem('admin_access_code');
    closeAdminPanel();
    console.log('User logged out');
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function clearErrorMessage() {
    document.getElementById('errorMessage').classList.add('hidden');
}

// פונקציות פאנל ניהול
function openAdminPanel() {
    document.getElementById('adminPanel').classList.remove('hidden');
    showSitesList();
    loadSitesList();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').classList.add('hidden');
    showHomepage();
}

function showSitesList() {
    document.getElementById('listView').classList.remove('hidden');
    document.getElementById('editView').classList.add('hidden');
    currentEditingKey = null;
}

function showAddSiteForm() {
    document.getElementById('listView').classList.add('hidden');
    document.getElementById('editView').classList.remove('hidden');
    document.getElementById('editTitle').textContent = 'הוסף אתר חדש';
    
    // נקה את הטופס
    document.getElementById('siteName').value = '';
    document.getElementById('siteSlug').value = '';
    document.getElementById('siteHtml').value = '';
    
    currentEditingKey = null;
    document.getElementById('siteName').focus();
}

function showEditSiteForm(siteKey, siteData) {
    document.getElementById('listView').classList.add('hidden');
    document.getElementById('editView').classList.remove('hidden');
    document.getElementById('editTitle').textContent = 'ערוך אתר';
    
    // מלא את הטופס בנתונים קיימים
    document.getElementById('siteName').value = siteData.name || '';
    document.getElementById('siteSlug').value = siteKey || '';
    document.getElementById('siteHtml').value = siteData.html || '';
    
    currentEditingKey = siteKey;
}

// פונקציות CRUD אמיתיות עם Firebase
async function loadSitesList() {
    const sitesTable = document.getElementById('sitesTable');
    
    try {
        sitesTable.innerHTML = '<div class="loading">טוען נתונים...</div>';
        
        const sitesRef = ref(database, 'htmlSites');
        const snapshot = await get(sitesRef);
        
        if (snapshot.exists()) {
            const sites = snapshot.val();
            renderSitesList(sites);
        } else {
            sitesTable.innerHTML = `
                <div class="empty-state">
                    <h3>אין אתרים שמורים</h3>
                    <p>לחץ על "הוסף אתר חדש" כדי להתחיל</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading sites:', error);
        sitesTable.innerHTML = `
            <div class="error-state">
                <h3>שגיאה בטעינת הנתונים</h3>
                <p>אנא בדוק את החיבור לאינטרנט ונסה שוב</p>
                <button onclick="loadSitesList()" class="btn-primary">נסה שוב</button>
            </div>
        `;
    }
}

function renderSitesList(sites) {
    const sitesTable = document.getElementById('sitesTable');
    
    if (!sites || Object.keys(sites).length === 0) {
        sitesTable.innerHTML = `
            <div class="empty-state">
                <h3>אין אתרים שמורים</h3>
                <p>לחץ על "הוסף אתר חדש" כדי להתחיל</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    Object.entries(sites).forEach(([key, site]) => {
        const siteName = site.name || 'ללא שם';
        const siteUrl = `/${key}`;
        
        html += `
            <div class="site-item">
                <div class="site-info">
                    <h3>${escapeHtml(siteName)}</h3>
                    <a href="${siteUrl}" class="site-url" onclick="viewSite('${key}', event)">${siteUrl}</a>
                </div>
                <div class="site-actions">
                    <button class="btn-small btn-view" onclick="viewSite('${key}', event)">הצג</button>
                    <button class="btn-small btn-edit" onclick="editSite('${key}')">ערוך</button>
                    <button class="btn-small btn-delete" onclick="deleteSite('${key}', '${escapeHtml(siteName)}')">מחק</button>
                </div>
            </div>
        `;
    });
    
    sitesTable.innerHTML = html;
}

async function saveSite(event) {
    event.preventDefault();
    
    const name = document.getElementById('siteName').value.trim();
    let slug = document.getElementById('siteSlug').value.trim();
    const html = document.getElementById('siteHtml').value.trim();
    
    if (!name || !html) {
        alert('נא למלא את כל השדות הנדרשים');
        return;
    }
    
    // יצירת slug אוטומטית אם לא הוזן
    if (!slug) {
        slug = generateSlug(name);
    } else {
        slug = generateSlug(slug);
    }
    
    // בדיקה שה-slug לא קיים (אלא אם זו עריכה)
    if (!currentEditingKey) {
        try {
            const existingRef = ref(database, `htmlSites/${slug}`);
            const existingSnapshot = await get(existingRef);
            
            if (existingSnapshot.exists()) {
                alert('נתיב זה כבר קיים. אנא בחר נתיב אחר.');
                document.getElementById('siteSlug').focus();
                return;
            }
        } catch (error) {
            console.error('Error checking existing slug:', error);
        }
    }
    
    try {
        const saveButton = document.getElementById('saveSiteButton');
        saveButton.disabled = true;
        saveButton.textContent = 'שומר...';
        
        const siteData = {
            name: name,
            html: html,
            created: currentEditingKey ? undefined : new Date().toISOString(),
            modified: new Date().toISOString()
        };
        
        const siteKey = currentEditingKey || slug;
        const siteRef = ref(database, `htmlSites/${siteKey}`);
        
        await set(siteRef, siteData);
        
        alert(currentEditingKey ? 'האתר עודכן בהצלחה!' : 'האתר נשמר בהצלחה!');
        showSitesList();
        loadSitesList();
        
    } catch (error) {
        console.error('Error saving site:', error);
        alert('שגיאה בשמירת האתר. אנא נסה שוב.');
    } finally {
        const saveButton = document.getElementById('saveSiteButton');
        saveButton.disabled = false;
        saveButton.textContent = 'שמור';
    }
}

async function editSite(siteKey) {
    try {
        const siteRef = ref(database, `htmlSites/${siteKey}`);
        const snapshot = await get(siteRef);
        
        if (snapshot.exists()) {
            const siteData = snapshot.val();
            showEditSiteForm(siteKey, siteData);
        } else {
            alert('האתר לא נמצא');
        }
    } catch (error) {
        console.error('Error loading site for edit:', error);
        alert('שגיאה בטעינת האתר לעריכה');
    }
}

async function deleteSite(siteKey, siteName) {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את האתר "${siteName}"?\n\nפעולה זו לא ניתנת לביטול.`)) {
        return;
    }
    
    try {
        const siteRef = ref(database, `htmlSites/${siteKey}`);
        await remove(siteRef);
        
        alert('האתר נמחק בהצלחה');
        loadSitesList();
    } catch (error) {
        console.error('Error deleting site:', error);
        alert('שגיאה במחיקת האתר. אנא נסה שוב.');
    }
}

function viewSite(siteKey, event) {
    if (event) {
        event.preventDefault();
    }
    
    // סגירת הפאנל
    closeAdminPanel();
    
    // ניווט לאתר
    history.pushState({ siteKey }, '', `/${siteKey}`);
    loadSiteFromKey(siteKey);
}

async function loadSiteFromKey(siteKey) {
    try {
        const siteRef = ref(database, `htmlSites/${siteKey}`);
        const snapshot = await get(siteRef);
        
        if (snapshot.exists()) {
            const siteData = snapshot.val();
            renderSiteContent(siteData.html);
            document.title = siteData.name || 'אתר HTML';
        } else {
            show404Page();
        }
    } catch (error) {
        console.error('Error loading site:', error);
        show404Page();
    }
}

// פונקציות ניווט מתקדמות - עם תיקון ההבהוב
function loadPageFromPath() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html') {
        showHomepage();
    } else if (path === '/admin' || path === '/manage') {
        // נתיב נסתר לכניסה למנהל
        openAdminAccess();
        // החזר לדף הבית אחרי הכניסה
        history.replaceState(null, '', '/');
    } else {
        // נתיב אתר ספציפי - ללא הבהוב!
        const siteKey = path.substring(1);
        if (siteKey) {
            showLoadingState(); // הציג loading במקום דף הבית
            loadSiteFromKey(siteKey);
        } else {
            showHomepage();
        }
    }
}

function show404Page() {
    document.getElementById('homepage').classList.add('hidden');
    document.getElementById('siteView').classList.remove('hidden');
    
    document.getElementById('siteView').innerHTML = `
        <div class="error-page">
            <h1>🚫 דף לא נמצא</h1>
            <p>האתר שחיפשת לא קיים במערכת</p>
            <button onclick="showHomepage()" class="btn-primary">חזור לדף הבית</button>
        </div>
    `;
    
    document.title = 'דף לא נמצא - מערכת ניהול אתרי HTML';
}

function renderSiteContent(html) {
    document.getElementById('homepage').classList.add('hidden');
    document.getElementById('siteView').classList.remove('hidden');
    
    // ניקוי קודם
    cleanupPreviousContent();
    
    // הצגת התוכן החדש
    document.getElementById('siteView').innerHTML = html;
    
    // הרצת סקריפטים
    executeScripts();
}

function cleanupPreviousContent() {
    // הרצת פונקציית ניקוי קודמת אם קיימת
    if (cleanupFunction && typeof cleanupFunction === 'function') {
        try {
            cleanupFunction();
        } catch (error) {
            console.error('Error in cleanup function:', error);
        }
        cleanupFunction = null;
    }
    
    // ניקוי p5.js instances
    if (window.p5Instance) {
        try {
            window.p5Instance.remove();
            window.p5Instance = null;
        } catch (error) {
            console.error('Error cleaning p5 instance:', error);
        }
    }
}

function executeScripts() {
    const scripts = document.getElementById('siteView').querySelectorAll('script');
    
    scripts.forEach(script => {
        try {
            if (script.src) {
                // סקריפט חיצוני
                const newScript = document.createElement('script');
                newScript.src = script.src;
                newScript.async = false;
                document.head.appendChild(newScript);
            } else {
                // סקריפט פנימי
                const newScript = document.createElement('script');
                newScript.textContent = script.textContent;
                document.body.appendChild(newScript);
            }
        } catch (error) {
            console.error('Error executing script:', error);
        }
    });
}

function showHomepage() {
    document.getElementById('homepage').classList.remove('hidden');
    document.getElementById('siteView').classList.add('hidden');

    // עדכון URL רק אם צריך
    if (window.location.pathname !== '/') {
        history.pushState(null, '', '/');
    }

    // עדכון כותרת
    document.title = 'מערכת ניהול אתרי HTML';

    // ניקוי תוכן קודם
    cleanupPreviousContent();
}

// פונקציות עזר נוספות
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0590-\u05FF\-]/g, '')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '');
}

async function previewSite() {
    const html = document.getElementById('siteHtml').value.trim();
    
    if (!html) {
        alert('נא להזין קוד HTML תחילה');
        return;
    }
    
    // פתח חלון תצוגה מקדימה
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (previewWindow) {
        previewWindow.document.open();
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>תצוגה מקדימה</title>
                <style>
                    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                    .preview-header { 
                        background: #f0f0f0; 
                        padding: 10px; 
                        margin: -20px -20px 20px -20px; 
                        border-bottom: 1px solid #ddd;
                        text-align: center;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="preview-header">תצוגה מקדימה</div>
                ${html}
            </body>
            </html>
        `);
        previewWindow.document.close();
    } else {
        alert('לא ניתן לפתוח חלון תצוגה מקדימה. אנא בדוק שחוסם החלונות מושבת.');
    }
}

// הוספת פונקציות גלובליות לכפתורים
window.editSite = editSite;
window.deleteSite = deleteSite;
window.viewSite = viewSite;
window.loadSitesList = loadSitesList;
window.showHomepage = showHomepage;

// התחלה
console.log('HTML Viewer System - Script loaded with SECURE Firebase configuration and NO HOMEPAGE FLICKER');
