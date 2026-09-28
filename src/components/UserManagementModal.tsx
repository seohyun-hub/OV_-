import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Shield,
  KeyRound,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  Lock,
  Search,
  Users,
  CheckSquare,
  Square,
  Clock,
  Calendar,
  Filter,
  SlidersHorizontal,
  User,
  ShieldCheck,
  Check
} from 'lucide-react';
import { AuthUser, ALL_APP_MENUS, AppMenuDef, ActiveTab } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
}

type FilterRoleStatus = 'all' | 'admin' | 'staff' | 'active' | 'inactive';

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterRoleStatus>('all');

  // Mode: 'list' | 'add' | 'edit' | 'reset-pin' | 'menu-permissions'
  const [mode, setMode] = useState<'list' | 'add' | 'edit' | 'reset-pin' | 'menu-permissions'>('list');

  // Creation / Edit form state
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formTeam, setFormTeam] = useState('Revenue');
  const [formPassword, setFormPassword] = useState('');
  const [formIsAdmin, setFormIsAdmin] = useState(false); // default: 실무자 (false)
  const [formIsActive, setFormIsActive] = useState(true);

  // Active target user for edit/reset-pin/menu-permissions
  const [targetUser, setTargetUser] = useState<AuthUser | null>(null);

  // Menu permissions state for target user
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);

  // Created account notice banner
  const [createdNotice, setCreatedNotice] = useState<{ name: string; username: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.error || '사용자 목록을 불러오지 못했습니다.');
      }
    } catch (err) {
      setError('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Real-time PIN / password weakness check
  const getPasswordWarning = (pwd: string) => {
    if (!pwd) return null;
    const trimmed = pwd.trim();
    if (trimmed.length < 4) return '비밀번호 또는 PIN은 4자리 이상이어야 합니다.';
    const weakPins = [
      '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999',
      '1234', '4321', '0123', '3210', '1122', '2211', '1212', '2121', '1357', '2468',
      '123456', '654321', '000000', '111111', '12345', '54321'
    ];
    if (weakPins.includes(trimmed)) {
      return '보안에 취약한 단순 PIN번호(예: 1234, 0000)는 사용할 수 없습니다.';
    }
    if (/^(.)\1+$/.test(trimmed)) {
      return '동일한 문자가 연속 반복되는 단순 비밀번호는 사용할 수 없습니다.';
    }
    return null;
  };

  // Open add form
  const handleOpenAddForm = () => {
    setFormName('');
    setFormUsername('');
    setFormTeam('Revenue');
    setFormPassword('');
    setFormIsAdmin(false); // Default to 실무자 (Staff)
    setFormIsActive(true);
    setSelectedMenus(ALL_APP_MENUS.map(m => m.key)); // Default all menus allowed for new user
    setError(null);
    setSuccess(null);
    setCreatedNotice(null);
    setMode('add');
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreatedNotice(null);

    const warn = getPasswordWarning(formPassword);
    if (warn) {
      setError(warn);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName.trim(),
          username: formUsername.trim(),
          team: formTeam.trim(),
          password: formPassword.trim(),
          isAdmin: formIsAdmin,
          isActive: formIsActive,
          allowedMenus: formIsAdmin ? ALL_APP_MENUS.map(m => m.key) : selectedMenus,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedNotice({
          name: formName.trim(),
          username: formUsername.trim(),
        });
        setSuccess(`${formName.trim()}님의 계정이 성공적으로 생성되었습니다.`);
        fetchUsers();
        setMode('list');
      } else {
        setError(data.error || '사용자 생성 실패');
      }
    } catch (err) {
      setError('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Form
  const handleOpenEditForm = (user: AuthUser) => {
    setTargetUser(user);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormTeam(user.team);
    setFormIsAdmin(user.isAdmin);
    setFormIsActive(user.isActive);
    setFormPassword('');
    setError(null);
    setSuccess(null);
    setMode('edit');
  };

  // Update User
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/users/${targetUser.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName.trim(),
          team: formTeam.trim(),
          isAdmin: formIsAdmin,
          isActive: formIsActive,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`${formName.trim()}님의 사용자 정보가 수정되었습니다.`);
        fetchUsers();
        setMode('list');
      } else {
        setError(data.error || '사용자 정보 수정 실패');
      }
    } catch (err) {
      setError('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Open Reset PIN Form
  const handleOpenResetPin = (user: AuthUser) => {
    setTargetUser(user);
    setFormPassword('');
    setError(null);
    setSuccess(null);
    setMode('reset-pin');
  };

  // Reset PIN/Password
  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;
    setError(null);
    setSuccess(null);

    const warn = getPasswordWarning(formPassword);
    if (warn) {
      setError(warn);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/users/${targetUser.userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newPassword: formPassword.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`${targetUser.name}님의 PIN / 비밀번호가 변경되었습니다.`);
        fetchUsers();
        setMode('list');
      } else {
        setError(data.error || 'PIN 재설정 실패');
      }
    } catch (err) {
      setError('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Open Menu Permissions Editor
  const handleOpenMenuPermissions = (user: AuthUser) => {
    setTargetUser(user);
    // If user has allowedMenus specified, use it; otherwise default to all menus
    if (user.allowedMenus && user.allowedMenus.length > 0) {
      setSelectedMenus([...user.allowedMenus]);
    } else {
      setSelectedMenus(ALL_APP_MENUS.map(m => m.key));
    }
    setError(null);
    setSuccess(null);
    setMode('menu-permissions');
  };

  // Save Menu Permissions
  const handleSaveMenuPermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/users/${targetUser.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          allowedMenus: selectedMenus,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`${targetUser.name}님의 메뉴 접근 권한이 업데이트되었습니다.`);
        fetchUsers();
        setMode('list');
      } else {
        setError(data.error || '메뉴 권한 설정 실패');
      }
    } catch (err) {
      setError('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle User Active / Disable State (접속 중지 / 재개)
  const handleToggleActive = async (user: AuthUser) => {
    if (user.userId === currentUser.userId && user.isActive) {
      alert('본인 계정은 접속 중지할 수 없습니다.');
      return;
    }
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/users/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !user.isActive,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`${user.name}님의 계정이 ${!user.isActive ? '사용중' : '사용중지'} 상태로 변경되었습니다.`);
        fetchUsers();
      } else {
        setError(data.error || '상태 변경 실패');
      }
    } catch (err) {
      setError('상태 변경 중 오류가 발생했습니다.');
    }
  };

  // Optional Delete User with explicit warning
  const handleDeleteUser = async (user: AuthUser) => {
    if (user.userId === currentUser.userId) {
      alert('본인 계정은 삭제할 수 없습니다.');
      return;
    }
    if (!window.confirm(`[경고] 정말로 ${user.name} (${user.username}) 계정을 완전히 삭제하시겠습니까?\n대신 '접속 중지'를 권장합니다.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/users/${user.userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`${user.name}님의 계정이 삭제되었습니다.`);
        fetchUsers();
      } else {
        setError(data.error || '사용자 삭제 실패');
      }
    } catch (err) {
      setError('사용자 삭제 중 오류가 발생했습니다.');
    }
  };

  // Top Summary Statistics
  const totalUsersCount = users.length;
  const adminCount = users.filter((u) => u.isAdmin).length;
  const staffCount = users.filter((u) => !u.isAdmin).length;
  const inactiveCount = users.filter((u) => !u.isActive).length;

  // Search & Filter Logic
  const filteredUsers = users.filter((u) => {
    // 1. Filter Tab Check
    if (activeFilter === 'admin' && !u.isAdmin) return false;
    if (activeFilter === 'staff' && u.isAdmin) return false;
    if (activeFilter === 'active' && !u.isActive) return false;
    if (activeFilter === 'inactive' && u.isActive) return false;

    // 2. Search Term Check
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      u.name.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.team.toLowerCase().includes(term)
    );
  });

  // Format Date for display
  const formatDate = (isoString?: string) => {
    if (!isoString) return '기록 없음';
    try {
      const date = new Date(isoString);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white border border-[#D4C8B8] rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
        
        {/* 1. Modal Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E8E4DC] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#736152] text-white rounded-lg shadow-2xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-[#2C2C2C] tracking-tight">
                  사내 사용자 관리
                </h2>
                <span className="text-[10px] bg-[#736152] text-white px-2 py-0.5 rounded-xs font-mono font-bold">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-[#8C7A6B]">
                사내 계정 목록 조회 · 권한 부여 · 접속 중지 및 메뉴 접근 제어
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8C7A6B] hover:text-[#2C2C2C] hover:bg-[#EFECE6] rounded-lg transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Notice & Feedback Banners */}
        <div className="px-6 pt-4 space-y-2 shrink-0">
          {createdNotice && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3 text-xs text-amber-950 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-sm text-[#2C2C2C]">
                  {createdNotice.name}님의 신규 계정이 생성되었습니다.
                </div>
                <div className="font-mono font-bold text-[#736152]">
                  아이디: {createdNotice.username}
                </div>
                <p className="text-[11px] text-[#8C7A6B]">
                  * PIN/비밀번호는 관리자 화면에서 다시 조회가 불가능합니다. 해당 사용자에게 전달해 주세요.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && !createdNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* 3. Main Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* ================= MODE: LIST ================= */}
          {mode === 'list' && (
            <>
              {/* 1. Top Summary Cards (요약 카운터) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-[#8C7A6B]">전체 사용자</div>
                    <div className="text-xl font-bold text-[#2C2C2C] mt-0.5">{totalUsersCount}명</div>
                  </div>
                  <div className="p-2 bg-white border border-[#E8E4DC] rounded-md text-[#736152]">
                    <Users className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3.5 bg-[#F5F2EB] border border-[#D4C8B8] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-[#736152]">관리자</div>
                    <div className="text-xl font-bold text-[#2C2C2C] mt-0.5">{adminCount}명</div>
                  </div>
                  <div className="p-2 bg-[#736152] text-white rounded-md">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-[#8C7A6B]">실무자</div>
                    <div className="text-xl font-bold text-[#2C2C2C] mt-0.5">{staffCount}명</div>
                  </div>
                  <div className="p-2 bg-white border border-[#E8E4DC] rounded-md text-[#8C7A6B]">
                    <User className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-rose-800">사용중지</div>
                    <div className="text-xl font-bold text-rose-950 mt-0.5">{inactiveCount}명</div>
                  </div>
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-md">
                    <UserX className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 2. Action Bar: Filter Tabs & Search & New User Button */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="이름 또는 ID 검색 (예: 박서현, seohyun)"
                    className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#D4C8B8] rounded-lg text-xs text-[#2C2C2C] placeholder-[#A09385] focus:outline-none focus:ring-2 focus:ring-[#736152]/30"
                  />
                </div>

                {/* Filter Radio Tabs */}
                <div className="flex items-center space-x-1 bg-[#F5F2EB] p-1 border border-[#E8E4DC] rounded-lg text-xs overflow-x-auto">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      activeFilter === 'all'
                        ? 'bg-[#736152] text-white font-bold shadow-2xs'
                        : 'text-[#736152] hover:bg-[#EFECE6]'
                    }`}
                  >
                    전체 ({totalUsersCount})
                  </button>
                  <button
                    onClick={() => setActiveFilter('admin')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      activeFilter === 'admin'
                        ? 'bg-[#736152] text-white font-bold shadow-2xs'
                        : 'text-[#736152] hover:bg-[#EFECE6]'
                    }`}
                  >
                    관리자 ({adminCount})
                  </button>
                  <button
                    onClick={() => setActiveFilter('staff')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      activeFilter === 'staff'
                        ? 'bg-[#736152] text-white font-bold shadow-2xs'
                        : 'text-[#736152] hover:bg-[#EFECE6]'
                    }`}
                  >
                    실무자 ({staffCount})
                  </button>
                  <button
                    onClick={() => setActiveFilter('active')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      activeFilter === 'active'
                        ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                        : 'text-[#736152] hover:bg-[#EFECE6]'
                    }`}
                  >
                    사용중 ({totalUsersCount - inactiveCount})
                  </button>
                  <button
                    onClick={() => setActiveFilter('inactive')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      activeFilter === 'inactive'
                        ? 'bg-rose-700 text-white font-bold shadow-2xs'
                        : 'text-[#736152] hover:bg-[#EFECE6]'
                    }`}
                  >
                    사용중지 ({inactiveCount})
                  </button>
                </div>

                {/* + 신규 사용자 Button */}
                <button
                  onClick={handleOpenAddForm}
                  className="px-3.5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ 신규 사용자</span>
                </button>
              </div>

              {/* 3. User List Table */}
              <div className="border border-[#E8E4DC] rounded-lg overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-[#E8E4DC] text-[#736152] font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="px-4 py-3">이름</th>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">소속팀</th>
                        <th className="px-4 py-3">권한</th>
                        <th className="px-4 py-3">상태</th>
                        <th className="px-4 py-3">최근접속</th>
                        <th className="px-4 py-3 text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6] bg-white text-[#2C2C2C]">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-[#8C7A6B]">
                            사용자 목록을 불러오는 중입니다...
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-[#8C7A6B]">
                            조건에 해당하는 사용자가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.userId} className={`hover:bg-[#FAF8F5] transition-colors ${!u.isActive ? 'bg-gray-50/70' : ''}`}>
                            
                            {/* 이름 */}
                            <td className="px-4 py-3 font-medium">
                              <div className="font-bold text-[#2C2C2C] flex items-center space-x-1.5">
                                <span>{u.name}</span>
                                {u.userId === currentUser.userId && (
                                  <span className="text-[9px] bg-[#736152] text-white px-1.5 py-0.2 rounded-2xs font-mono">
                                    나
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* ID */}
                            <td className="px-4 py-3 font-mono font-bold text-[#736152]">
                              {u.username}
                            </td>

                            {/* 소속팀 */}
                            <td className="px-4 py-3 text-[#5C4E43]">
                              {u.team}
                            </td>

                            {/* 권한 */}
                            <td className="px-4 py-3">
                              {u.isAdmin ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-2xs text-[10px] font-bold bg-[#F5F2EB] text-[#736152] border border-[#D4C8B8]">
                                  <Shield className="w-3 h-3 mr-1 text-[#736152]" />
                                  관리자
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-2xs text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                  <User className="w-3 h-3 mr-1 text-gray-500" />
                                  실무자
                                </span>
                              )}
                            </td>

                            {/* 상태 */}
                            <td className="px-4 py-3">
                              {u.isActive ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-2xs text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1" />
                                  사용중
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-2xs text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1" />
                                  사용중지
                                </span>
                              )}
                            </td>

                            {/* 최근접속 */}
                            <td className="px-4 py-3 text-[11px] font-mono text-[#8C7A6B]">
                              {u.lastLoginAt ? (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-[#8C7A6B]" />
                                  <span>{formatDate(u.lastLoginAt)}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">접속 기록 없음</span>
                              )}
                            </td>

                            {/* 관리 (Actions) */}
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end space-x-1">
                                
                                {/* 1. 사용자 정보 수정 */}
                                <button
                                  onClick={() => handleOpenEditForm(u)}
                                  title="사용자 정보 수정"
                                  className="px-2 py-1 bg-white border border-[#D4C8B8] hover:bg-[#EFECE6] text-[#736152] rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center space-x-1"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>수정</span>
                                </button>

                                {/* 2. PIN 재설정 */}
                                <button
                                  onClick={() => handleOpenResetPin(u)}
                                  title="PIN 재설정"
                                  className="px-2 py-1 bg-white border border-[#D4C8B8] hover:bg-[#EFECE6] text-[#736152] rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center space-x-1"
                                >
                                  <KeyRound className="w-3 h-3" />
                                  <span>PIN 재설정</span>
                                </button>

                                {/* 3. 메뉴 권한 */}
                                <button
                                  onClick={() => handleOpenMenuPermissions(u)}
                                  title="메뉴 접근 권한 설정"
                                  className="px-2 py-1 bg-[#F5F2EB] border border-[#D4C8B8] hover:bg-[#EFECE6] text-[#736152] rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center space-x-1"
                                >
                                  <SlidersHorizontal className="w-3 h-3 text-[#736152]" />
                                  <span>메뉴 권한</span>
                                </button>

                                {/* 4. 접속 중지 / 재개 */}
                                <button
                                  onClick={() => handleToggleActive(u)}
                                  title={u.isActive ? '접속 중지' : '접속 재개'}
                                  className={`px-2 py-1 border rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
                                    u.isActive
                                      ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                                      : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                                >
                                  {u.isActive ? (
                                    <>
                                      <UserX className="w-3 h-3" />
                                      <span>접속 중지</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-3 h-3" />
                                      <span>접속 재개</span>
                                    </>
                                  )}
                                </button>

                                {/* Optional Hard Delete */}
                                {u.userId !== currentUser.userId && (
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    title="계정 완전히 삭제"
                                    className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer ml-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                              </div>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ================= MODE: ADD USER ================= */}
          {mode === 'add' && (
            <form onSubmit={handleCreateUser} className="space-y-4 max-w-lg mx-auto py-2">
              <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
                <h3 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-[#736152]" />
                  <span>신규 사용자 계정 추가</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="text-xs text-[#8C7A6B] hover:text-[#2C2C2C]"
                >
                  목록으로 돌아가기
                </button>
              </div>

              <div className="space-y-4">
                {/* 이름 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C2C2C]">
                    이름 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="예: 박서현"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-lg text-xs text-[#2C2C2C] placeholder-[#A09385] focus:outline-none focus:ring-2 focus:ring-[#736152]/30"
                  />
                </div>

                {/* 아이디 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C2C2C]">
                    아이디 (ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="예: seohyun, marketing01"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-lg text-xs font-mono text-[#2C2C2C] placeholder-[#A09385] focus:outline-none focus:ring-2 focus:ring-[#736152]/30"
                  />
                  <p className="text-[10px] text-[#8C7A6B]">
                    * 영문/숫자 고유 로그인 아이디 (중복 불가)
                  </p>
                </div>

                {/* 소속 팀 */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C2C2C]">
                    소속 팀 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTeam}
                    onChange={(e) => setFormTeam(e.target.value)}
                    placeholder="예: Revenue, Marketing, 기획"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-lg text-xs text-[#2C2C2C] placeholder-[#A09385] focus:outline-none focus:ring-2 focus:ring-[#736152]/30"
                  />
                </div>

                {/* 비밀번호 또는 PIN */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C2C2C]">
                    비밀번호 또는 4자리 PIN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="비밀번호 또는 4자리 PIN (예: 4821)"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-lg text-xs text-[#2C2C2C] placeholder-[#A09385] focus:outline-none focus:ring-2 focus:ring-[#736152]/30"
                  />
                  {getPasswordWarning(formPassword) ? (
                    <p className="text-[11px] text-rose-600 font-medium">
                      ⚠️ {getPasswordWarning(formPassword)}
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#8C7A6B]">
                      * 4자리 이상의 숫자 PIN 또는 비밀번호를 입력해주세요.
                    </p>
                  )}
                </div>

                {/* 2. 권한 선택 개선 (Explicit Role Radio Choice) */}
                <div className="space-y-2 pt-2 border-t border-[#E8E4DC]">
                  <label className="block text-xs font-bold text-[#2C2C2C]">
                    사용자 권한 <span className="text-rose-500">*</span>
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 실무자 Option (Default) */}
                    <div
                      onClick={() => setFormIsAdmin(false)}
                      className={`p-3.5 border rounded-lg cursor-pointer transition-all flex items-start space-x-3 ${
                        !formIsAdmin
                          ? 'bg-[#F5F2EB] border-[#736152] ring-2 ring-[#736152]/20'
                          : 'bg-white border-[#E8E4DC] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="roleSelect"
                        checked={!formIsAdmin}
                        onChange={() => setFormIsAdmin(false)}
                        className="mt-0.5 text-[#736152] focus:ring-[#736152]"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-[#2C2C2C] flex items-center space-x-1.5">
                          <span>실무자</span>
                          <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.2 rounded-2xs">기본값</span>
                        </div>
                        <p className="text-[11px] text-[#736152] leading-tight">
                          일반 업무 기능 사용 (허용된 메뉴만 접근)
                        </p>
                      </div>
                    </div>

                    {/* 관리자 Option */}
                    <div
                      onClick={() => setFormIsAdmin(true)}
                      className={`p-3.5 border rounded-lg cursor-pointer transition-all flex items-start space-x-3 ${
                        formIsAdmin
                          ? 'bg-[#736152]/10 border-[#736152] ring-2 ring-[#736152]/20'
                          : 'bg-white border-[#E8E4DC] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="roleSelect"
                        checked={formIsAdmin}
                        onChange={() => setFormIsAdmin(true)}
                        className="mt-0.5 text-[#736152] focus:ring-[#736152]"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-[#2C2C2C] flex items-center space-x-1.5">
                          <Shield className="w-3.5 h-3.5 text-[#736152]" />
                          <span>관리자</span>
                        </div>
                        <p className="text-[11px] text-[#736152] leading-tight">
                          사용자 및 시스템 권한 관리 가능 (전체 메뉴 접근)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 계정 사용 승인 상태 */}
                <div className="pt-2">
                  <label className="flex items-center space-x-2 text-xs text-[#2C2C2C] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="rounded border-[#D4C8B8] text-[#736152] focus:ring-[#736152]"
                    />
                    <span>계정 사용 승인 (사용중 상태로 생성)</span>
                  </label>
                </div>

              </div>

              {/* Form Buttons */}
              <div className="flex items-center space-x-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-[#736152] hover:bg-[#5C4E43] text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? '계정 생성 중...' : '계정 생성 완료'}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="px-4 py-2.5 bg-[#FAF8F5] border border-[#D4C8B8] text-[#736152] font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  취소
                </button>
              </div>
            </form>
          )}

          {/* ================= MODE: EDIT USER ================= */}
          {mode === 'edit' && targetUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4 max-w-lg mx-auto py-2">
              <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
                <h3 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
                  <Edit2 className="w-4 h-4 text-[#736152]" />
                  <span>사용자 정보 수정: {targetUser.username}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="text-xs text-[#8C7A6B] hover:text-[#2C2C2C]"
                >
                  취소
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C2C2C]">이름</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-lg text-xs text-[#2C2C2C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C2C2C]">소속 팀</label>
                  <input
                    type="text"
                    required
                    value={formTeam}
                    onChange={(e) => setFormTeam(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-lg text-xs text-[#2C2C2C]"
                  />
                </div>

                {/* Role selection radio buttons */}
                <div className="space-y-2 pt-2 border-t border-[#E8E4DC]">
                  <label className="block text-xs font-bold text-[#2C2C2C]">사용자 권한</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setFormIsAdmin(false)}
                      className={`p-3.5 border rounded-lg cursor-pointer transition-all flex items-start space-x-3 ${
                        !formIsAdmin
                          ? 'bg-[#F5F2EB] border-[#736152] ring-2 ring-[#736152]/20'
                          : 'bg-white border-[#E8E4DC] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="editRoleSelect"
                        checked={!formIsAdmin}
                        onChange={() => setFormIsAdmin(false)}
                        className="mt-0.5 text-[#736152]"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-[#2C2C2C]">실무자</div>
                        <p className="text-[11px] text-[#736152]">일반 업무 기능 사용</p>
                      </div>
                    </div>

                    <div
                      onClick={() => setFormIsAdmin(true)}
                      className={`p-3.5 border rounded-lg cursor-pointer transition-all flex items-start space-x-3 ${
                        formIsAdmin
                          ? 'bg-[#736152]/10 border-[#736152] ring-2 ring-[#736152]/20'
                          : 'bg-white border-[#E8E4DC] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="editRoleSelect"
                        checked={formIsAdmin}
                        onChange={() => setFormIsAdmin(true)}
                        className="mt-0.5 text-[#736152]"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-[#2C2C2C]">관리자</div>
                        <p className="text-[11px] text-[#736152]">사용자 및 시스템 권한 관리 가능</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active status check */}
                <div className="pt-2">
                  <label className="flex items-center space-x-2 text-xs text-[#2C2C2C] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="rounded border-[#D4C8B8] text-[#736152]"
                    />
                    <span>계정 사용중 상태 (체크 해제 시 즉시 로그인 및 접속 중지)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-[#736152] hover:bg-[#5C4E43] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  수정 사항 저장
                </button>
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="px-4 py-2.5 bg-[#FAF8F5] border border-[#D4C8B8] text-[#736152] font-bold text-xs rounded-lg cursor-pointer"
                >
                  취소
                </button>
              </div>
            </form>
          )}

          {/* ================= MODE: RESET PIN / PASSWORD ================= */}
          {mode === 'reset-pin' && targetUser && (
            <form onSubmit={handleResetPin} className="space-y-4 max-w-lg mx-auto py-2">
              <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
                <h3 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-[#736152]" />
                  <span>PIN / 비밀번호 재설정: {targetUser.name} ({targetUser.username})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="text-xs text-[#8C7A6B] hover:text-[#2C2C2C]"
                >
                  취소
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 bg-[#F5F2EB] border border-[#D4C8B8] rounded-lg text-xs text-[#736152] space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-[#2C2C2C]">
                    <Lock className="w-3.5 h-3.5 text-[#736152]" />
                    <span>보안 암호화 규칙</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    * 사용자의 기존 PIN/비밀번호는 해시 암호화되어 있어 관리자를 포함한 누구도 조회할 수 없습니다.
                    <br />
                    * PIN을 분실한 경우 새로운 PIN 또는 비밀번호를 지정해 주세요.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C2C2C]">
                    새로운 비밀번호 또는 4자리 PIN 입력 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="새 PIN 입력 (예: 4821)"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-lg text-xs text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#736152]/30"
                  />
                  {getPasswordWarning(formPassword) ? (
                    <p className="text-[11px] text-rose-600 font-medium">
                      ⚠️ {getPasswordWarning(formPassword)}
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#8C7A6B]">
                      * 변경된 PIN은 해당 사용자에게 즉시 적용됩니다.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-[#736152] hover:bg-[#5C4E43] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  새 PIN으로 변경 완료
                </button>
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="px-4 py-2.5 bg-[#FAF8F5] border border-[#D4C8B8] text-[#736152] font-bold text-xs rounded-lg cursor-pointer"
                >
                  취소
                </button>
              </div>
            </form>
          )}

          {/* ================= MODE: MENU PERMISSIONS (메뉴 접근 권한) ================= */}
          {mode === 'menu-permissions' && targetUser && (
            <form onSubmit={handleSaveMenuPermissions} className="space-y-4 max-w-xl mx-auto py-1">
              <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#736152]" />
                    <span>메뉴 접근 권한 설정: {targetUser.name} ({targetUser.username})</span>
                  </h3>
                  <p className="text-[11px] text-[#8C7A6B]">
                    선택한 메뉴만 화면 및 URL 접근이 가능하도록 허용합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="text-xs text-[#8C7A6B] hover:text-[#2C2C2C]"
                >
                  취소
                </button>
              </div>

              {/* Admin Note Banner */}
              {targetUser.isAdmin ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium">
                  🛡️ 관리자 계정은 기본적으로 전체 메뉴에 항상 접근할 수 있습니다.
                </div>
              ) : null}

              {/* Quick Select Buttons */}
              <div className="flex items-center justify-between bg-[#FAF8F5] p-2.5 border border-[#E8E4DC] rounded-lg">
                <span className="text-xs font-bold text-[#736152]">
                  허용 메뉴 선택 ({selectedMenus.length} / {ALL_APP_MENUS.length})
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMenus(ALL_APP_MENUS.map(m => m.key))}
                    className="px-2.5 py-1 bg-white border border-[#D4C8B8] hover:bg-[#EFECE6] text-[#736152] text-[11px] font-semibold rounded-md transition-colors cursor-pointer"
                  >
                    전체 선택
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMenus(['home'])}
                    className="px-2.5 py-1 bg-white border border-[#D4C8B8] hover:bg-[#EFECE6] text-[#736152] text-[11px] font-semibold rounded-md transition-colors cursor-pointer"
                  >
                    기본(Dashboard만)
                  </button>
                </div>
              </div>

              {/* App Menu Checkboxes Grid */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {Array.from(new Set(ALL_APP_MENUS.map(m => m.group))).map((groupName) => {
                  const groupMenus = ALL_APP_MENUS.filter(m => m.group === groupName);
                  return (
                    <div key={groupName} className="border border-[#E8E4DC] rounded-lg overflow-hidden bg-white">
                      <div className="px-3 py-1.5 bg-[#F5F2EB] border-b border-[#E8E4DC] text-[11px] font-bold text-[#736152]">
                        {groupName}
                      </div>
                      <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {groupMenus.map((menu) => {
                          const isChecked = selectedMenus.includes(menu.key);
                          return (
                            <label
                              key={menu.key}
                              className={`flex items-center space-x-2.5 p-2 rounded-md border cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-[#F5F2EB]/70 border-[#736152]/50 text-[#2C2C2C] font-semibold'
                                  : 'bg-gray-50/50 border-gray-200 text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMenus(prev => [...prev, menu.key]);
                                  } else {
                                    setSelectedMenus(prev => prev.filter(k => k !== menu.key));
                                  }
                                }}
                                className="rounded border-[#D4C8B8] text-[#736152] focus:ring-[#736152]"
                              />
                              <span className="text-xs">{menu.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center space-x-2 pt-3 border-t border-[#E8E4DC]">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-[#736152] hover:bg-[#5C4E43] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  메뉴 권한 저장
                </button>
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="px-4 py-2.5 bg-[#FAF8F5] border border-[#D4C8B8] text-[#736152] font-bold text-xs rounded-lg cursor-pointer"
                >
                  취소
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
