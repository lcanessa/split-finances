import { getInitials } from '../../lib/utils'
import { getFirstName } from '../../lib/expenseBalance'

export function PaidByToggle({ users, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {users.map((user) => {
        const selected = value === user.id
        return (
          <button
            key={user.id}
            type="button"
            onClick={() => onChange(user.id)}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              selected
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                selected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {getInitials(user.name)}
            </span>
            {getFirstName(user.name)}
          </button>
        )
      })}
    </div>
  )
}
