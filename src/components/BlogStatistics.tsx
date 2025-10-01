import { useState, useMemo } from 'react';
import { BlogPost, BlogCategory, BLOG_CATEGORIES } from '../types/blog';
import { APP_COLORS } from '../types';

export interface BlogStatisticsProps {
  posts: BlogPost[];
  onPostClick?: (post: BlogPost) => void;
  timeRange?: '7d' | '30d' | '3m' | '1y' | 'all';
}

interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const BlogStatistics: React.FC<BlogStatisticsProps> = ({
  posts,
  onPostClick,
  timeRange = 'all'
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>(timeRange);
  const [isExporting, setIsExporting] = useState(false);

  // Filter posts based on time range
  const filteredPosts = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedTimeRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return posts;
    }
    
    return posts.filter(post => post.publishedAt >= cutoffDate);
  }, [posts, selectedTimeRange]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalPosts = filteredPosts.length;
    const publishedThisWeek = posts.filter(post => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return post.publishedAt >= weekAgo && post.status === 'published';
    }).length;

    const totalReadingTime = filteredPosts.reduce((sum, post) => sum + (post.readingTime || 0), 0);
    const averageReadingTime = totalPosts > 0 ? Math.round(totalReadingTime / totalPosts) : 0;

    const categoryCount = filteredPosts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<BlogCategory, number>);

    const mostPopularCategory = Object.entries(categoryCount).reduce((max, [category, count]) => 
      count > (max.count || 0) ? { category, count } : max, 
      { category: '', count: 0 }
    );

    const totalWords = filteredPosts.reduce((sum, post) => {
      const wordCount = post.content.trim().split(/\s+/).length;
      return sum + wordCount;
    }, 0);

    const drafts = posts.filter(post => post.status === 'draft').length;
    const featured = filteredPosts.filter(post => post.featured).length;

    const authorCount = filteredPosts.reduce((acc, post) => {
      acc[post.author] = (acc[post.author] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPosts,
      publishedThisWeek,
      averageReadingTime,
      mostPopularCategory,
      totalWords,
      drafts,
      featured,
      authorCount,
      categoryCount
    };
  }, [filteredPosts, posts]);

  // Chart data calculations
  const categoryChartData: ChartData[] = useMemo(() => {
    return BLOG_CATEGORIES.map(category => ({
      label: category.displayName,
      value: statistics.categoryCount[category.category] || 0,
      color: category.color || APP_COLORS.primary
    })).filter(item => item.value > 0);
  }, [statistics.categoryCount]);

  const postsOverTimeData: ChartData[] = useMemo(() => {
    const monthlyData: Record<string, number> = {};
    
    filteredPosts.forEach(post => {
      const monthKey = post.publishedAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 months
      .map(([month, count]) => ({
        label: new Date(month + '-01').toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }),
        value: count,
        color: APP_COLORS.primary
      }));
  }, [filteredPosts]);

  const statusData: ChartData[] = useMemo(() => {
    const published = posts.filter(p => p.status === 'published').length;
    const drafts = posts.filter(p => p.status === 'draft').length;
    const archived = posts.filter(p => p.status === 'archived').length;

    return [
      { label: 'Veröffentlicht', value: published, color: APP_COLORS.primary },
      { label: 'Entwürfe', value: drafts, color: APP_COLORS.accent },
      { label: 'Archiviert', value: archived, color: APP_COLORS.secondary }
    ].filter(item => item.value > 0);
  }, [posts]);

  const topPostsData: ChartData[] = useMemo(() => {
    return filteredPosts
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 10)
      .map(post => ({
        label: post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title,
        value: post.viewCount || 0,
        color: APP_COLORS.primary
      }));
  }, [filteredPosts]);

  const recentPosts = useMemo(() => {
    return filteredPosts.slice(0, 10);
  }, [filteredPosts]);

  const tagData = useMemo(() => {
    const tagCount: Record<string, number> = {};
    filteredPosts.forEach(post => {
      post.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }, [filteredPosts]);

  // Export functionality
  const exportToCSV = () => {
    setIsExporting(true);
    
    const csvData = [
      ['Statistik', 'Wert'],
      ['Gesamte Beiträge', statistics.totalPosts.toString()],
      ['Veröffentlicht diese Woche', statistics.publishedThisWeek.toString()],
      ['Durchschnittliche Lesezeit (Min)', statistics.averageReadingTime.toString()],
      ['Beliebteste Kategorie', statistics.mostPopularCategory.category],
      ['Gesamte Wörter', statistics.totalWords.toString()],
      ['Entwürfe', statistics.drafts.toString()],
      ['Featured Beiträge', statistics.featured.toString()],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `blog-statistiken-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setIsExporting(false), 1000);
  };

  const copyToClipboard = () => {
    const statsText = `
Blog Statistiken (${selectedTimeRange})
================================
Gesamte Beiträge: ${statistics.totalPosts}
Veröffentlicht diese Woche: ${statistics.publishedThisWeek}
Durchschnittliche Lesezeit: ${statistics.averageReadingTime} Min
Beliebteste Kategorie: ${statistics.mostPopularCategory.category}
Gesamte Wörter: ${statistics.totalWords}
Entwürfe: ${statistics.drafts}
Featured Beiträge: ${statistics.featured}
`;
    
    navigator.clipboard.writeText(statsText).then(() => {
      alert('Statistiken in die Zwischenablage kopiert!');
    });
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      padding: '2rem',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: APP_COLORS.primary,
      margin: 0,
    },
    controls: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
    },
    select: {
      padding: '0.5rem',
      borderRadius: '4px',
      border: '1px solid #ddd',
      backgroundColor: 'white',
      color: '#333',
    },
    button: {
      backgroundColor: APP_COLORS.primary,
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      opacity: isExporting ? 0.7 : 1,
    },
    buttonSecondary: {
      backgroundColor: APP_COLORS.secondary,
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    card: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    cardTitle: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#333',
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '0.25rem',
    },
    statSubtitle: {
      fontSize: '0.9rem',
      color: '#666',
    },
    chartContainer: {
      marginTop: '1rem',
      height: '200px',
      position: 'relative' as const,
    },
    chartGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    barChart: {
      display: 'flex',
      alignItems: 'end',
      height: '150px',
      gap: '8px',
      padding: '1rem 0',
    },
    bar: {
      backgroundColor: APP_COLORS.primary,
      borderRadius: '4px 4px 0 0',
      minWidth: '20px',
      flex: 1,
      display: 'flex',
      alignItems: 'end',
      justifyContent: 'center',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: 'bold',
    },
    pieChart: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '150px',
      position: 'relative' as const,
    },
    legend: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '1rem',
      marginTop: '1rem',
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem',
    },
    legendColor: {
      width: '12px',
      height: '12px',
      borderRadius: '2px',
    },
    recentPosts: {
      display: 'grid',
      gap: '0.5rem',
    },
    postItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    postTitle: {
      fontWeight: 'bold',
      color: '#333',
      flex: 1,
      marginRight: '1rem',
    },
    postMeta: {
      fontSize: '0.8rem',
      color: '#666',
      display: 'flex',
      gap: '1rem',
    },
    tagCloud: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem',
      marginTop: '1rem',
    },
    tag: {
      padding: '0.25rem 0.5rem',
      backgroundColor: APP_COLORS.accent,
      color: '#333',
      borderRadius: '12px',
      fontSize: '0.8rem',
      fontWeight: 'bold',
    },
  };

  const renderBarChart = (data: ChartData[], title: string) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>{title}</h3>
        <div style={styles.barChart}>
          {data.map((item, index) => (
            <div
              key={index}
              style={{
                ...styles.bar,
                height: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '5px',
                backgroundColor: item.color,
                minHeight: '20px',
              }}
              title={`${item.label}: ${item.value}`}
            >
              {item.value > 0 && item.value}
            </div>
          ))}
        </div>
        <div style={styles.legend}>
          {data.map((item, index) => (
            <div key={index} style={styles.legendItem}>
              <div style={{...styles.legendColor, backgroundColor: item.color}} />
              <span>{item.label}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = (data: ChartData[], title: string) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>{title}</h3>
        <div style={styles.pieChart}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            {data.map((item, index) => {
              const percentage = item.value / total;
              const startAngle = cumulativePercentage * 360;
              const endAngle = (cumulativePercentage + percentage) * 360;
              
              const x1 = 60 + 50 * Math.cos((startAngle - 90) * Math.PI / 180);
              const y1 = 60 + 50 * Math.sin((startAngle - 90) * Math.PI / 180);
              const x2 = 60 + 50 * Math.cos((endAngle - 90) * Math.PI / 180);
              const y2 = 60 + 50 * Math.sin((endAngle - 90) * Math.PI / 180);
              
              const largeArc = percentage > 0.5 ? 1 : 0;
              
              const pathData = [
                `M 60 60`,
                `L ${x1} ${y1}`,
                `A 50 50 0 ${largeArc} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');
              
              cumulativePercentage += percentage;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>
        <div style={styles.legend}>
          {data.map((item, index) => (
            <div key={index} style={styles.legendItem}>
              <div style={{...styles.legendColor, backgroundColor: item.color}} />
              <span>{item.label}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const statCards: StatCard[] = [
    {
      title: 'Gesamte Beiträge',
      value: statistics.totalPosts,
      color: APP_COLORS.primary,
    },
    {
      title: 'Veröffentlicht diese Woche',
      value: statistics.publishedThisWeek,
      color: APP_COLORS.accent,
    },
    {
      title: 'Durchschnittliche Lesezeit',
      value: `${statistics.averageReadingTime} Min`,
      color: APP_COLORS.secondary,
    },
    {
      title: 'Beliebteste Kategorie',
      value: BLOG_CATEGORIES.find(c => c.category === statistics.mostPopularCategory.category)?.displayName || '-',
      subtitle: `${statistics.mostPopularCategory.count} Beiträge`,
      color: APP_COLORS.primary,
    },
    {
      title: 'Gesamte Wörter',
      value: statistics.totalWords.toLocaleString('de-DE'),
      color: APP_COLORS.accent,
    },
    {
      title: 'Entwürfe',
      value: statistics.drafts,
      color: APP_COLORS.secondary,
    },
    {
      title: 'Featured Beiträge',
      value: statistics.featured,
      color: APP_COLORS.primary,
    },
    {
      title: 'Autor Beiträge',
      value: Object.keys(statistics.authorCount).length,
      subtitle: `${Object.values(statistics.authorCount).reduce((a, b) => Math.max(a, b), 0)} max`,
      color: APP_COLORS.accent,
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Blog Statistiken</h1>
        <div style={styles.controls}>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            style={styles.select}
          >
            <option value="all">Alle Zeit</option>
            <option value="1y">Letztes Jahr</option>
            <option value="3m">Letzte 3 Monate</option>
            <option value="30d">Letzte 30 Tage</option>
            <option value="7d">Letzte 7 Tage</option>
          </select>
          <button
            onClick={exportToCSV}
            disabled={isExporting}
            style={styles.button}
          >
            {isExporting ? 'Exportiere...' : 'CSV Export'}
          </button>
          <button
            onClick={copyToClipboard}
            style={styles.buttonSecondary}
          >
            Kopieren
          </button>
          <button
            onClick={() => window.print()}
            style={styles.buttonSecondary}
          >
            Drucken
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={styles.grid}>
        {statCards.map((stat, index) => (
          <div key={index} style={styles.card}>
            <h3 style={styles.cardTitle}>{stat.title}</h3>
            <div style={{...styles.statValue, color: stat.color}}>
              {stat.value}
            </div>
            {stat.subtitle && (
              <div style={styles.statSubtitle}>{stat.subtitle}</div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={styles.chartGrid}>
        {renderBarChart(categoryChartData, 'Beiträge nach Kategorie')}
        {renderBarChart(postsOverTimeData, 'Beiträge über Zeit (Letzte 12 Monate)')}
        {renderPieChart(statusData, 'Status Verteilung')}
        {renderBarChart(topPostsData, 'Top 10 Beiträge nach Aufrufen')}
      </div>

      {/* Recent Activity & Analytics */}
      <div style={styles.chartGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Neueste Aktivität</h3>
          <div style={styles.recentPosts}>
            {recentPosts.map((post) => (
              <div
                key={post.id}
                style={styles.postItem}
                onClick={() => onPostClick?.(post)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
              >
                <div style={styles.postTitle}>
                  {post.title.length > 40 ? post.title.substring(0, 40) + '...' : post.title}
                </div>
                <div style={styles.postMeta}>
                  <span>{post.status}</span>
                  <span>{post.publishedAt.toLocaleDateString('de-DE')}</span>
                  <span>{post.viewCount || 0} Aufrufe</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Tag Analytik</h3>
          <p style={styles.statSubtitle}>Top 20 verwendete Tags</p>
          <div style={styles.tagCloud}>
            {tagData.map((tag, index) => (
              <span
                key={index}
                style={{
                  ...styles.tag,
                  fontSize: `${Math.max(0.7, Math.min(1.2, tag.count * 0.1 + 0.7))}rem`,
                }}
                title={`${tag.tag}: ${tag.count} mal verwendet`}
              >
                {tag.tag} ({tag.count})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogStatistics;