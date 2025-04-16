
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart, LineChart, ResponsiveContainer, XAxis, YAxis, Bar, Pie, Line, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import { kpiData } from "@/data/mockData";
import PageLayout from "@/components/layout/PageLayout";

const COLORS = ['#9b87f5', '#b087f5', '#d6bcfa', '#e5e1f7', '#f3f1fb'];

export default function DashboardPage() {
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="section-heading">Salon Dashboard</h1>
          <Tabs defaultValue="daily" className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="daily" onClick={() => setPeriod('daily')}>Daily</TabsTrigger>
              <TabsTrigger value="monthly" onClick={() => setPeriod('monthly')}>Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <StatsCard
            title="Total Appointments"
            value={kpiData.appointments.total}
            description="Overall appointments"
            trend="+12% from last month"
            trendUp={true}
          />
          <StatsCard
            title="Revenue"
            value={`$${period === 'daily' ? '3,510' : '17,850'}`}
            description={period === 'daily' ? "This week" : "This month"}
            trend={period === 'daily' ? "+5% from last week" : "+8% from last month"}
            trendUp={true}
          />
          <StatsCard
            title="Completion Rate"
            value={`${(kpiData.appointments.completed / kpiData.appointments.total * 100).toFixed(1)}%`}
            description="Appointments attended"
            trend="+2.5% from last month"
            trendUp={true}
          />
          <StatsCard
            title="New Clients"
            value={kpiData.clients.new}
            description="This month"
            trend="+15% from last month"
            trendUp={true}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>
                {period === 'daily' ? 'Daily revenue for the past week' : 'Monthly revenue for the year'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={kpiData.revenue[period]}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Legend />
                    <Bar dataKey="amount" fill="#9b87f5" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Distribution</CardTitle>
              <CardDescription>
                Popularity of different services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={kpiData.services.distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {kpiData.services.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Status</CardTitle>
              <CardDescription>
                Distribution of appointment outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{kpiData.appointments.completed}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                  <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(kpiData.appointments.completed / kpiData.appointments.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{kpiData.appointments.cancelled}</div>
                  <div className="text-xs text-muted-foreground">Cancelled</div>
                  <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${(kpiData.appointments.cancelled / kpiData.appointments.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{kpiData.appointments.noShow}</div>
                  <div className="text-xs text-muted-foreground">No-show</div>
                  <div className="w-full h-2 bg-yellow-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${(kpiData.appointments.noShow / kpiData.appointments.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{kpiData.appointments.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="w-full h-2 bg-salon-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-salon-500 rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Retention</CardTitle>
              <CardDescription>
                New vs returning clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{kpiData.clients.new}</div>
                  <div className="text-xs text-muted-foreground">New Clients</div>
                  <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(kpiData.clients.new / kpiData.clients.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{kpiData.clients.returning}</div>
                  <div className="text-xs text-muted-foreground">Returning</div>
                  <div className="w-full h-2 bg-salon-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-salon-500 rounded-full"
                      style={{ width: `${(kpiData.clients.returning / kpiData.clients.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{kpiData.clients.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-500 rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium">Retention Rate</div>
                  <div className="text-sm font-medium">{(kpiData.clients.retention * 100).toFixed(1)}%</div>
                </div>
                <div className="w-full h-2 bg-salon-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-salon-500 rounded-full"
                    style={{ width: `${kpiData.clients.retention * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

function StatsCard({ title, value, description, trend, trendUp }: { 
  title: string;
  value: string | number;
  description: string;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className={`text-xs mt-1 ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
          {trend}
        </div>
      </CardContent>
    </Card>
  );
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};
