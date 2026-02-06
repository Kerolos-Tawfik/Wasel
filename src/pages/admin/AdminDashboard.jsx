import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./AdminDashboard.module.css";
import { adminAPI } from "../../lib/adminApiService";
import {
  Users,
  FileCheck,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
} from "lucide-react";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = React.useState({
    total_users: 0,
    confirmed_requests: 0,
    pending_requests: 0,
    completed_requests: 0,
    in_progress_requests: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getStats();
        if (response.ok) {
          const data = await response.json();
          setStats({
            total_users: data.total_users || 0,
            confirmed_requests: data.confirmed_requests || 0,
            pending_requests: data.pending_requests || 0,
            completed_requests: data.completed_requests || 0,
            in_progress_requests: data.in_progress_requests || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const totalRequests = stats.confirmed_requests + stats.pending_requests;
  const confirmedPercentage =
    totalRequests > 0 ? (stats.confirmed_requests / totalRequests) * 100 : 0;
  const pendingPercentage =
    totalRequests > 0 ? (stats.pending_requests / totalRequests) * 100 : 0;

  // Calculate real metrics
  const completionRate =
    totalRequests > 0
      ? ((stats.completed_requests / totalRequests) * 100).toFixed(1)
      : 0;
  const acceptanceRate =
    totalRequests > 0
      ? ((stats.confirmed_requests / totalRequests) * 100).toFixed(1)
      : 0;

  const StatCard = ({ icon: Icon, title, value, color, gradient }) => (
    <div className={styles.statCard} style={{ background: gradient }}>
      <div className={styles.statCardContent}>
        <div className={styles.statIcon} style={{ background: color }}>
          <Icon size={22} color="white" />
        </div>
        <div className={styles.statInfo}>
          <p className={styles.statTitle}>{title}</p>
          <h3 className={styles.statValue}>
            {loading ? "..." : value.toLocaleString()}
          </h3>
        </div>
      </div>
      <div className={styles.statDecoration} style={{ background: color }} />
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>{t("admin.dashboard.title")}</h1>
          <p className={styles.pageSubtitle}>{t("admin.dashboard.subtitle")}</p>
        </div>
        <div className={styles.headerActions}>
          <Activity className={styles.activityIcon} size={18} />
          <span className={styles.liveIndicator}>
            {t("admin.dashboard.live")}
          </span>
        </div>
      </div>

      {/* Stats Grid - Harmonious Colors */}
      <div className={styles.statsGrid}>
        <StatCard
          icon={Users}
          title={t("admin.dashboard.total_users")}
          value={stats.total_users}
          color="#6366f1"
          gradient="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
        />
        <StatCard
          icon={FileCheck}
          title={t("admin.dashboard.confirmed_requests")}
          value={stats.confirmed_requests}
          color="#10b981"
          gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
        />
        <StatCard
          icon={Clock}
          title={t("admin.dashboard.pending_requests")}
          value={stats.pending_requests}
          color="#f59e0b"
          gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
        />
        <StatCard
          icon={CheckCircle2}
          title={t("admin.dashboard.completed_requests")}
          value={stats.completed_requests}
          color="#3b82f6"
          gradient="linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)"
        />
        <StatCard
          icon={PlayCircle}
          title={t("admin.dashboard.in_progress_requests")}
          value={stats.in_progress_requests}
          color="#8b5cf6"
          gradient="linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)"
        />
        <StatCard
          icon={TrendingUp}
          title={t("admin.dashboard.total_requests")}
          value={totalRequests}
          color="#06b6d4"
          gradient="linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)"
        />
      </div>

      {/* Charts Section */}
      <div className={styles.chartsContainer}>
        {/* Progress Bars Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>
              {t("admin.dashboard.requests_overview")}
            </h3>
            <div className={styles.chartBadge}>
              <Activity size={12} />
              <span>{t("admin.dashboard.live_analysis")}</span>
            </div>
          </div>

          <div className={styles.progressBars}>
            <div className={styles.progressItem}>
              <div className={styles.progressHeader}>
                <div className={styles.progressLabel}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>{t("admin.dashboard.confirmed")}</span>
                </div>
                <span className={styles.progressValue}>
                  {stats.confirmed_requests}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${confirmedPercentage}%`,
                    background:
                      "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
                  }}
                >
                  <span className={styles.progressPercent}>
                    {confirmedPercentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.progressItem}>
              <div className={styles.progressHeader}>
                <div className={styles.progressLabel}>
                  <AlertCircle size={16} color="#f59e0b" />
                  <span>{t("admin.dashboard.pending")}</span>
                </div>
                <span className={styles.progressValue}>
                  {stats.pending_requests}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${pendingPercentage}%`,
                    background:
                      "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)",
                  }}
                >
                  <span className={styles.progressPercent}>
                    {pendingPercentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.chartFooter}>
            <div className={styles.totalIndicator}>
              <span className={styles.totalLabel}>
                {t("admin.dashboard.total")}
              </span>
              <span className={styles.totalValue}>{totalRequests}</span>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>
              {t("admin.dashboard.distribution")}
            </h3>
          </div>

          <div className={styles.donutContainer}>
            <svg viewBox="0 0 200 200" className={styles.donutChart}>
              {totalRequests > 0 ? (
                <>
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="transparent"
                    stroke="url(#confirmedGradient)"
                    strokeWidth="40"
                    strokeDasharray={`${confirmedPercentage * 4.4} 440`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                    className={styles.donutArc}
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="transparent"
                    stroke="url(#pendingGradient)"
                    strokeWidth="40"
                    strokeDasharray={`${pendingPercentage * 4.4} 440`}
                    strokeDashoffset={`-${confirmedPercentage * 4.4}`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                    className={styles.donutArc}
                  />

                  <defs>
                    <linearGradient
                      id="confirmedGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                    <linearGradient
                      id="pendingGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                  </defs>

                  <circle cx="100" cy="100" r="50" fill="white" />
                  <text
                    x="100"
                    y="90"
                    textAnchor="middle"
                    fontSize="28"
                    fontWeight="700"
                    fill="#1f2937"
                  >
                    {totalRequests}
                  </text>
                  <text
                    x="100"
                    y="110"
                    textAnchor="middle"
                    fontSize="11"
                    fill="#6b7280"
                    fontWeight="500"
                  >
                    {t("admin.dashboard.total")}
                  </text>
                </>
              ) : (
                <>
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="transparent"
                    stroke="#e5e7eb"
                    strokeWidth="40"
                  />
                  <circle cx="100" cy="100" r="50" fill="white" />
                  <text
                    x="100"
                    y="105"
                    textAnchor="middle"
                    fontSize="13"
                    fill="#9ca3af"
                  >
                    {t("admin.dashboard.no_data")}
                  </text>
                </>
              )}
            </svg>

            <div className={styles.donutLegend}>
              <div className={styles.legendItem}>
                <div
                  className={styles.legendDot}
                  style={{
                    background: "linear-gradient(135deg, #10b981, #34d399)",
                  }}
                />
                <div className={styles.legendText}>
                  <span className={styles.legendLabel}>
                    {t("admin.dashboard.confirmed")}
                  </span>
                  <span className={styles.legendValue}>
                    {confirmedPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className={styles.legendItem}>
                <div
                  className={styles.legendDot}
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                  }}
                />
                <div className={styles.legendText}>
                  <span className={styles.legendLabel}>
                    {t("admin.dashboard.pending")}
                  </span>
                  <span className={styles.legendValue}>
                    {pendingPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown Bar Chart - Only Completed and In Progress */}
      <div className={styles.statusChart}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>
            {t("admin.dashboard.status_breakdown")}
          </h3>
        </div>
        <div className={styles.statusBars}>
          <div className={styles.statusBarItem}>
            <div className={styles.statusBarHeader}>
              <div className={styles.statusBarLabel}>
                <CheckCircle2 size={16} color="#3b82f6" />
                <span>{t("admin.dashboard.completed")}</span>
              </div>
              <span className={styles.statusBarValue}>
                {stats.completed_requests}
              </span>
            </div>
            <div className={styles.statusBarTrack}>
              <div
                className={styles.statusBarFill}
                style={{
                  width: `${totalRequests > 0 ? (stats.completed_requests / totalRequests) * 100 : 0}%`,
                  background: "#3b82f6",
                }}
              />
            </div>
          </div>

          <div className={styles.statusBarItem}>
            <div className={styles.statusBarHeader}>
              <div className={styles.statusBarLabel}>
                <PlayCircle size={16} color="#8b5cf6" />
                <span>{t("admin.dashboard.in_progress")}</span>
              </div>
              <span className={styles.statusBarValue}>
                {stats.in_progress_requests}
              </span>
            </div>
            <div className={styles.statusBarTrack}>
              <div
                className={styles.statusBarFill}
                style={{
                  width: `${totalRequests > 0 ? (stats.in_progress_requests / totalRequests) * 100 : 0}%`,
                  background: "#8b5cf6",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row - 3 items only */}
      <div className={styles.quickStats}>
        <div className={styles.quickStatItem}>
          <div
            className={styles.quickStatIcon}
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <TrendingUp size={20} color="white" />
          </div>
          <div className={styles.quickStatInfo}>
            <p className={styles.quickStatLabel}>
              {t("admin.dashboard.acceptance_rate")}
            </p>
            <h4 className={styles.quickStatValue}>{acceptanceRate}%</h4>
            <p className={styles.quickStatSubtext}>
              {t("admin.dashboard.of_total")}
            </p>
          </div>
        </div>

        <div className={styles.quickStatItem}>
          <div
            className={styles.quickStatIcon}
            style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}
          >
            <Activity size={20} color="white" />
          </div>
          <div className={styles.quickStatInfo}>
            <p className={styles.quickStatLabel}>
              {t("admin.dashboard.today_activity")}
            </p>
            <h4 className={styles.quickStatValue}>{stats.pending_requests}</h4>
            <p className={styles.quickStatSubtext}>
              {t("admin.dashboard.new_requests")}
            </p>
          </div>
        </div>

        <div className={styles.quickStatItem}>
          <div
            className={styles.quickStatIcon}
            style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}
          >
            <CheckCircle2 size={20} color="white" />
          </div>
          <div className={styles.quickStatInfo}>
            <p className={styles.quickStatLabel}>
              {t("admin.dashboard.completion_rate")}
            </p>
            <h4 className={styles.quickStatValue}>{completionRate}%</h4>
            <p className={styles.quickStatSubtext}>
              {t("admin.dashboard.of_confirmed")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
