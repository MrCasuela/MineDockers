import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function StatCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-600/10',
    green: 'text-green-400 bg-green-600/10',
    red: 'text-red-400 bg-red-600/10',
    purple: 'text-purple-400 bg-purple-600/10',
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon size={32} />
          </div>
        )}
      </div>
    </div>
  )
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'btn-primary',
    success: 'btn-success',
    danger: 'btn-danger',
    secondary: 'btn-secondary',
  }

  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function TimeAgo({ date }) {
  return (
    <span title={new Date(date).toLocaleString()}>
      {formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })}
    </span>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  )
}

export function EmptyState({ message, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
      {Icon && <Icon size={48} className="mb-4 opacity-50" />}
      <p>{message}</p>
    </div>
  )
}
