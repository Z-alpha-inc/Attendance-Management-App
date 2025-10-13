import React, { useState, useEffect } from 'react';

const Clock = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => {
            clearInterval(timerId);
        };
    }, []); 

   
    const formatDate = (date: Date) => date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    const formatTime = (date: Date) => date.toLocaleTimeString('ja-JP');

    // スタイル
    const styles = {
        header: {
            textAlign: 'center' as 'center',
            marginBottom: '30px',
        },
        dateDisplay: {
            fontSize: '1.5rem',
            color: '#333'
        },
        timeDisplay: {
            fontSize: '3rem',
            fontWeight: 'bold',
            margin: '10px 0',
            color: '#111'
        },
    };

    return (
        <header style={styles.header}>
            <h2 style={styles.dateDisplay}>{formatDate(currentTime)}</h2>
            <div style={styles.timeDisplay}>{formatTime(currentTime)}</div>
        </header>
    );
};

export default Clock;