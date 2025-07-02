import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { DataRow } from './DataVisualizationTool';

interface DashboardChartsProps {
  data: DataRow[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

const DashboardCharts = ({ data }: DashboardChartsProps) => {
  const chartData = useMemo(() => {
    // Orte-Verteilung (Top 10)
    const ortStats = data.reduce((acc, row) => {
      acc[row.Ort] = (acc[row.Ort] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topOrte = Object.entries(ortStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // Sparten-Verteilung  
    const sparteStats = data.reduce((acc, row) => {
      acc[row.Sparte] = (acc[row.Sparte] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const spartenData = Object.entries(sparteStats)
      .map(([name, value]) => ({ name, value }));

    // Art-Verteilung
    const artStats = data.reduce((acc, row) => {
      acc[row.Art] = (acc[row.Art] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const artData = Object.entries(artStats)
      .map(([name, value]) => ({ name, value }));

    // KW-Verteilung nach Orten (Top 10)
    const kwByOrt = data.reduce((acc, row) => {
      const kw = Number(row['KW-Zahl']) || 0;
      acc[row.Ort] = (acc[row.Ort] || 0) + kw;
      return acc;
    }, {} as Record<string, number>);
    
    const topKwOrte = Object.entries(kwByOrt)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, kw]) => ({ name, kw: Math.round(kw) }));

    // Zeitreihen-Daten (nach Jahren)
    const yearlyData = data.reduce((acc, row) => {
      if (row.Datum) {
        const year = new Date(row.Datum).getFullYear();
        if (year >= 2020 && year <= 2024) {
          acc[year] = (acc[year] || 0) + 1;
        }
      }
      return acc;
    }, {} as Record<number, number>);
    
    const timelineData = Object.entries(yearlyData)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);

    return {
      topOrte,
      spartenData,
      artData,
      topKwOrte,
      timelineData
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Orte Verteilung */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Top 10 Orte nach Anzahl</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.topOrte}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;