import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { subDays, format, isSameDay } from 'date-fns'

// Build last-7-days chart data from audit logs
function buildChartData(logs = []) {
  return Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i)
    const dayLogs = logs.filter((l) => isSameDay(new Date(l.timestamp), day))
    return {
      date: format(day, 'MMM d'),
      logins:   dayLogs.filter((l) => l.action === 'LOGIN').length,
      failures: dayLogs.filter((l) => l.action === 'FAILED_LOGIN' || l.action === 'LOCKED').length,
    }
  })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass border border-white/10 rounded-xl p-3 text-sm shadow-xl">
      <p className="font-display font-semibold text-white mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400 font-body capitalize">{p.name}:</span>
          <span className="font-mono font-semibold" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ActivityChart({ logs = [] }) {
  const data = buildChartData(logs)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#00f5c4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00f5c4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ff4757" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ff4757" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Mono' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, fontFamily: 'DM Mono', color: '#64748b' }}
        />
        <Area
          type="monotone"
          dataKey="logins"
          stroke="#00f5c4"
          strokeWidth={2}
          fill="url(#loginGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#00f5c4' }}
        />
        <Area
          type="monotone"
          dataKey="failures"
          stroke="#ff4757"
          strokeWidth={2}
          fill="url(#failGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#ff4757' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
