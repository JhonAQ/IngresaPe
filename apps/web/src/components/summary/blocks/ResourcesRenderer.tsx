'use client';

import React, { useMemo } from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import type { SummaryRendererProps } from '../registry';
import type { ResourceItem, ResourcesBlock } from '@ingresa-pe/domain';

interface ResourceMeta {
  domain: string;
  favicon: string;
  label: string;
  tint: string;
}

function getResourceMeta(url: string): ResourceMeta {
  let domain = 'Enlace externo';
  let label = 'Recurso';
  let tint = 'bg-slate-100 text-slate-600';

  try {
    const parsed = new URL(url);
    domain = parsed.hostname.replace(/^www\./, '');

    const hostLower = parsed.hostname.toLowerCase();
    if (hostLower.includes('youtube.com') || hostLower.includes('youtu.be')) {
      label = 'YouTube';
      tint = 'bg-red-50 text-red-600';
    } else if (hostLower.includes('wikipedia.org')) {
      label = 'Wikipedia';
      tint = 'bg-slate-100 text-slate-700';
    } else if (hostLower.includes('drive.google.com')) {
      label = 'Google Drive';
      tint = 'bg-green-50 text-green-600';
    } else if (hostLower.includes('classroom.google.com')) {
      label = 'Classroom';
      tint = 'bg-emerald-50 text-emerald-600';
    } else if (hostLower.includes('docs.google.com')) {
      label = 'Google Docs';
      tint = 'bg-blue-50 text-blue-600';
    } else if (hostLower.includes('github.com')) {
      label = 'GitHub';
      tint = 'bg-purple-50 text-purple-600';
    }
  } catch {
    // URL inválida: dejar valores por defecto.
  }

  return {
    domain,
    favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
    label,
    tint,
  };
}

function ResourceCard({ item }: { item: ResourceItem }) {
  const meta = useMemo(() => getResourceMeta(item.url), [item.url]);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-slate-300 transition-colors group"
    >
      <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${meta.tint}`}>
        <img
          src={meta.favicon}
          alt=""
          className="w-7 h-7 object-contain"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <Globe size={24} className="hidden" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-black text-slate-800 leading-tight truncate group-hover:text-blue-600 transition-colors">
          {item.title}
        </p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
          {meta.label} · {meta.domain}
        </p>
        {item.description && (
          <p className="text-sm text-slate-500 font-medium leading-snug mt-1 line-clamp-2">{item.description}</p>
        )}
      </div>
      <ExternalLink size={18} className="text-slate-300 shrink-0" />
    </a>
  );
}

export function ResourcesRenderer({ block }: SummaryRendererProps<ResourcesBlock>) {
  return (
    <div className="space-y-3">
      {block.title && (
        <h3 className="text-lg font-black text-slate-800 border-b-2 border-slate-200 pb-2">{block.title}</h3>
      )}
      <div className="grid gap-3">
        {block.items.map((item, index) => (
          <ResourceCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
