'use client';

import React from 'react';
import type { SummaryRendererProps } from '../registry';
import type { TableBlock } from '@ingresa-pe/domain';

export function TableRenderer({ block }: SummaryRendererProps<TableBlock>) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-slate-200 shadow-sm">
      {block.title && (
        <div className="bg-slate-100 px-4 py-3 border-b-2 border-slate-200">
          <h4 className="font-black text-slate-800 text-sm">{block.title}</h4>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {block.headers.map((header, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left font-black text-slate-700 border-b-2 border-slate-200 whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 1 ? 'bg-slate-50/50' : ''}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-3 font-medium text-slate-600 border-b border-slate-100"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
