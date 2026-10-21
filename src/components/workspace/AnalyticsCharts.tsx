"use client"

import { format } from "date-fns"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { ForumAnalytics } from "@/lib/analytics"

// Marks follow the dataviz spec: 2px lines, 4px rounded bar ends on the data
// side, recessive grid and axes, hover tooltips, and a table view for each.

const weekLabel = (iso: string) => format(new Date(iso), "d MMM")

const weeklyConfig = {
  questions: { label: "Questions", color: "var(--series-1)" },
  answers: { label: "Answers", color: "var(--series-2)" },
} satisfies ChartConfig

export function WeeklyChart({ data }: { data: ForumAnalytics["weekly"] }) {
  return (
    <>
      <ChartContainer config={weeklyConfig} className="aspect-auto h-64 w-full">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="week"
            tickFormatter={weekLabel}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(w) => `Week of ${weekLabel(String(w))}`}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="questions"
            type="linear"
            stroke="var(--color-questions)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            dataKey="answers"
            type="linear"
            stroke="var(--color-answers)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ChartContainer>
      <DataTable
        columns={["Week of", "Questions", "Answers"]}
        rows={data.map((d) => [weekLabel(d.week), d.questions, d.answers])}
      />
    </>
  )
}

// One series of nominal or ordinal bars: one hue, no legend; the card title
// names it.
export function BarSeries({
  data,
  label,
  horizontal = false,
}: {
  data: { name: string; value: number }[]
  label: string
  horizontal?: boolean
}) {
  const config = {
    value: { label, color: "var(--series-1)" },
  } satisfies ChartConfig
  const height = horizontal ? Math.max(160, data.length * 36) : 240
  return (
    <>
      <ChartContainer
        config={config}
        className="aspect-auto w-full"
        style={{ height }}
      >
        {horizontal ? (
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            barCategoryGap={8}
          >
            <XAxis type="number" allowDecimals={false} hide />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={150}
              tickMargin={4}
              tickFormatter={(name: string) =>
                name.length > 20 ? `${name.slice(0, 19)}…` : name
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel={false} />}
            />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        ) : (
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            barCategoryGap={6}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              fontSize={11}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )}
      </ChartContainer>
      <DataTable
        columns={["", label]}
        rows={data.map((d) => [d.name, d.value])}
      />
    </>
  )
}

function DataTable({
  columns,
  rows,
}: {
  columns: string[]
  rows: (string | number)[][]
}) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
        Show data
      </summary>
      <table className="mt-2 w-full">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            {columns.map((c, i) => (
              <th
                key={i}
                className={
                  i ? "py-1 text-right font-normal" : "py-1 font-normal"
                }
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={
                    j ? "py-1 text-right font-mono tabular-nums" : "py-1"
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}
