const API = '/api';
let currentUser = null;

// --- أدوات مساعدة ---
function openModal(id) { 
    if(id === 'adminModal') checkAdminAccess();
    if(id === 'merchantModal' && (!currentUser || currentUser.role !== 'merchant')) return alert('يجب تسجيل الدخول كتاجر');
    if(id === 'customerModal' && (!currentUser || currentUser.role !== 'customer')) return alert('يجب تسجيل الدخول كزبون');
    
    if(id === 'merchantModal') loadMerchantProducts();
    if(id === 'customerModal' && currentUser) document.getElementById('customerAccNum').innerText = currentUser.accountNumber;

    document.getElementById(id).style.display = 'flex'; 
}
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
window.onclick = function(e) { if(e.target.classList.contains('modal')) e.target.style.display = 'none'; }

function toggleAuthSection(section) {
    document.getElementById('loginSection').style.display = section === 'login' ? 'block' : 'none';
    document.getElementById('registerSection').style.display = section === 'register' ? 'block' : 'none';
}
function togglePassSection() {
    const sec = document.getElementById('changePassSection');
    sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
}

// --- الحسابات ---
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;
    const res = await fetch(`${API}/login`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password, role})
    });
    const data = await res.json();
    if(data.success) {
        currentUser = data.user;
        updateUIAfterLogin();
        closeModal('authModal');
    } else { alert(data.message); }
}

async function register() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    const res = await fetch(`${API}/register`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, email, password, role})
    });
    const data = await res.json();
    alert(data.message);
    if(data.success) {
        toggleAuthSection('login');
    }
}

async function changePassword() {
    const email = document.getElementById('cpEmail').value;
    const oldPassword = document.getElementById('cpOld').value;
    const newPassword = document.getElementById('cpNew').value;
    const res = await fetch(`${API}/change-password`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, oldPassword, newPassword})
    });
    const data = await res.json();
    alert(data.message);
}

function updateUIAfterLogin() {
    const welcome = document.getElementById('userWelcome');
    if(currentUser) {
        welcome.innerText = `أهلاً, ${currentUser.name} (${currentUser.accountNumber})`;
        if(currentUser.role === 'merchant') {
            welcome.innerHTML += ` <button class="btn" style="width:auto; padding:5px 10px; font-size:12px; margin-right:10px;" onclick="openModal('merchantModal')">لوحة التاجر</button>`;
        } else if(currentUser.role === 'customer') {
            welcome.innerHTML += ` <button class="btn" style="width:auto; padding:5px 10px; font-size:12px; margin-right:10px;" onclick="openModal('customerModal')">لوحة الزبون</button>`;
        } else if(currentUser.role === 'admin') {
            welcome.innerHTML += ` <button class="btn" style="width:auto; padding:5px 10px; font-size:12px; margin-right:10px; background:var(--gold); color:var(--primary);" onclick="openModal('adminModal')">لوحة الأدمن</button>`;
        }
    }
}

// --- التاجر ---
async function loadMerchantProducts() {
    const res = await fetch(`${API}/products/${currentUser.id}`);
    const products = await res.json();
    document.querySelector('#merchantProductsTable tbody').innerHTML = products.map(p => 
        `<tr><td>${p.name}</td><td>${p.price}</td><td>${p.category}</td><td><button onclick="deleteProduct(${p.id})" style="color:red; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i></button></td></tr>`
    ).join('');
}

async function addProduct() {
    const name = document.getElementById('prodName').value;
    const price = document.getElementById('prodPrice').value;
    const category = document.getElementById('prodCategory').value;
    if(!name || !price) return alert('أدخل البيانات');
    await fetch(`${API}/products`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({merchantId: currentUser.id, name, price, category})
    });
    loadMerchantProducts();
}

async function deleteProduct(id) {
    if(!confirm('هل أنت متأكد من حذف المنتج؟')) return;
    await fetch(`${API}/products/${id}`, {method: 'DELETE'});
    loadMerchantProducts();
}

// --- الدردشة العامة ---
async function fetchPublicMessages() {
    const res = await fetch(`${API}/chat/public`);
    const msgs = await res.json();
    const box = document.getElementById('chatBox');
    box.innerHTML = msgs.map(m => `<div class="msg other">${m.sender}: ${m.text}</div>`).join('');
    box.scrollTop = box.scrollHeight;
}
async function sendPublicMessage() {
    const text = document.getElementById('chatInput').value;
    if(!text) return;
    await fetch(`${API}/chat/public`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({sender: currentUser ? `${currentUser.name} (${currentUser.accountNumber})` : 'زائر', text})
    });
    document.getElementById('chatInput').value = '';
    fetchPublicMessages();
}
setInterval(fetchPublicMessages, 3000);

// --- البلاغات ---
async function submitComplaint() {
    if(!currentUser) return alert('يجب تسجيل الدخول أولاً لتقديم شكوى.');
    const reportedAccount = document.getElementById('compReportedAcc').value;
    const reason = document.getElementById('compReason').value;
    if(!reportedAccount || !reason) return alert('أكمل البيانات');
    
    const res = await fetch(`${API}/admin/complaints`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({reporterAccount: currentUser.accountNumber, reportedAccount, reason})
    });
    const data = await res.json();
    alert(data.message);
    closeModal('complaintModal');
}

// --- الأدمن ---
async function checkAdminAccess() {
    if(currentUser && currentUser.role === 'admin') {
        document.getElementById('adminContent').style.display = 'block';
        document.getElementById('adminLocked').style.display = 'none';
        loadAdminData();
    } else {
        document.getElementById('adminContent').style.display = 'none';
        document.getElementById('adminLocked').style.display = 'block';
    }
}

async function loadAdminData() {
    // إحصائيات
    const stats = await (await fetch(`${API}/admin/stats`)).json();
    document.getElementById('statUsers').innerText = stats.users;
    document.getElementById('statProducts').innerText = stats.products;
    document.getElementById('statComplaints').innerText = stats.complaints;

    // البلاغات
    const comps = await (await fetch(`${API}/admin/complaints`)).json();
    document.querySelector('#complaintsTable tbody').innerHTML = comps.map(c => 
        `<tr><td>${c.reporterAccount}</td><td>${c.reportedAccount}</td><td>${c.reason}</td>
         <td><button onclick="searchUserByAcc('${c.reportedAccount}')" style="color:blue; border:none; background:none; cursor:pointer;">عرض البيانات</button></td></tr>`
    ).join('');
}

async function searchUserByAcc(acc) {
    document.getElementById('searchAcc').value = acc;
    searchUser();
}

async function searchUser() {
    const acc = document.getElementById('searchAcc').value;
    const res = await fetch(`${API}/admin/users/${acc}`);
    const data = await res.json();
    const resultDiv = document.getElementById('searchResult');
    resultDiv.style.display = 'block';
    
    if(data.message) {
        resultDiv.innerHTML = `<span style="color:red;">${data.message}</span>`;
    } else {
        resultDiv.innerHTML = `
            <strong>الاسم:</strong> ${data.name} | 
            <strong>البريد:</strong> ${data.email} | 
            <strong>الحالة:</strong> ${data.status} |
            <button onclick="banUser(${data.id})" style="background:red; color:white; border:none; padding:5px 10px; border-radius:5px; margin-right:10px; cursor:pointer;">حظر الحساب</button>
        `;
    }
}

async function banUser(id) {
    if(!confirm('هل أنت متأكد من حظر هذا المستخدم؟')) return;
    const res = await fetch(`${API}/admin/ban/${id}`, {method: 'POST'});
    const data = await res.json();
    alert(data.message);
    searchUser();
}