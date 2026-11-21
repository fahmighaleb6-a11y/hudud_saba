// data/db.js
let users = [
  { id: 1, accountNumber: 'HS-1000', email: 'admin@hudhud.com', password: 'admin123', role: 'admin', name: 'المدير العام', status: 'active' },
  { id: 2, accountNumber: 'HS-1001', email: 'customer@test.com', password: '123456', role: 'customer', name: 'زبون تجريبي', status: 'active' },
  { id: 3, accountNumber: 'HS-1002', email: 'merchant@test.com', password: '123456', role: 'merchant', name: 'تاجر تجريبي', status: 'active' }
];

let subscribers = [];
let publicMessages = [];
let privateMessages = []; // { from, to, text }
let complaints = []; // { id, reporterAccount, reportedAccount, reason, status }
let products = [
  { id: 1, merchantId: 3, name: 'سماعات بلوتوث', price: 150, category: 'إلكترونيات' }
]; // المنتجات تبدأ بمنتج للتاجر التجريبي

let nextId = 4;
let nextAccount = 1003;

module.exports = { users, subscribers, publicMessages, privateMessages, complaints, products, nextId, nextAccount };