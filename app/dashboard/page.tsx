"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  BarChart3,
  PieChart,
  Clock,
  MapPin,
  Info,
  Layers,
  Zap,
  Globe,
  CreditCard,
  Calendar,
  Share2,
} from "lucide-react"
import Image from "next/image"
import { CursorTrail } from "@/components/cursor-trail"
import { FloatingOrbs } from "@/components/floating-orbs"
import { motion } from "framer-motion"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2"
import { DataTable } from "@/components/data-table"
import dynamic from "next/dynamic"

// Dynamically import the HeatmapComponent with no SSR
const HeatmapComponent = dynamic(() => import("@/components/heatmap-component"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-gray-900 rounded-lg">
      <p className="text-white">Loading heatmap...</p>
    </div>
  ),
})

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    queriesCount: 0,
    timeSpent: 0,
    countriesMentioned: new Set<string>(),
  })

  useEffect(() => {
    setMounted(true)

    // Initialize session stats
    const startTime = Date.now()
    const interval = setInterval(() => {
      setSessionStats((prev) => ({
        ...prev,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
      }))
    }, 1000)

    // Simulate a query being made
    const queryInterval = setInterval(() => {
      setSessionStats((prev) => ({
        ...prev,
        queriesCount: prev.queriesCount + 1,
      }))
    }, 30000) // Every 30 seconds

    return () => {
      clearInterval(interval)
      clearInterval(queryInterval)
    }
  }, [])

  if (!mounted) return null

  // Mock data for charts
  const topCitiesData = {
    labels: ["Puri", "Manali", "Jaipur", "Kovalam", "Darjeeling"],
    datasets: [
      {
        label: "Top 5 Cities Selected",
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          "rgba(65, 105, 225, 0.8)",
          "rgba(0, 191, 255, 0.8)",
          "rgba(138, 43, 226, 0.8)",
          "rgba(75, 0, 130, 0.8)",
          "rgba(100, 149, 237, 0.8)",
        ],
        borderColor: [
          "rgba(65, 105, 225, 1)",
          "rgba(0, 191, 255, 1)",
          "rgba(138, 43, 226, 1)",
          "rgba(75, 0, 130, 1)",
          "rgba(100, 149, 237, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const travelTypesData = {
    labels: ["Beach", "Mountain", "Historical", "Adventure", "Romantic", "Wildlife"],
    datasets: [
      {
        label: "Popular Travel Types",
        data: [45, 38, 30, 25, 20, 15],
        backgroundColor: "rgba(0, 191, 255, 0.8)",
        borderColor: "rgba(0, 191, 255, 1)",
        borderWidth: 1,
      },
    ],
  }

  const seasonalPreferencesData = {
    labels: ["Summer", "Winter", "Monsoon", "Spring", "Autumn"],
    datasets: [
      {
        label: "Seasonal Preferences",
        data: [40, 30, 10, 15, 5],
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const budgetDistributionData = {
    labels: ["<10k", "10k-20k", "20k-30k", "30k-50k", "50k-100k", ">100k"],
    datasets: [
      {
        label: "Budget Distribution",
        data: [10, 25, 30, 20, 10, 5],
        backgroundColor: "rgba(138, 43, 226, 0.8)",
        borderColor: "rgba(138, 43, 226, 1)",
        borderWidth: 1,
      },
    ],
  }

  const responseTimeData = {
    labels: [
      "Query 1",
      "Query 2",
      "Query 3",
      "Query 4",
      "Query 5",
      "Query 6",
      "Query 7",
      "Query 8",
      "Query 9",
      "Query 10",
    ],
    datasets: [
      {
        label: "Response Time (seconds)",
        data: [2.1, 2.4, 1.9, 2.5, 2.2, 2.0, 2.3, 2.6, 2.1, 2.3],
        borderColor: "rgba(65, 105, 225, 1)",
        backgroundColor: "rgba(65, 105, 225, 0.2)",
        tension: 0.4,
      },
    ],
  }

  // Mock data for table
  const tableData = [
    {
      id: 1,
      input: "I want a hill vacation under 25k in June from Kolkata",
      placeType: "Hills",
      season: "Summer",
      budget: "25k",
      source: "Kolkata",
    },
    {
      id: 2,
      input: "Find me romantic places in Europe for winter under 60k from Mumbai",
      placeType: "Romantic",
      season: "Winter",
      budget: "60k",
      source: "Mumbai",
    },
    {
      id: 3,
      input: "Beach destination for honeymoon in December under 40k from Delhi",
      placeType: "Beach",
      season: "Winter",
      budget: "40k",
      source: "Delhi",
    },
    {
      id: 4,
      input: "Historical places to visit in October with 30k budget from Chennai",
      placeType: "Historical",
      season: "Autumn",
      budget: "30k",
      source: "Chennai",
    },
    {
      id: 5,
      input: "Adventure trip in Himalayas during May with 50k budget from Bangalore",
      placeType: "Adventure",
      season: "Summer",
      budget: "50k",
      source: "Bangalore",
    },
  ]

  const columns = [
    {
      accessorKey: "input",
      header: "Input Query",
    },
    {
      accessorKey: "placeType",
      header: "Place Type",
    },
    {
      accessorKey: "season",
      header: "Season",
    },
    {
      accessorKey: "budget",
      header: "Budget",
    },
    {
      accessorKey: "source",
      header: "Source",
    },
  ]

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <CursorTrail />
      <FloatingOrbs />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-secondary shadow-lg shadow-secondary/20">
              <Image src="/images/logo-compass.png" alt="Smart Tour Logo" fill className="object-cover" />
            </div>
            <div className="relative h-12 w-48">
              <Image src="/images/logo-text.png" alt="Smart Tour" fill className="object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gradient"></h1>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border border-white/10 bg-card/50 backdrop-blur-sm card-hover-effect card-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Queries Analyzed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gradient">15</p>
                <p className="text-sm text-muted-foreground">Session queries: {sessionStats.queriesCount}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border border-white/10 bg-card/50 backdrop-blur-sm card-hover-effect card-glow-secondary">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 text-secondary" />
                  Avg Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gradient">2.3s</p>
                <p className="text-sm text-muted-foreground">
                  Session time: {Math.floor(sessionStats.timeSpent / 60)}m {sessionStats.timeSpent % 60}s
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border border-white/10 bg-card/50 backdrop-blur-sm card-hover-effect card-glow-accent">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  Mapping Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gradient">10 cities</p>
                <p className="text-sm text-muted-foreground">Across 5 states in India</p>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border border-white/10 bg-card/50 backdrop-blur-sm h-full card-hover-effect card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Top 5 Cities Selected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Pie
                    data={topCitiesData}
                    options={{
                      maintainAspectRatio: false,
                      animation: {
                        animateRotate: true,
                        animateScale: true,
                        duration: 2000,
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="border border-white/10 bg-card/50 backdrop-blur-sm h-full card-hover-effect card-glow-secondary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-secondary" />
                  Popular Travel Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Bar
                    data={travelTypesData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                      animation: {
                        duration: 2000,
                        easing: "easeOutBounce",
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="border border-white/10 bg-card/50 backdrop-blur-sm h-full card-hover-effect card-glow-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-accent" />
                  Seasonal Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Doughnut
                    data={seasonalPreferencesData}
                    options={{
                      maintainAspectRatio: false,
                      animation: {
                        animateRotate: true,
                        animateScale: true,
                        duration: 2000,
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="border border-white/10 bg-card/50 backdrop-blur-sm h-full card-hover-effect card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Budget Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Bar
                    data={budgetDistributionData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                      animation: {
                        duration: 1800,
                        easing: "easeInOutQuart",
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="border border-white/10 bg-card/50 backdrop-blur-sm card-hover-effect card-glow-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-secondary" />
                Gemini Prompt-Response Time
              </CardTitle>
              <CardDescription>Time taken for Gemini to respond to queries (in seconds)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Line
                  data={responseTimeData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        suggestedMax: 3,
                      },
                    },
                    animation: {
                      duration: 2000,
                      easing: "easeOutQuad",
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card className="border border-white/10 bg-card/50 backdrop-blur-sm card-hover-effect card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                Sample Chat Queries
              </CardTitle>
              <CardDescription>User input queries and extracted information</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={tableData} />
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <Card className="border border-white/10 bg-card/50 backdrop-blur-sm card-hover-effect card-glow-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                India Heat-Mapping
              </CardTitle>
              <CardDescription>Most selected regions by users</CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[500px] overflow-hidden">{mounted && <HeatmapComponent />}</CardContent>
          </Card>
        </motion.section>

        {/* Future Integrations Section */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <Card className="border border-white/10 bg-card/50 backdrop-blur-sm card-hover-effect card-glow-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Future Integrations
              </CardTitle>
              <CardDescription>Upcoming features and integrations on our roadmap</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: <Globe className="h-8 w-8 text-secondary" />,
                    title: "International Destinations",
                    description: "Expanding our recommendations to global destinations beyond India",
                    eta: "Q2 2025",
                  },
                  {
                    icon: <CreditCard className="h-8 w-8 text-primary" />,
                    title: "Booking Integration",
                    description: "Direct booking capabilities with major travel platforms",
                    eta: "Q3 2025",
                  },
                  {
                    icon: <Calendar className="h-8 w-8 text-accent" />,
                    title: "Itinerary Builder",
                    description: "AI-powered day-by-day travel itinerary creation",
                    eta: "Q2 2025",
                  },
                  {
                    icon: <Share2 className="h-8 w-8 text-secondary" />,
                    title: "Social Sharing",
                    description: "Share and collaborate on travel plans with friends and family",
                    eta: "Q3 2025",
                  },
                  {
                    icon: <Zap className="h-8 w-8 text-primary" />,
                    title: "Real-time Pricing",
                    description: "Live pricing data from hotels, airlines, and attractions",
                    eta: "Q3 2025",
                  },
                  {
                    icon: <MapPin className="h-8 w-8 text-accent" />,
                    title: "AR Destination Preview",
                    description: "Augmented reality previews of recommended destinations",
                    eta: "Q4 2025",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-muted/20 backdrop-blur-sm p-6 rounded-xl border border-white/10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="p-3 bg-card/50 rounded-full">{item.icon}</div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                        Expected: {item.eta}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <Card className="border border-white/10 bg-card/50 backdrop-blur-sm card-hover-effect card-glow-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-secondary" />
                System Workflow
              </CardTitle>
              <CardDescription>How Smart Tour processes user queries and generates recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-4xl h-auto rounded-lg border border-white/10 flex items-center justify-center overflow-hidden p-4">
                  <Image
                    src="/images/system-workflow.png"
                    alt="Smart Tour System Workflow"
                    width={800}
                    height={600}
                    className="object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </main>
  )
}
