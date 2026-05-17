import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import AppPageLayout, {
  pagePanelClass,
  pageTableHeadClass,
  pageTableCellClass,
  pageInputClass,
  pageModalOverlayClass,
  pageModalClass,
} from './AppPageLayout';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const roleLabel = (role) => (role === 'admin' ? 'Адміністратор' : 'Користувач');

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (userId, updatedData) => {
    try {
      await ApiService.updateUser(userId, updatedData);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цього користувача?')) return;
    try {
      await ApiService.deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <AppPageLayout title="Користувачі">
        <p className="text-center text-white/70">Завантаження...</p>
      </AppPageLayout>
    );
  }

  if (error) {
    return (
      <AppPageLayout title="Користувачі">
        <p className="text-center text-red-400">Помилка: {error}</p>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout
      title="Користувачі"
      subtitle="Керування обліковими записами та ролями."
      headerExtra={
        <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium">
          Всього: {users.length}
        </span>
      }
    >
      <div className={pagePanelClass}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className={pageTableHeadClass}>
              <tr>
                <th className={`${pageTableCellClass} text-left`}>Email</th>
                <th className={`${pageTableCellClass} text-left`}>Телефон</th>
                <th className={`${pageTableCellClass} text-left`}>Ім&apos;я</th>
                <th className={`${pageTableCellClass} text-left`}>Прізвище</th>
                <th className={`${pageTableCellClass} text-left`}>По батькові</th>
                <th className={`${pageTableCellClass} text-left`}>Роль</th>
                <th className={`${pageTableCellClass} text-left`}>Створено</th>
                <th className={`${pageTableCellClass} text-left`}>Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user._id} className="transition hover:bg-white/5">
                  <td className={pageTableCellClass}>{user.email}</td>
                  <td className={pageTableCellClass}>{user.phone_number || '—'}</td>
                  <td className={pageTableCellClass}>{user.first_name}</td>
                  <td className={pageTableCellClass}>{user.last_name}</td>
                  <td className={pageTableCellClass}>{user.middle_name || '—'}</td>
                  <td className={pageTableCellClass}>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className={pageTableCellClass}>{formatDate(user.created_at)}</td>
                  <td className={pageTableCellClass}>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingUser(user)}
                        className="text-amber-400 hover:text-amber-300"
                      >
                        Редагувати
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Видалити
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className={pageModalOverlayClass}>
          <div className={pageModalClass}>
            <h2 className="mb-4 text-xl font-bold">Редагувати користувача</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEdit(editingUser._id, {
                  phone_number: e.target.phone_number.value,
                  first_name: e.target.first_name.value,
                  last_name: e.target.last_name.value,
                  middle_name: e.target.middle_name.value,
                  role: e.target.role.value,
                });
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/70">Номер телефону</label>
                  <input
                    type="tel"
                    name="phone_number"
                    defaultValue={editingUser.phone_number}
                    className={pageInputClass}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">Ім&apos;я</label>
                  <input
                    type="text"
                    name="first_name"
                    defaultValue={editingUser.first_name}
                    className={pageInputClass}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">Прізвище</label>
                  <input
                    type="text"
                    name="last_name"
                    defaultValue={editingUser.last_name}
                    className={pageInputClass}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">По батькові</label>
                  <input
                    type="text"
                    name="middle_name"
                    defaultValue={editingUser.middle_name}
                    className={pageInputClass}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">Роль</label>
                  <select
                    name="role"
                    defaultValue={editingUser.role}
                    className={pageInputClass}
                  >
                    <option value="user">Користувач</option>
                    <option value="admin">Адміністратор</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-lg border border-white/20 px-4 py-2 text-white/80 hover:bg-white/10"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"
                >
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppPageLayout>
  );
};

export default UsersPage;
