'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { keepPreviousData } from '@tanstack/react-query';
import { trpc } from '../../utils/trpc';
import { FollowUserCard } from './FollowUserCard';
import { UserPreviewModal } from './UserPreviewModal';

interface UserSearchBarProps {
  currentUserId?: string;
}

export const UserSearchBar: React.FC<UserSearchBarProps> = ({
  currentUserId,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [previewUserId, setPreviewUserId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search query (300ms)
  useEffect(() => {
    if (query.trim().length < 2) {
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data, isLoading } = trpc.social.searchUsers.useQuery(
    { query: debouncedQuery, pageSize: 10 },
    {
      enabled: debouncedQuery.length >= 2,
      placeholderData: keepPreviousData,
    }
  );

  const handleFocus = () => setIsOpen(true);
  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
  };

  const handleUserClick = (userId: string) => {
    setPreviewUserId(userId);
    setIsOpen(false);
  };

  const handlePreviewClose = () => {
    setPreviewUserId(null);
    setQuery('');
    setDebouncedQuery('');
  };

  const showDropdown = isOpen && (debouncedQuery.length >= 2 || isLoading);

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          strokeWidth={2.5}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder="Buscar compañeros de estudio..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border-2 border-slate-200 border-b-[3px] bg-white text-[13px] font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-0 transition-colors"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-slate-200 border-b-[3px] shadow-lg z-50 max-h-[320px] overflow-y-auto hide-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={20} className="text-slate-400 animate-spin" />
              <span className="ml-2 text-[12px] font-bold text-slate-400">
                Buscando...
              </span>
            </div>
          ) : data?.users && data.users.length > 0 ? (
            <div className="p-2 space-y-1.5">
              {data.users.map((user) => (
                <FollowUserCard
                  key={user.id}
                  user={user}
                  currentUserId={currentUserId}
                  onClick={() => handleUserClick(user.id)}
                />
              ))}
              {data.total > data.users.length && (
                <p className="text-center text-[11px] font-bold text-slate-400 py-2">
                  y {data.total - data.users.length} más...
                </p>
              )}
            </div>
          ) : debouncedQuery.length >= 2 ? (
            <div className="flex flex-col items-center py-6">
              <Search size={24} className="text-slate-300 mb-2" />
              <p className="text-[12px] font-bold text-slate-400">
                No se encontraron usuarios
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Intenta con otro nombre o email
              </p>
            </div>
          ) : null}
        </div>
      )}

      <UserPreviewModal
        userId={previewUserId}
        onClose={handlePreviewClose}
      />
    </div>
  );
};
