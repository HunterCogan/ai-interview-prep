import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { InterviewSummary } from '@/lib/interviews'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

interface ScoreTrendChartProps {
  interviews: InterviewSummary[]
}

const chartConfig: ChartConfig = {
  averageScore: {
    label: 'Average score',
    color: 'var(--primary)',
  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function ScoreTrendChart({ interviews }: ScoreTrendChartProps) {
  const data = interviews
    .filter((interview) => interview.averageScore !== null)
    .slice()
    .reverse()
    .map((interview) => ({
      date: formatDate(interview.createdAt),
      averageScore: interview.averageScore as number,
    }))

  if (data.length < 2) {
    return null
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardDescription>Score trend</CardDescription>
        <CardTitle className="text-lg">Your average score over time</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-48 w-full">
          <AreaChart data={data} margin={{ left: -20, right: 12, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              domain={[1, 10]}
              ticks={[1, 5.5, 10]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={30}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel={false} indicator="dot" />} />
            <Area
              dataKey="averageScore"
              type="monotone"
              stroke="var(--color-averageScore)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="var(--color-averageScore)"
              fillOpacity={0.1}
              dot={{ r: 4, fill: 'var(--color-averageScore)', stroke: 'var(--card)', strokeWidth: 2 }}
              activeDot={{ r: 4, stroke: 'var(--card)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ScoreTrendChart
