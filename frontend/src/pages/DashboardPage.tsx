import React, { useState, useEffect } from 'react';
import HeaderNoBack from '../components/HeaderNoBack';
import Timer from '../components/Timer';
import ClockingButtons from '../components/ClockingButtons';
import MonthlyAttendance from '../components/MonthlyAttendance';
import TodayAttendanceHistory from '../components/TodayAttendanceHistory';

// This is a placeholder type. Make sure it matches your actual data structure.
type AttendanceRecord = {
  id: string;
  clockIn: string;
  clockOut: string | null;
};

function DashboardPage() {
  const [flashMessage, setFlashMessage] = useState<{ type: string, text: string } | null>(null);
  const [status, setStatus] = useState<string>('not_clocked_in');
  const apiUrl = import.meta.env.VITE_API_URL;

 
  const authorizedFetch = async (url: string, method: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error("Token not found. Please login.");
    }

    const res = await fetch(`${apiUrl}${url}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'An unknown error occurred' }));
      throw new Error(errorData.detail || 'Request failed');
    }
    return res.json();
  };

  const fetchStatus = async () => {
    try {
      const data = await authorizedFetch('/me/status', 'GET');
      setStatus(data.status);
    } catch (e) {
      console.error("Failed to fetch status:", e);
      setStatus('error');
    }
  };

  
  useEffect(() => {
    fetchStatus();
    
  }, []);

  return (
    <div style={styles.pageContainer}>
      <HeaderNoBack title="打刻画面" />
      <div style={styles.contentWrapper}>
        <div style={styles.topSection}>
          <Timer />
          <ClockingButtons
            isClockedIn={status === 'working'}
            authorizedFetch={authorizedFetch}
            onActionSuccess={fetchStatus} 
            setFlashMessage={setFlashMessage}
          />
        </div>
        {flashMessage && (
          <p style={styles.flashMessage(flashMessage.type)}>
            {flashMessage.text}
          </p>
        )}
        <div style={styles.attendanceSection}>
          <div style={styles.attendanceItem}>
            <MonthlyAttendance authorizedFetch={authorizedFetch} />
          </div>
          <div style={styles.attendanceItem}>
            <TodayAttendanceHistory authorizedFetch={authorizedFetch} />
          </div>
        </div> 
      </div>
    </div>
  );
}



// --- Styles ---
// We define styles here to keep the JSX clean.

const styles = {
  // The main container for the entire page
  pageContainer: {
    width: '100%',
  },
  // A wrapper for the main content area to control its width and centering
  contentWrapper: {
    maxWidth: '900px', // Sets a max width for content, preventing it from being too wide on large screens
    width: '90-0%',      // Ensures it's responsive on smaller screens
    margin: '0 auto',  // The key to centering the block on the page
    padding: '20px',   // Adds some space inside the content area
  },
  // Styles for the top section containing the timer and buttons
  topSection: {
    marginBottom: '30px',
    textAlign: 'center' as 'center',
  },
  // A function to return styles for the flash message based on its type (error or success)
  flashMessage: (type: string) => ({
    color: type === 'error' ? '#D32F2F' : '#388E3C', // Red for error, green for success
    backgroundColor: type === 'error' ? '#FFEBEE' : '#E8F5E9',
    textAlign: 'center' as 'center',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px',
  }),
    attendanceSection: {
    display: 'flex',
    justifyContent: 'space-between', // 左右に配置
    alignItems: 'flex-start',        // 上揃え
    gap: '20px',                     // コンポーネント間の隙間
    flexWrap: 'wrap',                // 画面が狭いときは縦に折り返す
    marginTop: '30px',
  },
  attendanceItem: {
    flex: '1',                       // 均等幅
    minWidth: '350px',               // 狭すぎないよう最低幅
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },

};


export default DashboardPage;        