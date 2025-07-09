// שלב 1: ייבוא הפונקציות הנדרשות מ-Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, remove, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// שלב 2: הגדרות Firebase עם משתני Placeholder
// המפתחות האמיתיים יוחלפו כאן על ידי נטליפיי בזמן הבנייה
const firebaseConfig = {
    apiKey: "__FIREBASE_API_KEY__",
    authDomain: "__FIREBASE_AUTH_DOMAIN__",
    databaseURL: "__FIREBASE_DATABASE_URL__",
    projectId: "__FIREBASE_PROJECT_ID__",
    storageBucket: "__FIREBASE_STORAGE_BUCKET__",
    messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
    appId: "__FIREBASE_APP_ID__",
    measurementId: "__FIREBASE_MEASUREMENT_ID__"
};

// אתחול Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// הגדרות האפליקציה
const sitesRef = ref(db, 'htmlSites');
const ACCESS_CODE = "2616";

// קוד האפליקציה יפעל רק לאחר שה-DOM נטען במלואו
document.addEventListener('DOMContentLoaded', () => {

    // קבלת כל האלמנטים מה-DOM
    const displayContainer = document.getElementById('display-container');
    const adminButton = document.getElementById('admin-button');
    const accessPrompt = document.getElementById('access-prompt');
    const accessCodeInput = document.getElementById('access-code-input');
    const submitCodeButton = document.getElementById('submit-code-button');
    const errorMessage = document.getElementById('error-message');
    const adminPanel = document.getElementById('admin-panel');
    const closePanelButton = document.getElementById('close-panel-button');
    const listView = document.getElementById('list-view');
    const editorView = document.getElementById('editor-view');
    const sitesListBody = document.getElementById('sites-list-body');
    const showAddNewButton = document.getElementById('show-add-new-button');
    const editorTitle = document.getElementById('editor-title');
    const siteNameInput = document.getElementById('site-name-input');
    const siteSlugInput = document.getElementById('site-slug-input');
    const siteCodeInput = document.getElementById('site-code-input');
    const saveSiteButton = document.getElementById('save-site-button');
    const runSiteButton = document.getElementById('run-site-button');
    const backToListButton = document.getElementById('back-to-list-button');

    let currentEditingKey = null;

    // פונקציות עזר
    const renderHtml = (htmlContent) => {
        // Extract base URL from the HTML content if it exists
        const baseMatch = htmlContent.match(/<base[^>]*href=["']([^"']+)["'][^>]*>/i);
        const existingBaseUrl = baseMatch ? baseMatch[1] : null;

        // Create a temporary container to parse the HTML
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = htmlContent;

        // Handle base URL
        let baseUrl = existingBaseUrl;
        if (!baseUrl) {
            // Try to find the first external resource and extract its base URL
            const firstResource = tempContainer.querySelector('img[src^="http"], script[src^="http"], link[href^="http"]');
            if (firstResource) {
                const url = new URL(firstResource.src || firstResource.href);
                baseUrl = url.origin + url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1);
            }
        }

        // If we found a base URL, add or update the base tag
        if (baseUrl && !baseMatch) {
            const baseTag = document.createElement('base');
            baseTag.href = baseUrl;
            document.head.appendChild(baseTag);
        }

        // Update the display container
        displayContainer.innerHTML = htmlContent;

        // Handle scripts
        const scripts = displayContainer.getElementsByTagName('script');
        Array.from(scripts).forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });

        // Clean up base tag when navigating away
        return () => {
            const baseTag = document.querySelector('base');
            if (baseTag) {
                baseTag.remove();
            }
        };
    };

    const hideAllPanels = () => {
        accessPrompt.style.display = 'none';
        adminPanel.style.display = 'none';
    };

    const generateSlug = (text) => text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0590-\u05FF\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

    const showEditorView = (isEditing = false) => {
        listView.style.display = 'none';
        editorView.style.display = 'flex';
        editorTitle.textContent = isEditing ? 'עריכת אתר' : 'הוספת אתר חדש';
    };

    const showListView = () => {
        listView.style.display = 'block';
        editorView.style.display = 'none';
        currentEditingKey = null;
        siteNameInput.value = '';
        siteSlugInput.value = '';
        siteCodeInput.value = '';
    };

    const loadPageFromPath = () => {
        const path = window.location.pathname;
        const pageKey = path.substring(1);
        
        // Show/hide admin button based on path
        adminButton.style.display = pageKey ? 'none' : 'block';
        
        // Clean up any existing base tag
        const existingBase = document.querySelector('base');
        if (existingBase) {
            existingBase.remove();
        }

        if (pageKey) {
            get(child(sitesRef, pageKey)).then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    renderHtml(data.html);
                    document.title = data.name || pageKey;
                } else {
                    displayContainer.innerHTML = `<h1>דף לא נמצא: ${pageKey}</h1>`;
                }
            });
        } else {
            displayContainer.innerHTML = '<h1>ברוכים הבאים!</h1>';
        }
    };

    loadPageFromPath();
    window.addEventListener('popstate', loadPageFromPath);

    adminButton.addEventListener('click', () => {
        accessPrompt.style.display = 'flex';
        accessCodeInput.value = '';
        accessCodeInput.focus();
    });

    submitCodeButton.addEventListener('click', () => {
        if (accessCodeInput.value === ACCESS_CODE) {
            hideAllPanels();
            adminPanel.style.display = 'flex';
            showListView();
        } else {
            errorMessage.style.display = 'block';
        }
    });

    closePanelButton.addEventListener('click', hideAllPanels);

    onValue(sitesRef, (snapshot) => {
        sitesListBody.innerHTML = '';
        const data = snapshot.val();
        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${value.name || 'ללא שם'}</td><td><a href="/${key}" target="_blank">/${key}</a></td><td class="item-actions"><button class="view-btn">הצג</button><button class="edit-btn">ערוך</button><button class="delete-btn delete-button">מחק</button></td>`;
                tr.querySelector('.view-btn')?.addEventListener('click', () => { renderHtml(value.html); history.pushState(null, value.name, `/${key}`); hideAllPanels(); });
                tr.querySelector('.edit-btn')?.addEventListener('click', () => { currentEditingKey = key; siteNameInput.value = value.name; siteSlugInput.value = key; siteCodeInput.value = value.html; showEditorView(true); });
                tr.querySelector('.delete-btn')?.addEventListener('click', () => { if (confirm(`האם למחוק את האתר "${value.name}"?`)) remove(ref(db, `htmlSites/${key}`)); });
                sitesListBody.appendChild(tr);
            });
        } else {
            sitesListBody.innerHTML = '<tr><td colspan="3">לא נמצאו אתרים שמורים.</td></tr>';
        }
    });

    showAddNewButton.addEventListener('click', () => showEditorView(false));
    backToListButton.addEventListener('click', showListView);
    runSiteButton.addEventListener('click', () => { renderHtml(siteCodeInput.value); hideAllPanels(); });

    saveSiteButton.addEventListener('click', async () => {
        const name = siteNameInput.value.trim();
        const code = siteCodeInput.value;
        let slug = siteSlugInput.value.trim();
        if (!name) { alert("חובה למלא שם לאתר."); return; }
        if (!slug) { slug = generateSlug(name); } else { slug = generateSlug(slug); }
        if (!slug) { alert("לא ניתן היה ליצור נתיב URL."); return; }

        const siteData = { name: name, html: code };
        const siteRef = ref(db, `htmlSites/${slug}`);

        if (currentEditingKey && currentEditingKey !== slug) {
            if (!confirm(`שינית את נתיב ה-URL. הקישור הישן יפסיק לעבוד. האם להמשיך?`)) return;
            const oldRef = ref(db, `htmlSites/${currentEditingKey}`);
            await remove(oldRef);
        }
        
        await set(siteRef, siteData);
        alert(`האתר "${name}" נשמר בהצלחה!`);
        showListView();
    });
});