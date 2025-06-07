# Car Rental System

Це повноцінний веб-додаток для оренди автомобілів:
- **Frontend:** React + Vite
- **Backend:** Node.js + Express + MongoDB (Mongoose)

## Можливості
- Перегляд, фільтрація та пошук автомобілів
- Оренда авто з вибором дат
- Система відгуків (залишати та видаляти відгуки)
- Адмін-панель для керування автопарком та користувачами
- Аутентифікація та ролі (user/admin)

## Запуск проекту

### 1. Backend

```bash
cd backend
npm install
# Створіть файл .env з вашим MongoDB URI та JWT_SECRET
npm start
```

**.env приклад:**
```
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Відкрийте [http://localhost:5173](http://localhost:5173) у браузері.

## Важливо
- Не забудьте додати .env файли у backend та frontend (вони не потрапляють у git)
- Для продакшн-режиму використовуйте окремий MongoDB Atlas кластер та надійний JWT_SECRET

## Ліцензія
MIT
