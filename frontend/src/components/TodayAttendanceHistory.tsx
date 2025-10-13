import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type TodayRecord = {
  status: string;
  clock_in?: string;
  clock_out?: string;
  workedMinutes?: number;
};

type Props = {
  authorizedFetch: (url: string, method: string) => Promise<Response>;
};

const TodayAttendanceHistory: React.FC<Props> = ({ authorizedFetch }) => {
  const [record, setRecord] = useState<TodayRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchTodayRecord = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authorizedFetch('/me/status', 'GET');
      
      console.log("今日の勤怠:", res);
      setRecord(res);
    } catch (err: any) {
      setError(err.message || '今日の勤怠取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatJST = (utcString?: string) => {
    if (!utcString) return '-';
    const date = new Date(utcString);
    if (isNaN(date.getTime())) return '-';
    const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000); // UTC+9
    return jst.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    fetchTodayRecord();
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!record || record.status === "not_clocked_in") return <p>本日の打刻履歴はありません。</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', marginTop: '20px' }}>
      <h3>本日の打刻履歴</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>出勤時刻</th>
            <th style={thStyle}>退勤時刻</th>
            <th style={thStyle}>勤務時間</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}>{formatJST(record.clock_in)}</td>
            <td style={tdStyle}>{formatJST(record.clock_out)}</td>
            <td style={tdStyle}>
              {record.workedMinutes ? `${(record.workedMinutes / 60).toFixed(2)} 時間` : '-'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// スタイル共通化
const thStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '8px',
  backgroundColor: '#f9f9f9',
  textAlign: 'center',
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'center',
};

export default TodayAttendanceHistory;
