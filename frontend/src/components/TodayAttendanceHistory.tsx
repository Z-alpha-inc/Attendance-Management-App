import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type TodayRecord = {
  id: string;
  clockIn: string;
  clockOut: string | null;
};

type Props = {
  authorizedFetch: (url: string, method: string) => Promise<any>;
};

const TodayAttendanceHistory: React.FC<Props> = ({ authorizedFetch }) => {
  const [records, setRecords] = useState<TodayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchTodayRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authorizedFetch('/me/today-records', 'GET'); // ←今日の打刻だけ返すエンドポイント

      // 返却データは [{ id, clockIn, clockOut }, ...] の想定
      const todayRecords: TodayRecord[] = res.map((r: any) => ({
        id: r.id,
        clockIn: r.clockIn,
        clockOut: r.clockOut ?? null,
      }));

      setRecords(todayRecords);
    } catch (err: any) {
      setError(err.message || '今日の勤怠取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatJST = (utcString: string | null) => {
  if (!utcString) return '-';
  const date = new Date(utcString);
  if (isNaN(date.getTime())) return '-';
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000); // UTC+9
  return jst.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
};


  useEffect(() => {
    fetchTodayRecords();
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (records.length === 0) return <p>本日の打刻履歴はありません</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', marginTop: '20px' }}>
      <h3>本日の打刻履歴</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>出勤</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>退勤</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {formatJST(record.clockIn)}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {formatJST(record.clockOut)}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <button
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/attendance/edit/${record.id}`)}
                >
                  修正
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TodayAttendanceHistory;
