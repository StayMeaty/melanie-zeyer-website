import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/auth';
import { getBlogStats } from '../services/blogContent';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AdminDashboardProps {}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { user, logout } = useAuth();
  const [blogStats, setBlogStats] = useState<{
    totalPosts: number;
    totalCategories: number;
    totalTags: number;
    averageReadingTime: number;
  } | null>(null);
  const [draftsCount, setDraftsCount] = useState(0);

  // Load blog statistics on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getBlogStats();
        setBlogStats(stats);
        
        // Count drafts from localStorage
        const draftsJson = localStorage.getItem('blog_drafts');
        if (draftsJson) {
          const drafts = JSON.parse(draftsJson);
          setDraftsCount(Array.isArray(drafts) ? drafts.length : 0);
        }
      } catch (error) {
        console.error('Error loading blog stats:', error);
      }
    };

    loadStats();
  }, []);

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
      color: '#0097B2',
      margin: 0,
    },
    welcomeText: {
      color: '#666',
      margin: 0,
    },
    logoutButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
    cardDescription: {
      color: '#666',
      lineHeight: 1.5,
    },
    link: {
      color: '#0097B2',
      textDecoration: 'none',
      fontWeight: 'bold',
    },
    primaryLink: {
      color: '#0097B2',
      textDecoration: 'none',
      fontWeight: 'bold',
      display: 'inline-block',
      marginTop: '1rem',
      padding: '0.5rem 1rem',
      backgroundColor: '#f0f9ff',
      borderRadius: '4px',
      border: '1px solid #0097B2',
      transition: 'all 0.2s',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem',
      margin: '1rem 0',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px',
    },
    stat: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
    statNumber: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#0097B2',
    },
    statLabel: {
      fontSize: '0.8rem',
      color: '#666',
      marginTop: '0.25rem',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.welcomeText}>Willkommen, {user?.name}</p>
        </div>
        <button style={styles.logoutButton} onClick={logout}>
          Abmelden
        </button>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Blog Verwaltung</h2>
          <p style={styles.cardDescription}>
            Verwalten Sie Ihre Blog-Beiträge, erstellen Sie neue Artikel und bearbeiten Sie bestehende Inhalte.
          </p>
          {blogStats && (
            <div style={styles.statsGrid}>
              <div style={styles.stat}>
                <span style={styles.statNumber}>{blogStats.totalPosts}</span>
                <span style={styles.statLabel}>Veröffentlichte Beiträge</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>{draftsCount}</span>
                <span style={styles.statLabel}>Entwürfe</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>{blogStats.totalTags}</span>
                <span style={styles.statLabel}>Tags</span>
              </div>
            </div>
          )}
          <a href="/admin/blog" style={styles.primaryLink}>
            Zum Blog-Management →
          </a>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Benutzerstatistiken</h2>
          <p style={styles.cardDescription}>
            Übersicht über Website-Besucher und Engagement-Metriken.
          </p>
          <p style={styles.cardDescription}>
            <em>Coming Soon...</em>
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Einstellungen</h2>
          <p style={styles.cardDescription}>
            Konfigurieren Sie Website-Einstellungen und Admin-Präferenzen.
          </p>
          <p style={styles.cardDescription}>
            <em>Coming Soon...</em>
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>System Status</h2>
          <p style={styles.cardDescription}>
            <strong>Status:</strong> Online<br />
            <strong>Letzte Anmeldung:</strong> {user?.lastLogin?.toLocaleString('de-DE')}<br />
            <strong>Rolle:</strong> {user?.role}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;