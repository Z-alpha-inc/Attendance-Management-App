// components/MonthlyAttendance.tsx
import React, { useEffect, useState } from 'react';

type DailyRecord = {
  date: string;
  workedMinutes: number;
  workedHours: number;
};

type MonthlyAttendanceResponse = {
  month: string;
  totalMinutes: number;
  totalHours: number;
  records: DailyRecord[];
};

type Props = {
  authorizedFetch: (url: string, method: string) => Promise<any>;

};

const MonthlyAttendance: React.FC<Props> = ({ authorizedFetch }) => {
  const [data, setData] = useState<MonthlyAttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authorizedFetch('/me/attendance', 'GET');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'データ取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!data) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>{data.month}月 の勤怠</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>日付</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>勤務時間（分）</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>勤務時間（時間）</th>
          </tr>
        </thead>
        <tbody>
          {data.records.map(record => (
            <tr key={record.date}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{record.date}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{record.workedMinutes}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{record.workedHours}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>合計</td>
            <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>
              {data.totalMinutes}
            </td>
            <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>
              {data.totalHours}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default MonthlyAttendance;
