import React from 'react';

/**
 * 出勤・退勤ボタンコンポーネント
 * @param {boolean} isClockedIn - 現在勤務中かどうか
 * @param {function} authorizedFetch - 認証トークン付きAPI通信関数 (useApiフックから取得)
 * @param {function} onActionSuccess - 成功時のデータ再取得コールバック
 * @param {function} setFlashMessage - フラッシュメッセージを設定する関数
 */
const ClockingButtons = ({ isClockedIn, authorizedFetch, onActionSuccess, setFlashMessage }) => {
    
    // 未打刻の状態でボタンが押せる
    const isClockInEnabled = !isClockedIn;
    // 勤務中の状態でボタンが押せる
    const isClockOutEnabled = isClockedIn;

    /**
     * 出勤処理: FastAPIの /me/clock-in エンドポイントを叩く
     */
    const handleClockIn = async () => {
        setFlashMessage(null);
        try {
            // 🚨 パスを /me/clock-in に修正 🚨
            const data = await authorizedFetch('/me/clock-in', 'POST'); 
            
            setFlashMessage({ type: 'success', text: data.message || '出勤打刻が完了しました！' });
            onActionSuccess(); // ← ここで fetchStatus が呼ばれる
        } catch (error) {
            setFlashMessage({ type: 'error', text: error.message || '出勤打刻に失敗しました。' });
            console.error('Clock In Error:', error);
        }
    };

    /**
     * 退勤処理: FastAPIの /me/clock-out エンドポイントを叩く
     */
    const handleClockOut = async () => {
        setFlashMessage(null);
        try {
            // 🚨 パスを /me/clock-out に修正 🚨
            const data = await authorizedFetch('/me/clock-out', 'POST'); 

            const workedMinutes = data.workedMinutes || '計測不能';
            setFlashMessage({ type: 'success', text: `退勤打刻が完了しました。実働 ${workedMinutes} 分。` });
            onActionSuccess();

        } catch (error) {
            setFlashMessage({ type: 'error', text: error.message || '退勤打刻に失敗しました。' });
            console.error('Clock Out Error:', error);
        }
    };

    const baseStyle = (isEnabled) => `
        py-3 px-6 text-lg font-bold rounded-xl border-2 transition-all duration-200 shadow-lg 
        ${isEnabled ? 'cursor-pointer transform hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-50'}
    `;

    return (
        <div className="flex gap-6 justify-center my-8">
            {/* 出勤ボタン */}
            <button 
                onClick={handleClockIn} 
                disabled={!isClockInEnabled}
                className={baseStyle(isClockInEnabled)}
                style={{
                    backgroundColor: isClockInEnabled ? '#10B981' : '#E5E7EB', // Tailwind: emerald-500 / gray-200
                    color: isClockInEnabled ? 'white' : '#6B7280', // Tailwind: gray-500
                    borderColor: isClockInEnabled ? '#059669' : '#D1D5DB' // Tailwind: emerald-600 / gray-300
                }}
            >
                出勤
            </button>
            
            {/* 退勤ボタン */}
            <button 
                onClick={handleClockOut} 
                disabled={!isClockOutEnabled}
                className={baseStyle(isClockOutEnabled)}
                style={{
                    backgroundColor: isClockOutEnabled ? '#EF4444' : '#E5E7EB', // Tailwind: red-500 / gray-200
                    color: isClockOutEnabled ? 'white' : '#6B7280', // Tailwind: gray-500
                    borderColor: isClockOutEnabled ? '#DC2626' : '#D1D5DB' // Tailwind: red-600 / gray-300
                }}
            >
                退勤
            </button>
        </div>
    );
};

export default ClockingButtons;
