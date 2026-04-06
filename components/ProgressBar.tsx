"use client";

import React, { useEffect, useState } from 'react';

export default function ProgressBar({ loading, color = '#10b981' }: { loading: boolean, color?: string }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [transitionSpeed, setTransitionSpeed] = useState('0s');

  useEffect(() => {
    let timeout1: any, timeout2: any, timeout3: any;

    if (loading) {
      setVisible(true);
      setOpacity(1);
      setProgress(0);
      setTransitionSpeed('0s');
      
      timeout1 = setTimeout(() => {
        setProgress(85);
        setTransitionSpeed('800ms cubic-bezier(0.1, 0.7, 0.1, 1)');
        
        timeout2 = setTimeout(() => {
          setProgress(95);
          setTransitionSpeed('3000ms cubic-bezier(0.1, 0.7, 0.1, 1)');
        }, 800);
      }, 50);
      
    } else {
      if (visible) {
        setProgress(100);
        setTransitionSpeed('200ms ease-out');
        
        timeout1 = setTimeout(() => {
          setOpacity(0);
          
          timeout2 = setTimeout(() => {
            setVisible(false);
            setProgress(0);
            setTransitionSpeed('0s');
          }, 400); 
        }, 200); 
      }
    }

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [loading, visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: `${progress}%`,
        backgroundColor: color,
        zIndex: 99999,
        transition: `width ${transitionSpeed}, opacity 400ms ease`,
        opacity: opacity,
        boxShadow: `0 0 10px ${color}, 0 0 5px ${color}`
      }}
    />
  );
}
