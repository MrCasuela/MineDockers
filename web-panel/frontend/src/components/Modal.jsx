import { useState } from 'react'

export default function Modal({ isOpen, title, children, onClose, onConfirm, confirmText = 'Confirmar' }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg shadow-2xl max-w-md w-full mx-4 border border-slate-700">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>

        <div className="px-6 py-4">
          {children}
        </div>

        <div className="px-6 py-4 border-t border-slate-700 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
