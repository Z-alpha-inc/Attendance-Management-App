import React from 'react';

// Dateオブジェクトを日本語の時刻形式 (HH:MM:SS) に変換するヘルパー関数
const formatTime = (isoString) => {
    if (!isoString) return '---';
    try {
        // FastAPIから渡されるISO文字列をDateオブジェクトに変換
        const date = new Date(isoString); 
        // 日本語環境で時分秒を表示
        return date.toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false // 24時間表示
        });
    } catch (e) {
        return '時刻形式エラー';
    }
};

/**
 * 当日の打刻履歴を表示するコンポーネント
 * @param {Array<Object>} records - 今日の勤怠セッションデータの配列
 * @param {function} openCorrectionModal - 修正モーダルを開く関数（今回はダミー）
 */
const TodayAttendanceHistory = ({ records, openCorrectionModal }) => {
    
    // データがない場合の表示
    if (!records || records.length === 0) {
        return (
            <section style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                <p>今日の打刻履歴はまだありません。</p>
            </section>
        );
    }
    
    // 打刻履歴を古い順にソート（出勤が早い順）
    const sortedRecords = [...records].sort((a, b) => 
        new Date(a.clock_in_time).getTime() - new Date(b.clock_in_time).getTime()
    );

    // ユーザーが自己修正できるかどうかのフラグを決定（今回は当日かつ未クローズセッションがある場合のみを想定）
    const canSelfCorrect = sortedRecords.some(r => r.status === '勤務中' && r.self_correction_count === 0);

    return (
        <section style={{ marginTop: '30px', borderTop: '2px solid #007bff', paddingTop: '20px' }}>
            <h2 style={{ fontSize: '1.5em', marginBottom: '15px' }}>本日の打刻履歴</h2>
            
            <table style={styles.table}>
                <thead style={styles.thead}>
                    <tr>
                        <th style={styles.th}>セッションID (確認用)</th>
                        <th style={styles.th}>出勤時刻</th>
                        <th style={styles.th}>退勤時刻</th>
                        <th style={styles.th}>休憩 (分)</th>
                        <th style={styles.th}>実働 (分)</th>
                        <th style={styles.th}>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedRecords.map((record) => (
                        <tr key={record.id} style={record.status === '勤務中' ? styles.activeRow : {}}>
                            <td style={{ ...styles.td, fontSize: '0.7em' }}>{record.id}</td>
                            <td style={styles.td}>
                                <strong>{formatTime(record.clock_in_time)}</strong>
                            </td>
                            <td style={styles.td}>
                                {record.clock_out_time ? formatTime(record.clock_out_time) : '---'}
                            </td>
                            <td style={styles.td}>
                                {record.break_minutes !== undefined ? `${record.break_minutes}分` : 'N/A'}
                            </td>
                            <td style={styles.td}>
                                {record.worked_minutes !== undefined ? `${record.worked_minutes}分` : '---'}
                            </td>
                            <td style={styles.td}>
                                {
                                    // 修正ボタンの表示ロジック (MVP要件: 当日中、1回まで)
                                    record.status === '退勤済' && record.self_correction_count < 1 && (
                                        <button 
                                            onClick={() => openCorrectionModal(record.id)} 
                                            style={styles.correctionButton}
                                        >
                                            修正
                                        </button>
                                    )
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

// 簡易的なCSSスタイル
const styles = {
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '15px',
    },
    thead: {
        backgroundColor: '#f8f9fa',
        textAlign: 'left',
    },
    th: {
        border: '1px solid #dee2e6',
        padding: '12px',
        fontWeight: 'bold',
        fontSize: '0.9em'
    },
    td: {
        border: '1px solid #dee2e6',
        padding: '12px',
        fontSize: '0.95em',
        verticalAlign: 'middle'
    },
    activeRow: {
        backgroundColor: '#e6ffe6', // 勤務中のセッションをハイライト
    },
    correctionButton: {
        padding: '5px 10px',
        fontSize: '13px',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#ffc107',
        cursor: 'pointer'
    }
};

export default TodayAttendanceHistory;
